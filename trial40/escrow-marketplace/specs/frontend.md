# Frontend Specification

## Overview

The Escrow Marketplace frontend is a Next.js 15 application using React 19,
Tailwind CSS 4, and shadcn/ui components. It communicates with the API
via Server Actions (see [api.md](./api.md) for endpoint contracts).

## Technology Stack

- Next.js ^15.0.0 with App Router
- React 19
- Tailwind CSS 4
- clsx + tailwind-merge for className utility
- 8 shadcn/ui components

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| / | page.tsx | Dashboard overview |
| /listings | page.tsx | Listings list with cards |
| /transactions | page.tsx | Transaction history |
| /escrows | page.tsx | Escrow accounts |
| /disputes | page.tsx | Dispute management |

## VERIFY Tags

- VERIFY: EM-FE-001 — Root layout with Nav component
- VERIFY: EM-FE-002 — Home page with dashboard overview
- VERIFY: EM-FE-003 — Root loading state with accessibility
- VERIFY: EM-FE-004 — Root error boundary with focus management
- VERIFY: EM-FE-005 — Listings page with Server Actions
- VERIFY: EM-FE-006 — Transactions page with Server Actions
- VERIFY: EM-FE-007 — Escrows page with Server Actions
- VERIFY: EM-FE-008 — Disputes page with Server Actions
- VERIFY: EM-FE-009 — Text truncation with configurable suffix
- VERIFY: EM-FE-010 — Dynamic import for bundle optimization
- VERIFY: EM-FE-011 — Server Actions with 'use server' and response.ok

## Loading States

Every route has a loading.tsx with:
- `role="status"` for screen readers
- `aria-busy="true"` for loading indication
- `<span className="sr-only">` for descriptive text
- Skeleton pulse animations

## Error Boundaries

Every route has an error.tsx with:
- `role="alert"` for screen reader announcement
- `useRef` for heading element
- Focus management via `headingRef.current?.focus()` in useEffect
- Reset button to retry failed operations

## Server Actions

- Declared with `'use server'` directive
- Check `response.ok` before parsing JSON
- Return empty arrays on failure (graceful degradation)
- API base URL from environment variable

## Dark Mode

CSS variables with `@media (prefers-color-scheme: dark)` in globals.css.
NOT using `.dark` class-based approach.

## UI Components

- VERIFY: EM-UI-001 — Navigation component with accessible links
- VERIFY: EM-UI-002 — cn utility using clsx + tailwind-merge
- VERIFY: EM-UI-003 — Button component with variants
- VERIFY: EM-UI-004 — Badge component with variants
- VERIFY: EM-UI-005 — Card component with header, content, footer
- VERIFY: EM-UI-006 — Input component with accessible styling
- VERIFY: EM-UI-007 — Label component for form fields
- VERIFY: EM-UI-008 — Alert component with variants
- VERIFY: EM-UI-009 — Skeleton component for loading states
- VERIFY: EM-UI-010 — Table component with accessible structure

## Bundle Optimization

- `next/dynamic` used for client-side only components (ListingsTable)
- Reduces initial JavaScript bundle size
