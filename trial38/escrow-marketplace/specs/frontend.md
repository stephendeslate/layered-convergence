# Frontend Specification

## Overview

The frontend is a Next.js 15 application using the App Router with shadcn/ui components. It consumes the NestJS API via server actions and provides accessible, responsive UI with dark mode support via `@media (prefers-color-scheme: dark)`.

## Technology Stack

- Next.js 15 with App Router (app/ directory)
- TypeScript with strict mode
- Tailwind CSS with CSS custom properties for theming
- shadcn/ui components (Button, Card, Input, Alert, Badge, Label, Skeleton, Table)
- clsx + tailwind-merge for className composition via cn() utility
- class-variance-authority (cva) for component variant definitions

## Route Structure

| Route          | Page Component          | Loading State | Error Boundary |
|----------------|------------------------|---------------|----------------|
| /              | app/page.tsx           | loading.tsx   | error.tsx      |
| /listings      | app/listings/page.tsx  | loading.tsx   | error.tsx      |
| /transactions  | app/transactions/page.tsx | loading.tsx | error.tsx      |
| /escrow        | app/escrow/page.tsx    | loading.tsx   | error.tsx      |

## Dark Mode

Dark mode is implemented via `@media (prefers-color-scheme: dark)` in globals.css. CSS custom properties (--background, --foreground, --primary, etc.) are redefined under the media query. No `.dark` class toggling is used.

## UI Components (shadcn/ui)

All components use the cn() utility for className merging and React.forwardRef for ref forwarding.

1. **Button** -- Variants via cva: default, destructive, outline, secondary, ghost, link. Sizes: default, sm, lg, icon. Focus ring via focus-visible.
2. **Card** -- Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter. Composed with semantic HTML.
3. **Alert** -- With `role="alert"` for accessibility. AlertTitle, AlertDescription sub-components.
4. **Badge** -- Status indicators with variant styling (default, secondary, destructive, outline).
5. **Input** -- Form input with focus ring, disabled state styling, and file input support.
6. **Label** -- Form labels with peer-disabled opacity styling. Uses @radix-ui/react-label.
7. **Skeleton** -- Loading placeholder with pulse animation via Tailwind animate-pulse.
8. **Table** -- Full table component set: Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, TableFooter.

## Accessibility

- All loading states use `role="status"` and `aria-busy="true"` with `<span class="sr-only">` text
- Error boundaries use `role="alert"` and auto-focus the error heading via useRef + useEffect
- Navigation uses `aria-label="Main navigation"` and semantic `<nav>`, `<ul>`, `<li>`
- Inputs are associated with Labels via htmlFor/id attribute pairs
- Tables use semantic `<thead>`, `<tbody>`, `<th>`, `<td>` elements
- Buttons have focus-visible ring styling for keyboard users

## Server Actions

All API calls go through `app/actions.ts` with `'use server'` directive:
- fetchListings, fetchTransactions -- paginated list endpoints with Bearer token
- createTransaction -- POST to /transactions
- loginUser, registerUser -- auth endpoints
- All check `response.ok` and throw descriptive errors on failure

## Shared Package Integration

The frontend imports from `@escrow-marketplace/shared`:
- formatCurrency -- currency display on listing/transaction pages
- truncateText -- text truncation with configurable suffix
- clampPageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE -- pagination constants

## Navigation Component

The Nav component (`components/nav.tsx`) provides a header bar with:
- Logo/title link to homepage
- Links to Listings, Transactions, Escrow pages
- Accessible link list with `role="list"` on `<ul>`

## Verification Tags (Frontend)

<!-- VERIFY: EM-FE-001 — Next.js 15 configuration with security headers -->
<!-- VERIFY: EM-FE-002 — cn() utility with clsx + tailwind-merge -->
<!-- VERIFY: EM-FE-003 — Dark mode via prefers-color-scheme -->
<!-- VERIFY: EM-FE-004 — Navigation component with accessible links -->
<!-- VERIFY: EM-FE-005 — Root layout with Nav and metadata -->
<!-- VERIFY: EM-FE-006 — Homepage with accessible navigation cards -->
<!-- VERIFY: EM-FE-007 — Loading state with role="status" and aria-busy -->
<!-- VERIFY: EM-FE-008 — Error boundary with role="alert" and useRef focus -->
<!-- VERIFY: EM-FE-009 — Text truncation with configurable suffix -->
<!-- VERIFY: EM-FE-010 — Server Actions with 'use server' and response.ok checks -->
<!-- VERIFY: EM-FE-011 — Listings page with shared utility usage -->
<!-- VERIFY: EM-FE-012 — Listings table component (dynamically imported) -->
<!-- VERIFY: EM-FE-013 — Transactions page with shared utility usage -->
<!-- VERIFY: EM-FE-014 — Escrow accounts page -->

## Cross-References

- See [system-architecture.md](system-architecture.md) for monorepo structure and shared package
- See [performance.md](performance.md) for bundle optimization with next/dynamic
- See [testing.md](testing.md) for accessibility and keyboard navigation tests
