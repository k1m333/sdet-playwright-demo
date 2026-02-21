# Audit Console — Correctness Guardrails (200 / 409 / 429)

A tiny audit-log ingestion service designed to demonstrate **correctness under retries**, **immutability enforcement**, and **backpressure via rate limiting**.

## What this app proves

### 1) 200 OK — Idempotent duplicates (safe retries)
If the same `(tenantId, eventId)` is ingested more than once **with the same immutable payload**, the server treats it as a safe retry and returns:

- **200 OK**
- `status: "duplicate_accepted"`

This models *at-least-once delivery* behavior where clients may retry due to timeouts, network errors, or uncertain acknowledgements.

### 2) 409 Conflict — Immutability / write-once semantics
If the same `(tenantId, eventId)` is ingested again but **immutable fields differ**, the server rejects the request:

- **409 Conflict**
- `status: "conflict"`

This prevents an audit event from being mutated after creation (write-once correctness rule).

### 3) 429 Too Many Requests — Rate limiting / backpressure
If a client exceeds the configured request budget within a time window, the server returns:

- **429 Too Many Requests**
- `Retry-After` header (seconds)
- JSON body includes `retryAfterMs`

This protects storage and downstream systems during bursts and provides deterministic client backoff guidance.
