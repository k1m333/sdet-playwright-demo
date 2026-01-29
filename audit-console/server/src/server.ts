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
const app = express();
app.use(cors());
app.use(express.json());
const events: AuditEvent[] = [];
const seenEventIds = new Set<string>();
app.post("/api/events", (req, res) => {
    const e = req.body as Partial<AuditEvent>;
    if (!e.eventId || !e.tenantId || !e.actor || !e.action || !e.resource || !e.ts) {
    return res.status(400).json({ error: "Missing required fields" });
}
// Idempotency: same eventId => accept but don't duplicate
if (seenEventIds.has(e.eventId)) {
    return res.status(200).json({ status: "duplicate_accepted", eventId: e.eventId });
}
seenEventIds.add(e.eventId);
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