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
    if (checkCircuit(res)) return;
    next();
  },
  rateLimitPostEvents,
  async (req, res) => {
    try {
      const e = req.body as Partial<AuditEvent>;
      if (!e.eventId || !e.tenantId || !e.actor || !e.action || !e.resource || !e.ts) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const key = `${e.tenantId}:${e.eventId}`;
      const incomingFp = fingerprintEvent(e);

      const existingFp = eventFingerprints.get(key);
      if (existingFp) {
        if (existingFp !== incomingFp) {
          return res.status(409).json({
            status: "conflict",
            eventId: e.eventId,
            message: "eventId already exists with different payload (immutable event)",
          });
        }
        // Duplicate accepted counts as "success" (dependency not called)
        recordSuccess();
        return res.status(200).json({ status: "duplicate_accepted", eventId: e.eventId });
      }

      // Reserve fingerprint before write (like a uniqueness constraint)
      eventFingerprints.set(key, incomingFp);

      // Simulated dependency write that can fail
      await persistEventOrThrow(req, e as AuditEvent);

      recordSuccess();
      return res.status(201).json({ status: "created", eventId: e.eventId });
    } catch (err) {
      // If the "DB write" fails, roll back the fingerprint reservation
      const e = req.body as Partial<AuditEvent>;
      if (e?.tenantId && e?.eventId) {
        eventFingerprints.delete(`${e.tenantId}:${e.eventId}`);
      }

      recordFailure();
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
    const tenantId = String(req.query.tenantId ?? "");
    const q = String(req.query.q ?? "").toLowerCase();
    let out = events;
    if (tenantId) out = out.filter(e => e.tenantId === tenantId);
    if (q) {
        out = out.filter(e =>
        `${e.eventId} ${e.actor} ${e.action} ${e.resource}`.toLowerCase().includes(q)
        );
    }
    return res.json({ count: out.length, events: out });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

const port = Number(process.env.PORT ?? 4177);
app.listen(port, () => console.log(`audit-console server on http://localhost:${port}`));

