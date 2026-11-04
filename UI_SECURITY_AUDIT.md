# UI, security and performance audit

## Priority 0 — fixed in this pass

- **Unbounded Google Sheets access:** the Apps Script now allow-lists readable/writable tabs and caps reads at 500 rows.
- **Unbounded attachment uploads:** browser and Apps Script validate a 10 MB limit, permitted MIME types and a sanitized filename.
- **Duplicated network code:** Google Sheets reads/writes now use one timeout/retry/request boundary. POST writes are never blindly retried.
- **Excessive polling:** the previous 3-second, seven-request sync loop is now 30 seconds and skips overlapping syncs.
- **Stale-data ambiguity:** sync failures expose a visible status banner instead of silently looking healthy.
- **Visual inconsistency:** shared `Button`, `Input`, `Modal` and `Table` primitives plus a neutral token system live in `src/shared/ui` and `src/styles/design-system.css`.

## Priority 1 — next production release

- **Public Apps Script endpoint:** move writes and authenticated reads behind a server API with session authentication, per-farm authorization, CSRF protection and server-side rate limiting. A Vite environment variable is not a secret because it ships to the browser.
- **LocalStorage as a source of truth:** localStorage is currently a compatibility cache. After PostgreSQL cutover, remove write authority from the browser and invalidate cached records after every successful server mutation.
- **Error leakage:** production error boundaries should show a request ID and generic message; send the technical error to Sentry. Do not render raw backend messages.
- **Optimistic writes:** purchase, stock, feed, expense and sale mutations should be API transactions with idempotency keys; update UI only after the server confirms.
- **Accessibility regression coverage:** add Playwright axe checks for each modal, keyboard focus trapping, 44px touch targets, contrast and mobile overflow.

## Priority 2 — maintainability and scale

- **Large files:** `src/style.css`, `src/context/FarmContext.jsx`, `src/components/PurchaseModal.jsx` and `src/views/ReportsView.jsx` are the largest risk. Move each feature's calculations and API calls into its feature folder incrementally; keep the context as a composition boundary.
- **Repeated row mapping:** normalize headers once in feature services. Do not repeat positional indexes in views or context.
- **Backend N+1 risk:** repositories must use named-column queries and joins/aggregates for reports. Add query-count assertions to report tests and inspect `EXPLAIN (ANALYZE, BUFFERS)` before release.
- **Missing tests:** add service mapping tests first, then mutation transaction tests, then responsive component and end-to-end tests. The current app had no test runner, so this audit does not claim test coverage that does not exist.
- **Dependency vulnerabilities:** `npm install` reported moderate audit findings. Review with `npm audit`; upgrade only after checking Vite/React compatibility.

## Design decisions

- Primary accent: `#0B7285`.
- Neutral text/surfaces/borders; no decorative gradients or animated bubbles.
- 8px spacing grid and two body sizes (`0.875rem`, `1rem`), with restrained heading sizes.
- 8px control radius; cards use borders and spacing rather than layered glass effects.
- Icons come from `lucide-react`; emoji are not used as interface controls.
- Loading, empty, error and success states must be explicit at the feature boundary.
