# Frontend Specification

## Overview

Next.js ^15.0.0 frontend with React ^19.0.0. Uses Server Actions for
API communication and Tailwind CSS for styling. All pages follow a
consistent pattern with loading states and error boundaries.

## Routes

### / (Home)
- Hero section with marketplace description
- Feature cards highlighting escrow protection, trusted sellers, dispute resolution
- Uses truncateText from shared package for description preview

### /listings
- Displays marketplace listings in table and card grid views
- Uses truncateText for description previews in cards
- Uses formatCurrency for price display
- No raw select elements — uses Table component instead

### /transactions
- Displays user transactions with status badges
- Table view and card grid for transaction summaries
- Color-coded badges based on transaction status

### /escrow
- Shows escrow account details and statuses
- Informational card explaining escrow workflow

## Server Actions

All server actions in app/actions.ts:
- fetchListings — fetch paginated listings
- fetchTransactions — fetch user transactions with auth token
- fetchEscrowDetails — fetch escrow information
- loginAction — authenticate user
- registerAction — register new user
- formatListingPreview — generate slug and preview with shared utilities

## UI Components (8 total)

All components use cn() utility and forwardRef pattern:
1. Button — variant (default/destructive/outline/ghost), size (sm/md/lg)
2. Badge — variant (default/secondary/destructive/outline)
3. Card — container with border and shadow
4. Input — text input with focus ring
5. Label — form label with peer styling
6. Alert — role="alert" with variant (default/destructive)
7. Skeleton — loading placeholder with pulse animation
8. Table — responsive table wrapper

## Accessibility

- Loading states use role="status" and aria-busy="true"
- Error states use role="alert" with focus management
- Navigation uses aria-label="Main navigation"
- No dangerouslySetInnerHTML anywhere in the codebase

## Cross-References

- API endpoints: [api.md](./api.md)
- Shared utilities: [system-architecture.md](./system-architecture.md)
- Testing: [testing.md](./testing.md)

## Verification Tags

<!-- VERIFY: EM-FE-001 — Server Actions with 'use server' directive -->
<!-- VERIFY: EM-FE-002 — response.ok check on all fetches -->
<!-- VERIFY: EM-FE-003 — Loading states with role="status" aria-busy="true" -->
<!-- VERIFY: EM-FE-004 — Error states with role="alert" and focus management -->
<!-- VERIFY: EM-FE-005 — cn() utility on all UI components -->
<!-- VERIFY: EM-FE-006 — Zero dangerouslySetInnerHTML -->
<!-- VERIFY: EM-FE-007 — No raw select elements in pages -->
<!-- VERIFY: EM-FE-008 — Navigation landmark with aria-label -->
<!-- VERIFY: EM-FE-009 — Text truncation with configurable suffix -->
