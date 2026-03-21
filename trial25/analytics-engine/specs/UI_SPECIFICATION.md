# UI Specification — Analytics Engine

## Overview

The Analytics Engine frontend is built with Next.js 15, Tailwind CSS 4, and shadcn/ui components. It provides pages for authentication, data source management, pipeline orchestration, and dashboard creation.

See [API_CONTRACT.md](./API_CONTRACT.md) for the backend endpoints consumed by Server Actions and [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature priorities.

## Page Inventory

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with feature overview cards |
| `/login` | Login | Email/password authentication form |
| `/register` | Register | Account creation with role selection |
| `/data-sources` | Data Sources | Table listing connected data sources |
| `/pipelines` | Pipelines | Card grid of pipeline configurations |
| `/dashboards` | Dashboards | Card grid of user dashboards |

## Component Hierarchy

- `layout.tsx` — Root layout with Nav and skip-to-content link
- `Nav` — Main navigation bar with links to all routes
- `loading.tsx` — Spinner with `role="status"` + `aria-busy="true"` (all routes)
- `error.tsx` — Error boundary with `role="alert"` + focus management (all routes)

## shadcn/ui Components Used

The following 8+ shadcn/ui component patterns are implemented:
1. **Badge** — Status indicators for pipeline and sync run states
2. **Button** — Primary actions, form submissions, retry actions
3. **Card** — Dashboard cards, pipeline cards, feature overview cards
4. **Dialog** — Create/edit modals for entities
5. **Input** — Form text inputs with labels
6. **Label** — Form field labels with htmlFor associations
7. **Select** — Role selection dropdown in registration
8. **Table** — Data source listing with sortable columns

## Accessibility Requirements

[VERIFY:UI-001] Tailwind 4 uses @import "tailwindcss" syntax (not @tailwind directives).
> Implementation: `frontend/app/globals.css`

[VERIFY:UI-002] Dark mode implemented via @media (prefers-color-scheme: dark) in globals.css.
> Implementation: `frontend/app/globals.css`

[VERIFY:UI-003] Skip-to-content link with sr-only class that becomes visible on focus.
> Implementation: `frontend/app/globals.css` (.skip-to-content styles)

[VERIFY:UI-004] Nav component renders in root layout with aria-label="Main navigation".
> Implementation: `frontend/components/nav.tsx`

[VERIFY:UI-005] Root layout includes Nav component and skip-to-content link.
> Implementation: `frontend/app/layout.tsx`

[VERIFY:UI-006] ALL loading.tsx files (root + 5 routes) have role="status" and aria-busy="true".
> Implementation: `frontend/app/loading.tsx`, `frontend/app/login/loading.tsx`, `frontend/app/register/loading.tsx`, `frontend/app/data-sources/loading.tsx`, `frontend/app/pipelines/loading.tsx`, `frontend/app/dashboards/loading.tsx`

[VERIFY:UI-007] ALL error.tsx files (root + 5 routes) have 'use client', role="alert", useRef+useEffect focus management.
> Implementation: `frontend/app/error.tsx`, `frontend/app/login/error.tsx`, `frontend/app/register/error.tsx`, `frontend/app/data-sources/error.tsx`, `frontend/app/pipelines/error.tsx`, `frontend/app/dashboards/error.tsx`

## Server Actions

[VERIFY:UI-008] actions.ts uses 'use server' directive for all mutation actions.
> Implementation: `frontend/lib/actions.ts`

## Page Components

[VERIFY:UI-009] Login page with email/password form inputs and labels.
> Implementation: `frontend/app/login/page.tsx`

[VERIFY:UI-010] Register page with role selection excluding ADMIN.
> Implementation: `frontend/app/register/page.tsx`

[VERIFY:UI-011] Data Sources page with HTML table layout.
> Implementation: `frontend/app/data-sources/page.tsx`

[VERIFY:UI-012] Pipelines page with card grid layout.
> Implementation: `frontend/app/pipelines/page.tsx`

[VERIFY:UI-013] Dashboards page with card grid layout.
> Implementation: `frontend/app/dashboards/page.tsx`

[VERIFY:UI-014] Keyboard navigation test verifies interactive elements are accessible.
> Implementation: `frontend/app/keyboard.test.tsx`

[VERIFY:UI-015] Accessibility test verifies ARIA attributes on loading and error states.
> Implementation: `frontend/app/accessibility.test.tsx`

## User Flows

1. **Registration** — User selects role (VIEWER/EDITOR/ANALYST), submits form, receives JWT
2. **Login** — User enters email/password, receives JWT
3. **Data Source Setup** — User adds connection details, system validates and saves
4. **Pipeline Creation** — User configures pipeline, transitions through DRAFT→ACTIVE lifecycle
5. **Dashboard Building** — User creates dashboard, adds widgets, optionally enables public embed

## Cross-References

- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for frontend test coverage
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication UI integration
