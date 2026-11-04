# Production backend checklist

## Recommended topology

```text
Browser → API Functions/Service → PgBouncer/managed PostgreSQL
                         ├──────→ Redis cache + rate limiter
                         └──────→ Durable queue → workers
                                      ├─ reports
                                      ├─ Sheets imports
                                      └─ email/attachments
```

The existing Google Apps Script is the source adapter during migration only. After cutover, writes go to PostgreSQL first; a queue can optionally publish a Sheets export while the legacy sheet remains a read-only audit copy.

## Database and query rules

- Use `backend/sql/001_initial_schema.sql` as the normalized starting point.
- List endpoints must select named columns and use `limit <= 100` plus keyset cursors.
- Use the supplied indexes for cycle/date, inventory category/stock, expenses, feed logs and sales.
- Keep connection pools module-scoped and bounded; never create a pool per request.
- Add query timing and slow-query logging before production cutover.

## Background work

Return `202` for exports/imports. Queue payloads must include an idempotency key, actor ID, tenant/farm ID, and schema version. Workers need retry limits, dead-letter handling, visibility timeout, and a status table keyed by job ID.

## Security and consistency

- Authenticate every API request; authorize by farm/tenant and role.
- Apply Redis-backed per-user/IP rate limits and request body limits.
- Validate all external values at the API boundary; parameterize every SQL query.
- Use optimistic `version` checks for normal edits and row locks for stock/biomass movements.
- Log audit events without passwords, tokens, or unnecessary personal data.

## Health and monitoring

Implement `GET /health/live` and `GET /health/ready`. Add Sentry to the API and workers, propagate `x-request-id`, and record metrics for request latency, 4xx/5xx, database pool saturation, queue depth, cache hit rate, migration failures and import lag.

## k6 load plan

Run `k6 run -e API_URL=https://api.example.com load-tests/k6.js` after staging has production-like indexes, pool limits and cache configuration.

1. Warm-up: 50 VUs for 2 minutes.
2. Main test: 1,000 concurrent users for 5 minutes using dashboard summary, paginated inventory, purchase list and report-summary reads.
3. Write test: 30 writes/minute with unique idempotency keys and optimistic-lock conflicts.
4. Queue test: enqueue 100 report jobs and verify HTTP stays below the API latency threshold while workers drain the queue.
5. Failure test: pause Redis/database briefly and verify timeout, retry, `429`, `503`, dead-letter and recovery behavior.

Pass criteria: <1% failed requests, p95 under 500ms, p99 under 1s for cached reads, no lost writes, no duplicate migration rows, and database/queue saturation below 70% during the steady-state test.
