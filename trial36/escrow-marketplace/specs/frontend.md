# Frontend Specification

## Overview

Next.js 15 application with Server Actions for API communication. Tailwind CSS
for styling with shadcn/ui-inspired components using the cn() utility.

## Routes

### / (Home)
Landing page with navigation and overview of the marketplace.

### /listings
Browse active listings with pagination.

### /transactions
View transaction history for the current user.

### /escrow
View escrow account details and manage disputes.

## Loading States

All routes include loading.tsx with `role="status"` and `aria-busy="true"`.

## Error States

All routes include error.tsx with `role="alert"`, useRef, and focus management.

## Server Actions (actions.ts)

- All actions use 'use server' directive
- All fetch calls check response.ok before returning data
- API URL from NEXT_PUBLIC_API_URL environment variable

## Components

### Navigation (nav.tsx)
Main navigation with links to all routes.

### UI Components (components/ui/)
8 shadcn-style components using cn() utility:
- Button, Card, Input, Label, Badge, Dialog, Select, Alert

## Accessibility

- No dangerouslySetInnerHTML usage
- No raw `<select>` elements in pages (use Select component)
- jest-axe tested on all UI components
- Keyboard navigation tested (Tab, Enter, Space)

## Verification Tags

<!-- VERIFY: EM-FE-001 — Server Actions with 'use server' directive -->
<!-- VERIFY: EM-FE-002 — response.ok check on all fetches -->
<!-- VERIFY: EM-FE-003 — Loading states with role="status" aria-busy="true" -->
<!-- VERIFY: EM-FE-004 — Error states with role="alert" and focus management -->
<!-- VERIFY: EM-FE-005 — cn() utility on all UI components -->
<!-- VERIFY: EM-FE-006 — Zero dangerouslySetInnerHTML -->
<!-- VERIFY: EM-FE-007 — No raw select elements in pages -->
<!-- VERIFY: EM-FE-008 — Navigation landmark with aria-label -->
