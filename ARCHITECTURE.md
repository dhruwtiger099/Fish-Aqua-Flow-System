# Aqua Flow System — Architecture Guide

This document is the 15-minute map for a new developer. The application is a Vite + React app that currently uses JSX while the TypeScript strict baseline is prepared for incremental migration.

## 1. Project shape

```text
src/
├── features/
│   └── <feature>/
│       ├── components/   Feature UI only
│       ├── hooks/        Feature state, queries and commands
│       ├── services/     Feature use-cases and API orchestration
│       ├── types/        Domain models and DTOs
│       └── tests/        Unit/component tests
├── shared/
│   ├── ui/               Reusable visual primitives
│   ├── lib/              Infrastructure adapters, including dataClient
│   ├── utils/            Pure formatting and helper functions
│   └── config/           Environment and application configuration
├── App.jsx               Route/view composition (temporary legacy shell)
├── context/              Temporary compatibility state boundary
├── components/           Legacy shared components; migrate by feature ownership
├── views/                Legacy feature screens; migrate one feature at a time
└── services/             Legacy service facade; no new direct consumers
```

Feature folders currently scaffold the target architecture. Existing screens remain in `views/` during migration so the working product is not destabilized; new code must use the feature structure.

## 2. Folder responsibilities

| Layer           | Owns                                                          | Must not do                                                        |
| --------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `components/`   | Rendering, accessibility, user events, layout                 | Call `fetch`, read Google Sheets, or contain business calculations |
| `hooks/`        | React state, lifecycle, loading/error state, feature commands | Know visual layout or bypass feature services                      |
| `services/`     | Use-cases, DTO mapping, validation before persistence         | Render JSX or access DOM APIs                                      |
| `types/`        | Domain contracts, request/response shapes                     | Execute side effects                                               |
| `tests/`        | Behaviour tests for the feature layers                        | Depend on production localStorage/network without a test adapter   |
| `shared/ui`     | Reusable visual primitives                                    | Import feature-specific state                                      |
| `shared/lib`    | Cross-cutting infrastructure such as the HTTP/data client     | Know a screen's business rules                                     |
| `shared/utils`  | Pure deterministic helpers                                    | Read React state or call the database                              |
| `shared/config` | Environment/configuration                                     | Contain UI or business logic                                       |

## 3. Non-negotiable dependency flow

UI must never call the database directly. The only allowed direction is:

```text
User interaction
      ↓
Feature component (presentation)
      ↓
Feature hook (state + command)
      ↓
Feature service (use-case + mapping)
      ↓
Shared data client / infrastructure adapter
      ↓
Google Apps Script / database
      ↓
DTO mapping → domain model → hook state → UI
```

In this repository, `src/shared/lib/dataClient.js` is the new infrastructure boundary. `src/services/googleSheets.js` and `src/context/FarmContext.jsx` are compatibility layers for the existing screens. Do not add new `fetch` calls to components or views.

## 4. Add a new feature

1. Create `src/features/<name>/{components,hooks,services,types,tests}`.
2. Define the domain model and API DTO in `types/`.
3. Add a service in `services/` that uses `shared/lib/dataClient` and maps sheet/API data to the domain model.
4. Add a hook in `hooks/` for loading, errors, caching and mutations.
5. Build presentational components in `components/`; pass data and callbacks as props.
6. Add tests for the service mapping and the primary user flow.
7. Compose the feature from `App.jsx` or the route shell only through its public entry point.
8. Run `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build`.

Example:

```text
src/features/water-quality/
├── components/WaterQualityPanel.jsx
├── hooks/useWaterQuality.js
├── services/waterQualityService.js
├── types/waterQuality.js
└── tests/waterQualityService.test.js
```

## 5. Coding conventions

- Use feature-local imports for feature code; use `src/shared` for cross-feature primitives only.
- Components are PascalCase; hooks start with `use`; services end with `Service`; pure helpers use camelCase.
- Keep components presentational. Business calculations belong in hooks/services, not JSX markup.
- Keep service functions small and explicit: `list`, `get`, `create`, `update`, `remove`.
- Normalize external sheet/API rows once at the service boundary. UI receives stable domain objects.
- Represent loading, empty, error and success states explicitly.
- Never silently swallow a failed write. Surface an actionable error and keep the UI recoverable.
- Use semantic HTML, visible focus states, keyboard activation and touch targets of at least 44px.
- Do not hard-code environment URLs, tokens or sheet IDs in components.
- Use `formatCurrency`/`formatQuantity` from `shared/utils` instead of repeating display logic.
- Prefer TypeScript for new code. `tsconfig.json` has `strict: true`; existing JS is temporarily allowed with `checkJs: false` so migration can be incremental.

## 6. Quality commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run build
```

The build is the release gate. A feature is not complete until its service boundary, empty/error states, tests, and responsive UI are covered.
