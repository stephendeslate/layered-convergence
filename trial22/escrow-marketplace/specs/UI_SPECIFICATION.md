# UI Specification — Escrow Marketplace

## Overview

The frontend is built with Next.js 15 App Router, using shadcn/ui components
styled with Tailwind CSS 4. The design emphasizes accessibility, keyboard
navigation, and responsive layout with dark mode support.

See: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for frontend architecture decisions.
See: [API_CONTRACT.md](API_CONTRACT.md) for the API endpoints consumed by the UI.

<!-- VERIFY:UI-001 — Skip-to-content link in root layout -->
<!-- VERIFY:UI-002 — loading.tsx in every route with role="status" and aria-busy="true" -->
<!-- VERIFY:UI-003 — error.tsx in every route with role="alert" -->
<!-- VERIFY:UI-004 — Dark mode via prefers-color-scheme -->
<!-- VERIFY:UI-005 — 8 shadcn/ui components used -->
<!-- VERIFY:UI-006 — Nav component in root layout -->

## shadcn/ui Components (8 required)

1. **Button** — Primary actions (submit, fund, ship, confirm)
2. **Card** — Transaction and dispute summaries
3. **Input** — Form text fields (email, password, amount, description)
4. **Label** — Form field labels with proper `htmlFor` association
5. **Badge** — Transaction and dispute status indicators
6. **Select** — Role selection on registration, status filters
7. **Table** — Transaction lists, payout lists
8. **Dialog** — Confirmation dialogs for irreversible actions (fund, dispute)

## Route Structure

```
app/
├── layout.tsx          (root layout with Nav + skip-to-content)
├── page.tsx            (home/landing)
├── login/
│   ├── page.tsx        (login form)
│   ├── loading.tsx
│   └── error.tsx
├── register/
│   ├── page.tsx        (registration with role selection)
│   ├── loading.tsx
│   └── error.tsx
├── transactions/
│   ├── page.tsx        (transaction list)
│   ├── loading.tsx
│   ├── error.tsx
│   ├── new/
│   │   ├── page.tsx    (create transaction form)
│   │   ├── loading.tsx
│   │   └── error.tsx
│   └── [id]/
│       ├── page.tsx    (transaction detail + actions)
│       ├── loading.tsx
│       └── error.tsx
├── disputes/
│   ├── page.tsx        (disputes list)
│   ├── loading.tsx
│   ├── error.tsx
│   └── [id]/
│       ├── page.tsx    (dispute detail + resolution)
│       ├── loading.tsx
│       └── error.tsx
└── payouts/
    ├── page.tsx        (payouts list)
    ├── loading.tsx
    └── error.tsx
```

## Root Layout

See [SECURITY_MODEL.md](SECURITY_MODEL.md) for authentication state management.

```tsx
<html lang="en">
  <body>
    <a href="#main-content" className="skip-to-content">
      Skip to content
    </a>
    <Nav />
    <main id="main-content">
      {children}
    </main>
  </body>
</html>
```

## Navigation Component

The `Nav` component renders in the root layout and provides links to:
- Home (/)
- Transactions (/transactions)
- Disputes (/disputes)
- Payouts (/payouts)
- Login/Register (when unauthenticated)

Navigation is keyboard-accessible with visible focus indicators.
See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for keyboard navigation test specs.

## Loading States

Every route includes a `loading.tsx`:
```tsx
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <p>Loading...</p>
    </div>
  );
}
```

## Error States

Every route includes an `error.tsx`:
```tsx
'use client';
export default function Error({ error }: { error: Error }) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
    </div>
  );
}
```

## Page Specifications

### Login Page
- Email input with Label
- Password input with Label
- Submit Button
- Link to register page
- Server Action posts to `/auth/login`, checks `response.ok` before redirect
- See [API_CONTRACT.md](API_CONTRACT.md) for login endpoint spec

### Register Page
- Email input with Label
- Password input with Label
- Role Select (BUYER / SELLER)
- Submit Button
- Link to login page
- See [PRODUCT_VISION.md](PRODUCT_VISION.md) for role definitions

### Transaction List Page
- Table showing all user transactions
- Badge for status (color-coded per state)
- Link to transaction detail
- "New Transaction" Button (BUYER only)

### Transaction Detail Page
- Card displaying transaction info
- Badge for current status
- Action buttons based on valid state transitions:
  - PENDING → "Fund" Button (BUYER)
  - FUNDED → "Mark Shipped" Button (SELLER)
  - SHIPPED → "Confirm Delivery" Button (BUYER)
  - DELIVERED → "Release Funds" Button (auto-completes)
- "File Dispute" Button (when applicable)
- Dialog confirmation for irreversible actions

### Dispute Pages
- List: Table with dispute status Badges
- Detail: Card with reason, resolution form for open disputes

### Payouts Page
- Table listing completed payouts with amounts and dates

## Accessibility Requirements

1. All form inputs have associated Labels with `htmlFor`
2. Color contrast meets WCAG 2.1 AA (4.5:1 for text)
3. Focus indicators visible on all interactive elements
4. Skip-to-content link as first focusable element
5. Status badges use text in addition to color
6. All images have alt text (if any are added)
7. See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for automated accessibility testing

## Dark Mode

Implemented via CSS `prefers-color-scheme`:
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

No manual toggle — follows system preference.
