# UI Specification

## Overview

The Escrow Marketplace frontend is built with Next.js 15 App Router, shadcn/ui component library, and Tailwind CSS 4. The UI follows WCAG 2.1 AA accessibility standards with full keyboard navigation support.

## Component Library

The application uses 8 shadcn/ui components: Button, Card, Input, Label, Badge, Select, Table, Dialog.

## Type System

### [VERIFY:UI-001] Frontend Type Definitions
All data types must be defined as TypeScript interfaces in a centralized types module: User, Transaction, Dispute, Payout, Webhook, ActionState. Transaction status must use a union type matching the backend state machine.

**Traced to**: `frontend/lib/types.ts`

## Form Handling

### [VERIFY:UI-002] Form Validation Helpers
Client-side validation must use dedicated helper functions (`validateRequiredString`, `validateRequiredNumber`) that extract and validate FormData fields before Server Action submission.

**Traced to**: `frontend/lib/validation.ts`

## Component Specifications

### [VERIFY:UI-003] Button Component
The Button component must support multiple variants (default, destructive, outline, secondary, ghost, link) and sizes (default, sm, lg, icon) using class-variance-authority (CVA). Must be keyboard accessible and support disabled state.

**Traced to**: `frontend/components/ui/button.tsx`

### [VERIFY:UI-004] Navigation Component
The navigation must be an async server component that reads user session from cookies. It must display role-aware menu items: authenticated users see Transactions, Disputes, Payouts, Webhooks links; unauthenticated users see Login and Register buttons. Must include `aria-label="Main navigation"`.

**Traced to**: `frontend/components/nav.tsx`

## Styling

### [VERIFY:UI-005] Dark Mode Support
The application must support dark mode via `prefers-color-scheme` CSS media query. Color tokens must use CSS custom properties that adapt to the user's system preference.

**Traced to**: `frontend/app/globals.css`

### [VERIFY:UI-006] Skip-to-Content Link
A visually hidden skip-to-content link must be the first focusable element in the DOM. It must become visible on focus and navigate to the main content area.

**Traced to**: `frontend/app/globals.css`

## Page Specifications

### [VERIFY:UI-007] Transactions Page
The transactions page must display a data table with columns: Description, Amount, Status, Buyer, Seller, Created, Actions. Status must use Badge component with variant mapping (RELEASED=default, DISPUTED/REFUNDED=destructive, PENDING=outline, others=secondary). The "New Transaction" button must only appear for BUYER role.

**Traced to**: `frontend/app/transactions/page.tsx`

### [VERIFY:UI-008] Disputes Page
The disputes page must display a data table with columns: Transaction, Reason, Status, Resolution, Created, Actions. Status must use Badge with variant mapping (OPEN=destructive, RESOLVED=default). The "Resolve" button must only appear for OPEN disputes.

**Traced to**: `frontend/app/disputes/page.tsx`

## Accessibility Requirements

- All loading states must use `role="status"` with `aria-busy="true"`
- Error boundaries must use `role="alert"` for screen reader announcement
- All form inputs must have associated `<Label>` elements
- Error messages in forms must use `role="alert"`
- Tab order must follow visual layout
- All interactive elements must be keyboard accessible
- Focus management: on error, focus moves to first relevant input
