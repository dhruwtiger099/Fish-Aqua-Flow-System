# Aqua Flow System security checklist

This project now has a Supabase security baseline and a server-auth boundary. The Google Apps Script integration remains a migration/legacy adapter and must not be the long-term public API for sensitive farm data.

## Implemented

- [x] Supabase Auth integration boundary in `src/services/auth.js` using `credentials: include`.
- [x] Frontend login page uses server `/api/auth/login`, `/session` and `/logout` endpoints; it no longer creates a fake local login session.
- [x] Self-service signup UI accepts a user-selected name, username, email and password, then requires email verification through the server/Supabase Auth flow.
- [x] Local development fallback hashes passwords with browser PBKDF2 and never stores plaintext credentials; it is disabled automatically for production builds.
- [x] `.env.example` separates public Vite values from server-only secrets.
- [x] Supabase schema adds `farms`, `farm_members`, tenant ownership (`farm_id`) and indexes.
- [x] RLS is enabled on all application tables and membership-based select/insert policies are included.
- [x] Roles are constrained to `admin` and `user` in the database. Admin mutations are intended to run through the authenticated server API.
- [x] Google Sheets reads are allow-listed and capped at 500 rows.
- [x] Uploads validate size, MIME type and filename.
- [x] Frontend data requests have timeout and safe GET retry behavior; non-idempotent POST writes are not retried automatically.
- [x] Technical errors are not rendered by the login UI; authentication errors use a generic server message contract.

## Required before production

- [ ] Create Supabase project and configure email verification, password reset and MFA (TOTP/WebAuthn) in Auth settings.
- [ ] Implement `/api/auth/*` on a server runtime. Exchange Supabase sessions server-side and set short-lived access plus rotating refresh tokens as `Secure; HttpOnly; SameSite=Lax` cookies.
- [ ] Use Argon2id/bcrypt only if passwords are handled by a custom auth service. With Supabase Auth, never store or hash passwords in application tables.
- [ ] Configure `ALLOWED_ORIGINS` and reject all other origins. Do not use `*` with credentials.
- [ ] Add CSRF protection: validate an Origin/Referer allow-list and a synchronizer/double-submit token for every cookie-authenticated state-changing request.
- [ ] Add response headers: strict CSP with nonces, HSTS in production, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `frame-ancestors 'none'`.
- [ ] Add Redis-backed per-IP and per-account login limits, exponential delay and temporary lockout after repeated failures. Return generic errors to prevent account enumeration.
- [ ] Validate every API body/query/path with Zod before business logic. Use parameterized SQL only; never concatenate user input into SQL or HTML.
- [ ] Add server-side role and farm membership checks to every route. Never trust `user_metadata` for authorization; use `farm_members` or trusted `app_metadata`.
- [ ] Add audit events for login success/failure, role changes, exports, purchases, stock changes, expenses, harvests and deletes. Scrub passwords, tokens and unnecessary personal data.
- [ ] Configure Sentry with PII scrubbing and request IDs. Return generic production errors with the request ID only.
- [ ] Backfill `farm_id` in the Supabase migration before granting production access; verify with an RLS test matrix for admin, user, wrong farm and anonymous requests.
- [ ] Run Supabase advisors, dependency audit, OWASP ZAP baseline and k6 load tests before release.

## Migration commands

1. Review `supabase/migrations/202611040001_security_baseline.sql` and choose the initial farm/member backfill.
2. Apply it through the Supabase dashboard or authenticated Supabase CLI.
3. Enable email confirmation and MFA in Supabase Auth.
4. Deploy the server auth/API layer with only server-side secrets.
5. Remove direct browser writes to Google Apps Script after API cutover.

The SQL migration is intentionally not marked as fully production-ready until existing rows are assigned to a farm. Enabling RLS without that backfill would correctly hide those rows.
