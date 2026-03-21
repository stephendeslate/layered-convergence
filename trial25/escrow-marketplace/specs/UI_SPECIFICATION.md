# UI Specification — Escrow Marketplace

## Overview

The Escrow Marketplace frontend is built with Next.js 15, Tailwind CSS 4, and shadcn/ui components. It provides pages for authentication, transaction management, dispute resolution, and payout tracking.

See [API_CONTRACT.md](./API_CONTRACT.md) for backend endpoints and [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature priorities.

## Page Inventory

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with feature overview cards |
| `/login` | Login | Email/password authentication form |
| `/register` | Register | Account creation with role selection |
| `/transactions` | Transactions | Table of escrow transactions with status |
| `/disputes` | Disputes | Card grid of filed disputes |
| `/payouts` | Payouts | Table of payout records |

## Component Hierarchy

- `layout.tsx` — Root layout with Nav and skip-to-content link
- `Nav` — Main navigation bar with links to all routes
- `loading.tsx` — Spinner with `role="status"` + `aria-busy="true"` (all routes)
- `error.tsx` — Error boundary with `role="alert"` + focus management (all routes)

## shadcn/ui Components Used

1. **Badge** — Status indicators for transactions, disputes, payouts
2. **Button** — Primary actions, form submissions, retry actions
3. **Card** — Dispute cards, feature overview cards
4. **Dialog** — Create/edit modals for transactions and disputes
5. **Input** — Form text inputs with labels
6. **Label** — Form field labels with htmlFor associations
7. **Select** — Role selection dropdown in registration
8. **Table** — Transaction and payout listings

## Accessibility Requirements

[VERIFY:UI-001] Tailwind 4 uses @import "tailwindcss" syntax (not @tailwind directives).
> Implementation: `frontend/app/globals.css`

[VERIFY:UI-002] Dark mode implemented via @media (prefers-color-scheme: dark).
> Implementation: `frontend/app/globals.css`

[VERIFY:UI-003] Skip-to-content link with sr-only class.
> Implementation: `frontend/app/globals.css`

[VERIFY:UI-004] Nav component renders in root layout with aria-label="Main navigation".
> Implementation: `frontend/components/nav.tsx`

[VERIFY:UI-005] Root layout includes Nav component and skip-to-content link.
> Implementation: `frontend/app/layout.tsx`

[VERIFY:UI-006] ALL loading.tsx files (root + 5 routes) have role="status" and aria-busy="true".
> Implementation: `frontend/app/loading.tsx` + 5 route loading files

[VERIFY:UI-007] ALL error.tsx files (root + 5 routes) have 'use client', role="alert", useRef+useEffect focus management.
> Implementation: `frontend/app/error.tsx` + 5 route error files

## Server Actions

[VERIFY:UI-008] actions.ts uses 'use server' directive for all mutation actions.
> Implementation: `frontend/lib/actions.ts`

## Page Components

[VERIFY:UI-009] Login page with email/password form.
> Implementation: `frontend/app/login/page.tsx`

[VERIFY:UI-010] Register page with role selection excluding ADMIN.
> Implementation: `frontend/app/register/page.tsx`

[VERIFY:UI-011] Transactions page with table layout and status badges.
> Implementation: `frontend/app/transactions/page.tsx`

[VERIFY:UI-012] Disputes page with card layout.
> Implementation: `frontend/app/disputes/page.tsx`

[VERIFY:UI-013] Payouts page with table layout.
> Implementation: `frontend/app/payouts/page.tsx`

[VERIFY:UI-014] Keyboard navigation test verifies interactive elements.
> Implementation: `frontend/app/keyboard.test.tsx`

[VERIFY:UI-015] Accessibility test verifies ARIA attributes.
> Implementation: `frontend/app/accessibility.test.tsx`

## User Flows

1. **Registration** — User selects BUYER or SELLER role, submits form, receives JWT
2. **Login** — User enters email/password, receives JWT
3. **Create Transaction** — Buyer specifies seller, amount, description; creates escrow
4. **Fund/Release** — Transaction transitions through PENDING→FUNDED→RELEASED→COMPLETED
5. **File Dispute** — Either party files dispute, goes through review workflow
6. **Payout** — After release, seller receives payout through PENDING→PROCESSING→COMPLETED

## Cross-References

- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for frontend test coverage
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication UI integration
