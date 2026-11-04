# Server security contract

The current repository has a browser client and Google Apps Script adapter, not a running Node API. The production API must implement this contract before the app is exposed publicly:

1. Validate `Origin` against `ALLOWED_ORIGINS`; emit CORS headers only for an allowed origin and never use `Access-Control-Allow-Origin: *` with credentials.
2. Require a CSRF token plus an allowed `Origin` for every cookie-authenticated `POST`, `PUT`, `PATCH` and `DELETE` request.
3. Set `Content-Security-Policy` with a per-request nonce, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` and `frame-ancestors 'none'`.
4. Use Supabase Auth server-side. Refresh tokens are rotating, `Secure`, `HttpOnly`, `SameSite=Lax` cookies; access tokens are short-lived. Never expose `SUPABASE_SERVICE_ROLE_KEY`.
5. Apply Zod validation before the service layer and parameterized SQL in repositories. Never interpolate request values into SQL, HTML or sheet formulas.
6. Rate-limit login by account and IP in Redis, add exponential backoff, and temporarily lock accounts after repeated failures. Use the same response for unknown and known accounts.
7. Write structured audit events for authentication, authorization changes and financial/stock mutations. Scrub secrets and personal data.

These controls belong at the API edge/server, not in React. The React client only sends credentials over HTTPS with `credentials: include` and renders generic error messages.
