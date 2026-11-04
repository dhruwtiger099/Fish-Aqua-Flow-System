# PostgreSQL migration and production backend plan

The app currently reads and writes these Google Sheets tabs:

- `Inventory`
- `Purchase Order`
- `Farm Expenses & Maintenance`
- `Harvesting`
- `Feed Cycle`
- `Fish Lifecycle`
- `Master`

The normalized schema is in [`sql/001_initial_schema.sql`](sql/001_initial_schema.sql). The migration reads the first five transactional tabs and preserves the original sheet and row number for auditability.

## Migration

1. Copy `backend/.env.example` to the backend runtime environment.
2. Run the schema migration with your PostgreSQL migration runner.
3. Run `node backend/scripts/migrate-from-sheets.mjs` for validation only.
4. Review the JSON counts and validation errors.
5. Run `node backend/scripts/migrate-from-sheets.mjs --apply` to commit one transaction.

The importer has a 15-second source timeout, paged Sheet reads, required-field validation, duplicate-key validation, source-row uniqueness, and PostgreSQL upserts. It is intentionally dry-run by default.

## Production API shape

Use a stateless Node/TypeScript API (Vercel Functions or a small service) in front of PostgreSQL. A serverless-compatible pool should use a provider pooler such as PgBouncer/Neon pooling. The browser must call the API, never PostgreSQL or Sheets directly.

### Reliability requirements

- **Pagination:** Every list endpoint accepts `limit` and a cursor; use indexed keyset predicates such as `(updated_at, id) < ($cursorTime, $cursorId)`. Never use `SELECT *`; select named columns only.
- **Pooling:** Keep one module-level pool, set a low per-instance maximum, 5-second connection timeout, and release every client in `finally`.
- **Caching:** Cache read-heavy dashboard/catalog/report summaries in Redis with short TTLs and explicit invalidation after writes. Edge-cache only immutable/reference data; do not edge-cache user-specific financial data without authorization-aware keys.
- **Queues:** Put report generation, Sheets imports, attachment processing and email notifications on a durable queue. The HTTP request validates and enqueues a job, then returns `202 Accepted` plus a job ID.
- **Rate limiting:** Use Redis token bucket per user/IP and route. Suggested defaults: reads 120/minute, writes 30/minute, exports 5/minute; return `429` with `Retry-After`.
- **Timeouts/retries:** 5s DB connect, 10s normal API, 30s queued worker. Retry only idempotent transient failures with exponential backoff and jitter (250ms, 500ms, 1s, 2s; max 4 attempts). Never blindly retry a non-idempotent write.
- **Concurrent edits:** Every mutable row has `version`. Update with `WHERE id = $1 AND version = $2`, increment version in the same statement, and return `409 Conflict` when zero rows are updated.
- **Transactions:** A purchase, inventory movement and audit event are one transaction. A harvest sale and biomass decrement are one transaction. Use `SELECT ... FOR UPDATE` for balance-changing operations.
- **Health:** `/health/live` only checks process health. `/health/ready` checks PostgreSQL and Redis with short timeouts and returns dependency status without secrets.
- **Observability:** Emit structured JSON logs with request ID, user ID, route, latency, status, DB timing and job ID. Configure Sentry server-side with DSN from environment, release, environment, traces sample rate and PII scrubbing.

## Suggested service boundaries

```text
api/
├── inventory        list, adjust stock, low-stock summary
├── purchases        create order, receive order
├── lifecycle        create cycle, shift pond allocation
├── feeding          log feed, inventory deduction
├── expenses         create/list expense
├── sales            record harvest sale
├── reports          enqueue report, read cached summary
└── health           liveness/readiness
```

Each route calls a feature service, and each feature service calls repositories/queries. Repositories are the only layer allowed to issue SQL.
