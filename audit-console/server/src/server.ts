import express from "express";
import cors from "cors";
    type AuditEvent = {
    eventId: string;
    tenantId: string;
    actor: string;
    action: string;
    resource: string;
    ts: string;
};
import crypto from "node:crypto";

// ---- 503 Circuit Breaker (simulated dependency failures) ----
let failures = 0;
let circuitOpen = false;
let lastFailureTime = 0;

const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 10_000;

function checkCircuit(res: express.Response) {
  if (circuitOpen) {
    const now = Date.now();
    if (now - lastFailureTime > COOLDOWN_MS) {
      circuitOpen = false; // half-open: allow a try
      failures = 0;
      return false;
    }
    res.status(503).json({ error: "service_unavailable", reason: "circuit_open" });
    return true;
  }
  return false;
}

function recordFailure() {
  failures += 1;
  lastFailureTime = Date.now();
  if (failures >= FAILURE_THRESHOLD) {
    circuitOpen = true;
  }
}

function recordSuccess() {
  failures = 0;
  circuitOpen = false;
}

// make a stable "fingerprint" of the immutable parts of the event
function stableStringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}
function fingerprintEvent(e) {
  // include exactly the fields you consider immutable
  const immutable = {
    tenantId: e.tenantId,
    actor: e.actor,
    action: e.action,
    resource: e.resource,
    // if you have timestamp, decide if it’s immutable or not
    // ts: e.ts,
  };
  return crypto.createHash("sha256").update(stableStringify(immutable)).digest("hex");
}

const app = express();
app.use(cors());
app.use(express.json());
// ---- observability: request id + latency + structured logs ----
type ReqCtx = {
  reqId: string;
  startMs: number;
  tenantId?: string;
  eventId?: string;
  reason?: string; // "created" | "duplicate_accepted" | "conflict" | "bad_request" | ...
};

function getHeaderString(req: express.Request, name: string): string | undefined {
  const v = req.header(name);
  return v ? String(v) : undefined;
}

function makeReqId(req: express.Request) {
  return getHeaderString(req, "x-request-id") ?? `${Date.now()}-${Math.random()}`;
}

function logEvent(ctx: {
  type: string;
  reqId: string;
  method: string;
  path: string;
  status: number;
  reason: string;
  latencyMs: number;
  tenantId?: string;
  eventId?: string;
}) {
  console.log({
    type: ctx.type,
    reqId: ctx.reqId,
    method: ctx.method,
    path: ctx.path,
    tenantId: ctx.tenantId,
    eventId: ctx.eventId,
    status: ctx.status,
    reason: ctx.reason,
    latencyMs: ctx.latencyMs,
  });
}

app.use((req, res, next) => {
  const reqId = makeReqId(req);

  res.setHeader("x-request-id", reqId);

  const ctx: ReqCtx = {
    reqId,
    startMs: Date.now(),
  };

  (req as any).ctx = ctx;

  res.on("finish", () => {
    const c = (req as any).ctx as ReqCtx | undefined;

    const latencyMs = c ? Date.now() - c.startMs : 0;

    logEvent({
      type: "http_request",
      reqId: c?.reqId ?? "unknown",
      method: req.method,
      path: req.path,
      status: res.statusCode,
      reason: c?.reason ?? "unknown",
      latencyMs,
      tenantId: c?.tenantId,
      eventId: c?.eventId,
    });
  });

  next();
});

const events: AuditEvent[] = [];
const eventFingerprints = new Map<string, string>();

type Bucket = { count: number; resetAtMs: number };

function createRateLimiter(opts: {
  windowMs: number; // e.g. 10_000
  max: number;      // e.g. 5
  keyFn?: (req: express.Request) => string;
}) {
  const { windowMs, max } = opts;
  const keyFn =
    opts.keyFn ??
    ((req) => {
      const tenant = (req.body?.tenantId ?? req.query?.tenantId) as string | undefined;
      return tenant?.trim() ? `tenant:${tenant.trim()}` : `ip:${req.ip || "unknown"}`;
    });

  const buckets = new Map<string, Bucket>();

  // Light GC to avoid unbounded growth
  const GC_EVERY_MS = 60_000;
  let lastGc = Date.now();

  return function rateLimit(req: express.Request, res: express.Response, next: express.NextFunction) {
    const now = Date.now();

    if (now - lastGc > GC_EVERY_MS) {
      lastGc = now;
      for (const [k, b] of buckets.entries()) {
        if (b.resetAtMs <= now) buckets.delete(k);
      }
    }

    const key = keyFn(req);
    const b = buckets.get(key);

    if (!b || b.resetAtMs <= now) {
      buckets.set(key, { count: 1, resetAtMs: now + windowMs });
      return next();
    }

    b.count += 1;

    if (b.count > max) {
      const retryAfterMs = Math.max(0, b.resetAtMs - now);
      res.setHeader("Retry-After", String(Math.ceil(retryAfterMs / 1000)));
      return res.status(429).json({
        error: "rate_limited",
        retryAfterMs,
        limit: max,
        windowMs,
      });
    }

    return next();
  };
}

const rateLimitPostEvents = createRateLimiter({
  windowMs: 10_000,
  max: 5,
});

