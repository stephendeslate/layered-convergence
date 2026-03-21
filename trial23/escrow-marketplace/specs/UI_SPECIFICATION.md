# UI Specification — Escrow Marketplace

## Overview
The frontend is built with Next.js 15 App Router, using shadcn/ui components
and Tailwind CSS 4. Every route includes loading and error boundary files.
Accessibility is a first-class concern.

<!-- VERIFY:UI-001: Every route has loading.tsx with role="status" and aria-busy -->
<!-- VERIFY:UI-002: Every route has error.tsx with role="alert" and useRef focus -->
<!-- VERIFY:UI-003: Skip-to-content link in root layout -->
<!-- VERIFY:UI-004: 8 shadcn/ui components used -->
<!-- VERIFY:UI-005: Dark mode via @media (prefers-color-scheme: dark) -->

## Route Map

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home/Dashboard | Landing page with navigation |
| `/login` | Login | Email/password login form |
| `/register` | Register | Registration with role selection |
| `/transactions` | Transaction List | Table of user transactions |
| `/transactions/new` | New Transaction | Create transaction form |
| `/transactions/[id]` | Transaction Detail | Status, actions, dispute option |
| `/disputes` | Dispute List | Table of user disputes |
| `/disputes/[id]` | Dispute Detail | Dispute info, resolution |
| `/payouts` | Payout List | Table of seller payouts |

## shadcn/ui Components (8 total)
1. **Button** — Primary actions, form submissions
2. **Card** — Content containers for transactions, disputes
3. **Input** — Text fields in forms
4. **Label** — Form field labels with proper `htmlFor` association
5. **Select** — Role selection, status filters
6. **Badge** — Status indicators (color-coded by state)
7. **Table** — Data display for lists
8. **Dialog** — Confirmations, dispute creation modals

## Loading States
Every route segment has a `loading.tsx` file that renders:
```tsx
<div role="status" aria-busy="true">
  <span className="sr-only">Loading...</span>
  {/* Visual spinner */}
</div>
```

The `sr-only` class ensures screen readers announce the loading state while
sighted users see the visual indicator.

## Error States
Every route segment has an `error.tsx` file with:
- `'use client'` directive
- `role="alert"` on the container
- `useRef` + `useEffect` to focus the error message on mount
- Reset/retry button

## Accessibility Requirements
- Skip-to-content link as first focusable element in layout
- All form inputs have associated labels
- Color is never the sole indicator of state (text + color for badges)
- Focus management on route transitions and error states
- Keyboard navigation for all interactive elements
- axe-core automated testing in all frontend test files

## Dark Mode
Implemented via CSS media query in `globals.css`:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

## Tailwind CSS 4
Uses the new import syntax in `globals.css`:
```css
@import "tailwindcss";
```

## Server Actions
`frontend/app/actions.ts` contains server actions with `'use server'` directive.
All actions check `response.ok` before redirecting to prevent silent failures.

## Related Specifications
- See [PRODUCT_VISION.md](PRODUCT_VISION.md) for user personas and flows
- See [API_CONTRACT.md](API_CONTRACT.md) for backend endpoints consumed by UI
- See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for frontend test approach
