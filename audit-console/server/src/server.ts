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

app.post("/api/events", (req, res) => {
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

