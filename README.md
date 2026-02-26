# Audit Console — Correctness & Reliability Guardrails (200 / 409 / 429 / 503)

A tiny audit-log ingestion service designed to demonstrate **correctness under retries**, **immutability enforcement**, **backpressure via rate limiting**, and **resilience to dependency failures**.

The system models reliability guardrails commonly used in distributed systems such as internal AWS tooling, compliance pipelines, and audit logging systems.

---

# What this app proves

## 1) 200 OK — Idempotent duplicates (safe retries)

If the same `(tenantId, eventId)` is ingested more than once **with the same immutable payload**, the server treats it as a safe retry and returns:

- **200 OK**
- `status: "duplicate_accepted"`

This models **at-least-once delivery** behavior where clients may retry due to timeouts, network errors, or uncertain acknowledgements.

Duplicate ingestion does not create multiple records, ensuring **exactly-once storage semantics at the application level**.

---

## 2) 409 Conflict — Immutability / write-once semantics

If the same `(tenantId, eventId)` is ingested again but **immutable fields differ**, the server rejects the request:

- **409 Conflict**
- `status: "conflict"`

This enforces **write-once audit semantics**.

Once an event is created, its immutable fields cannot change. This pattern is common in **security logging, compliance systems, and audit pipelines** where historical records must remain tamper-resistant.

---

## 3) 429 Too Many Requests — Rate limiting / backpressure

If a client exceeds the configured request budget within a time window, the server returns:

- **429 Too Many Requests**
- `Retry-After` header (seconds)
- JSON body includes `retryAfterMs`

This protects storage and downstream systems during bursts and provides deterministic client backoff guidance.

Typical real-world motivations include:

- retry storms
- burst traffic
- misconfigured clients

---

## 4) 503 Service Unavailable — Circuit breaker protection

If the downstream dependency (simulated storage layer) fails repeatedly, the service opens a **circuit breaker**.

Behavior:

- repeated dependency failures trigger the breaker
- the service temporarily rejects requests with **503 Service Unavailable**
- after a cooldown period, the circuit transitions to **half-open** and allows a probe request

Responses include:

- **503 Service Unavailable**
- `reason: "dependency_failure"` or `"circuit_open"`

This prevents cascading failures and protects system availability while dependencies recover.

---

## 5) Observability — Request tracing & structured logs

Every request generates a structured log event containing:

- request correlation ID (`reqId`)
- HTTP method and path
- status code
- latency (ms)
- tenantId
- eventId
- reason (created, duplicate, conflict, rate_limited, dependency_failure)

Example log output:

```json
{
  "type": "http_request",
  "reqId": "1700000000000-0.1234",
  "method": "POST",
  "path": "/api/events",
  "tenantId": "tenant-1",
  "eventId": "evt-123",
  "status": 201,
  "reason": "created",
  "latencyMs": 3
}