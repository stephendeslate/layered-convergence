# UI Specification -- Field Service Dispatch

## Overview

Next.js 15 frontend with Tailwind CSS 4, shadcn/ui component patterns, and comprehensive accessibility support.

## Styling

[VERIFY:UI-001] Tailwind 4 uses @import "tailwindcss" syntax in globals.css (not @tailwind directives).
> Implementation: `frontend/app/globals.css`

[VERIFY:UI-002] Dark mode via @media (prefers-color-scheme: dark) CSS variables in globals.css.
> Implementation: `frontend/app/globals.css`

[VERIFY:UI-003] Skip-to-content link with sr-only text for keyboard accessibility.
> Implementation: `frontend/app/globals.css`

## Navigation

[VERIFY:UI-004] Nav component rendered in root layout.tsx with aria-label="Main navigation".
> Implementation: `frontend/components/nav.tsx`

[VERIFY:UI-005] Root layout includes Nav component and skip-to-content link.
> Implementation: `frontend/app/layout.tsx`

## Server Actions

[VERIFY:UI-006] actions.ts with 'use server' directive in frontend/lib/ -- all actions check response.ok.
> Implementation: `frontend/lib/actions.ts`

## Accessibility Tests

[VERIFY:UI-007] Accessibility test file verifying ARIA roles on loading and error states.
> Implementation: `frontend/app/accessibility.test.tsx`

## Loading and Error States

[VERIFY:UI-008] loading.tsx in root + all 6 routes: each has role="status" and aria-busy="true" on container div.
> Implementation: `frontend/app/loading.tsx`, `frontend/app/login/loading.tsx`, `frontend/app/register/loading.tsx`, `frontend/app/work-orders/loading.tsx`, `frontend/app/technicians/loading.tsx`, `frontend/app/routes/loading.tsx`, `frontend/app/invoices/loading.tsx`

[VERIFY:UI-009] error.tsx in root + all 6 routes: each has 'use client', role="alert", useRef+useEffect for heading focus, retry button.
> Implementation: `frontend/app/error.tsx`, `frontend/app/login/error.tsx`, `frontend/app/register/error.tsx`, `frontend/app/work-orders/error.tsx`, `frontend/app/technicians/error.tsx`, `frontend/app/routes/error.tsx`, `frontend/app/invoices/error.tsx`

## Page Components

[VERIFY:UI-010] Login page with email/password form.
> Implementation: `frontend/app/login/page.tsx`

[VERIFY:UI-011] Register page with role selection limited to DISPATCHER and TECHNICIAN.
> Implementation: `frontend/app/register/page.tsx`

[VERIFY:UI-012] Work orders listing page with create button and lifecycle description.
> Implementation: `frontend/app/work-orders/page.tsx`

[VERIFY:UI-013] Technicians listing page with add button and skill management.
> Implementation: `frontend/app/technicians/page.tsx`

[VERIFY:UI-014] Routes listing page with plan button and GPS monitoring.
> Implementation: `frontend/app/routes/page.tsx`

[VERIFY:UI-015] Invoices listing page with create button and payment tracking.
> Implementation: `frontend/app/invoices/page.tsx`

## Cross-References

- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for frontend test details
- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature priorities