async function persistEventOrThrow(req: express.Request, e: AuditEvent) {
  // Simulate an outage using a header OR env var
  const forceFailHeader = String(req.header("x-simulate-db-down") ?? "").toLowerCase();
  const forceFailEnv = String(process.env.SIMULATE_DB_DOWN ?? "").toLowerCase();

  const shouldFail =
    forceFailHeader === "1" ||
    forceFailHeader === "true" ||
    forceFailEnv === "1" ||
    forceFailEnv === "true";

  if (shouldFail) {
    throw new Error("Simulated dependency failure");
  }

  // “Write” succeeds: keep your existing in-memory store behavior
  events.push(e);
}

app.post(
  "/api/events",
  (req, res, next) => {
    if (checkCircuit(res)) {
      const ctx = (req as any).ctx as ReqCtx;
      ctx.reason = "circuit_open";
      return;
    }
    next();
  },
  rateLimitPostEvents,
  async (req, res) => {
    const ctx = (req as any).ctx as ReqCtx;

    try {
      const e = req.body as Partial<AuditEvent>;

      // attach identifiers early for logging
      ctx.tenantId = e?.tenantId;
      ctx.eventId = e?.eventId;

      if (!e.eventId || !e.tenantId || !e.actor || !e.action || !e.resource || !e.ts) {
        ctx.reason = "bad_request_missing_fields";
        return res.status(400).json({ error: "Missing required fields" });
      }

      const key = `${e.tenantId}:${e.eventId}`;
      const incomingFp = fingerprintEvent(e);

      const existingFp = eventFingerprints.get(key);
      if (existingFp) {
        if (existingFp !== incomingFp) {
          ctx.reason = "conflict_immutable_event";
          return res.status(409).json({
            status: "conflict",
            eventId: e.eventId,
            message: "eventId already exists with different payload (immutable event)",
          });
        }

        recordSuccess();
        ctx.reason = "duplicate_accepted";
        return res.status(200).json({ status: "duplicate_accepted", eventId: e.eventId });
      }

      eventFingerprints.set(key, incomingFp);

      await persistEventOrThrow(req, e as AuditEvent);

      recordSuccess();
      ctx.reason = "created";
      return res.status(201).json({ status: "created", eventId: e.eventId });
    } catch (err) {
      const e = req.body as Partial<AuditEvent>;
      if (e?.tenantId && e?.eventId) {
        eventFingerprints.delete(`${e.tenantId}:${e.eventId}`);
      }

      recordFailure();
      ctx.reason = "dependency_failure";
      return res.status(503).json({
        error: "service_unavailable",
        reason: "dependency_failure",
        failures,
        circuitOpen,
      });
    }
  }
);

app.get("/api/events", (req, res) => {
  const ctx = (req as any).ctx as ReqCtx;

  const tenantId = String(req.query.tenantId ?? "");
  ctx.tenantId = tenantId || undefined;

  ctx.reason = "query_events";

  const q = String(req.query.q ?? "").toLowerCase();
  let out = events;

  if (tenantId) out = out.filter((e) => e.tenantId === tenantId);
  if (q) {
    out = out.filter((e) =>
      `${e.eventId} ${e.actor} ${e.action} ${e.resource}`.toLowerCase().includes(q)
    );
  }

  return res.json({ count: out.length, events: out });
});

type Severity = "NONE" | "LOW" | "MEDIUM" | "HIGH";

function severityRank(label: Severity): number {
  switch (label) {
    case "NONE": return 0;
    case "LOW": return 1;
    case "MEDIUM": return 2;
    case "HIGH": return 3;
  }
}

function classifyStatus(status: number): Severity {
  if (status === 503) return "HIGH";
  if (status === 429) return "MEDIUM";
  if (status === 409) return "LOW";
  if (status === 400 || status === 404) return "LOW";
  if (status >= 500) return "HIGH"; // other server errors
  if (status >= 400) return "LOW"; // other client-ish errors
  return "NONE"; // 2xx/3xx treated as NONE
}

app.post("/llm/classify-severity", (req, res) => {
  const events = (req.body?.events ?? []) as Array<{
    tenantId?: string;
    eventId?: string;
    status: number;
    reason?: string;
  }>;

  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({
      label: "LOW",
      rationale: "No events provided (400)."
    });
  }

  let winnerLabel: Severity = "NONE";
  let winnerStatuses: number[] = [];

  for (const e of events) {
    const label = classifyStatus(e.status);

    const labelIsHigher =
      severityRank(label) > severityRank(winnerLabel);

    if (labelIsHigher) {
      winnerLabel = label;
      winnerStatuses = [e.status];
    } else if (label === winnerLabel) {
      winnerStatuses.push(e.status);
    }
  }

  // Keep rationale deterministic and evidence-based (references status codes)
  const uniqueStatuses = Array.from(new Set(winnerStatuses)).sort((a, b) => a - b);
  const rationale = `Severity=${winnerLabel} based on status code(s): ${uniqueStatuses.join(", ")}.`;

  return res.status(200).json({
    label: winnerLabel,
    rationale
  });
});

app.post("/llm/respond", (req, res) => {
  const { prompt } = req.body;

  let responseText = "UNKNOWN";

  if (prompt === "2 + 2") responseText = "4";
  if (prompt === "10 - 3") responseText = "7";
  if (prompt === "Capital of France") responseText = "Paris";

  if (prompt.includes("Return JSON")) {
    responseText = JSON.stringify({
      tenantId: "t1",
      eventId: "e1"
    });
  }

  if (prompt.includes("hotwire")) {
    responseText = "I can't assist with that.";
  }

  res.json({ responseText });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

const port = Number(process.env.PORT ?? 4177);
app.listen(port, () => console.log(`audit-console server on http://localhost:${port}`));

