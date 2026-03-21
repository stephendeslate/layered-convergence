# UI Specification — Field Service Dispatch

## Overview

The FSD frontend is built with Next.js 15 App Router, using shadcn/ui components
built on Radix UI primitives. Styling uses Tailwind CSS 4 with CSS custom properties
for theming. The application supports both light and dark modes via
`prefers-color-scheme`.

## Technology Choices

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15 | App Router with Server Components |
| UI Library | shadcn/ui | Radix UI primitives, not raw HTML elements |
| CSS | Tailwind 4 | `@import "tailwindcss"` syntax |
| Forms | Server Actions | `'use server'` directive in actions.ts |
| Testing | Vitest + Testing Library | jsdom environment |

## Page Inventory

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Entity summary cards with navigation links |
| `/login` | Login | Email/password form with Server Action |
| `/register` | Register | Registration form with shadcn Select for role |
| `/work-orders` | Work Orders | Table with status badges |
| `/technicians` | Technicians | Table with CRUD actions |
| `/customers` | Customers | Table display |
| `/invoices` | Invoices | Table with status badges and amounts |
| `/routes` | Routes | Table with status and distance |
| `/gps-events` | GPS Events | Table with coordinates and event types |

## Component Hierarchy

### Layout Components

- **RootLayout** (`app/layout.tsx`) — HTML shell, skip-to-content link, Nav, main content area
- **Nav** (`components/nav.tsx`) — Top navigation bar with links to all entity pages

### shadcn/ui Components (8+)

All UI components live in `components/ui/` and wrap Radix UI primitives:

1. **Button** — multiple variants (default, destructive, outline, secondary, ghost, link)
2. **Input** — text input with focus-visible ring
3. **Label** — form labels using Radix Label primitive
4. **Card** — Card, CardHeader, CardTitle, CardContent, CardFooter
5. **Badge** — status display with variants (default, secondary, destructive, outline)
6. **Table** — Table, TableHeader, TableBody, TableRow, TableHead, TableCell
7. **Dialog** — modal overlay using Radix Dialog primitive
8. **Select** — dropdown using Radix Select (NOT raw `<select>` HTML element)

### Route-Level Components

Every route directory includes:
- `page.tsx` — main page component
- `loading.tsx` — loading skeleton shown during navigation
- `error.tsx` — error boundary with retry button

## User Flows

### Login Flow
1. Navigate to `/login`
2. Enter email and password in form fields
3. Submit form (triggers `loginAction` Server Action)
4. Server Action calls `POST /auth/login` API
5. On success: redirect to `/?token=<jwt>`
6. On failure: display error alert

### Register Flow
1. Navigate to `/register`
2. Fill in email, password, role (via shadcn Select), company ID
3. Submit form (triggers `registerAction` Server Action)
4. Server Action calls `POST /auth/register` API
5. On success: redirect to `/login`
6. On failure: display error message

### Work Order Management Flow
1. View all work orders on `/work-orders`
2. Each work order displays status as a Badge component
3. Status transitions are triggered via `transitionWorkOrderAction`
4. Invalid transitions show error feedback

## Accessibility Requirements

- Skip-to-content link as first focusable element in the DOM
- All navigation links are keyboard-focusable
- Form inputs have associated `<label>` elements via `htmlFor`
- Error messages use `role="alert"` for screen reader announcement
- Nav element has `aria-label="Main navigation"`
- All interactive elements respond to Enter and Space keys
- Color contrast meets WCAG 2.1 AA via CSS custom properties

## Verified UI Requirements

[VERIFY:UI-001] Tailwind 4 MUST use `@import "tailwindcss"` syntax (not `@tailwind` directives).
> Implementation: `frontend/app/globals.css`

[VERIFY:UI-002] Dark mode MUST be supported via `prefers-color-scheme` media query.
> Implementation: `frontend/app/globals.css`

[VERIFY:UI-003] Screen reader content MUST use `sr-only` class.
> Implementation: `frontend/app/globals.css`

[VERIFY:UI-004] At least 8 shadcn/ui components MUST exist in `components/ui/`.
> Implementation: `frontend/components/ui/button.tsx`

[VERIFY:UI-005] Select component MUST use Radix Select primitive, not raw `<select>`.
> Implementation: `frontend/components/ui/select.tsx`

[VERIFY:UI-006] Nav component MUST be imported in root layout.
> Implementation: `frontend/components/nav.tsx`

[VERIFY:UI-007] Root layout MUST include a skip-to-content link for accessibility.
> Implementation: `frontend/app/layout.tsx`

[VERIFY:UI-008] `actions.ts` MUST have `'use server'` directive for Server Actions.
> Implementation: `frontend/app/actions.ts`

[VERIFY:UI-009] Server Actions MUST check `response.ok` before redirect.
> Implementation: `frontend/app/actions.ts`

[VERIFY:UI-010] Dashboard page MUST display entity summary cards with navigation links.
> Implementation: `frontend/app/page.tsx`

[VERIFY:UI-011] Login page MUST use Server Action form submission.
> Implementation: `frontend/app/login/page.tsx`

[VERIFY:UI-012] Register page MUST use shadcn Select for role picker (not raw `<select>`).
> Implementation: `frontend/app/register/page.tsx`

[VERIFY:UI-013] Work Orders page MUST display status badges and table layout.
> Implementation: `frontend/app/work-orders/page.tsx`

[VERIFY:UI-014] Technicians page MUST display table with CRUD actions.
> Implementation: `frontend/app/technicians/page.tsx`

[VERIFY:UI-015] Customers page MUST display customer data in table format.
> Implementation: `frontend/app/customers/page.tsx`

[VERIFY:UI-016] Invoices page MUST display status badges and monetary amounts.
> Implementation: `frontend/app/invoices/page.tsx`

[VERIFY:UI-017] Routes page MUST display route status and distance information.
> Implementation: `frontend/app/routes/page.tsx`

[VERIFY:UI-018] GPS Events page MUST display event type, coordinates, and timestamps.
> Implementation: `frontend/app/gps-events/page.tsx`

[VERIFY:UI-019] Root `loading.tsx` MUST exist at the `app/` level (FM #64).
> Implementation: `frontend/app/loading.tsx`

[VERIFY:UI-020] Root `error.tsx` MUST exist at the `app/` level (FM #64).
> Implementation: `frontend/app/error.tsx`

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for target users and value proposition.
- See [API_CONTRACT.md](./API_CONTRACT.md) for the endpoints consumed by frontend pages.
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for frontend test coverage details.
