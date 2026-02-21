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

app.post("/api/events", rateLimitPostEvents, (req, res) => {
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
    return res.status(200).json({ status: "duplicate_accepted", eventId: e.eventId });
  }

  eventFingerprints.set(key, incomingFp);
  events.push(e as AuditEvent);
  return res.status(201).json({ status: "created", eventId: e.eventId });
});

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

