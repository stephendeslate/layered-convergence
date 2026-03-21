# UI Specification — Escrow Marketplace

## Overview

The frontend is built with Next.js 15 App Router, Tailwind CSS 4, and 8 shadcn/ui
components. It follows WCAG 2.1 accessibility guidelines.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [PRODUCT_VISION.md](PRODUCT_VISION.md), [TESTING_STRATEGY.md](TESTING_STRATEGY.md)

## Styling

- [VERIFY:EM-UI-001] Tailwind CSS 4 with @import syntax -> Implementation: apps/web/app/globals.css:1
- [VERIFY:EM-UI-002] Dark mode via @media (prefers-color-scheme: dark) -> Implementation: apps/web/app/globals.css:22
- CSS custom properties for theming (--background, --foreground, etc.)

## Components

- [VERIFY:EM-UI-003] Button component with variants -> Implementation: apps/web/components/ui/button.tsx:1
- 8 shadcn/ui components: button, input, card, label, table, badge, select, dialog
- All components use cn() utility for class merging
- Components use CSS custom properties for consistent theming

## Navigation

- [VERIFY:EM-UI-004] Nav component with aria-label -> Implementation: apps/web/components/nav.tsx:1
- Navigation links: Home, Transactions, Disputes, Payouts, Webhooks, Login

## Layout

- [VERIFY:EM-UI-005] Root layout with skip-to-content link -> Implementation: apps/web/app/layout.tsx:1
- Skip-to-content link as first focusable element
- Main content area with id="main-content"
- Responsive max-width container

## Server Actions

- [VERIFY:EM-UI-006] Server actions with 'use server' directive -> Implementation: apps/web/app/actions.ts:1
- All fetch calls check response.ok before processing
- loginAction and registerAction with redirect on success
- fetchTransactions and fetchDisputes for data loading

## Routes

| Route | Page | Features |
|-------|------|----------|
| / | Home | Dashboard cards for each section |
| /login | Login | Email + password form |
| /register | Register | Email + password + role (Select) + tenantId |
| /transactions | Transactions | Table with formatCurrency, status badges |
| /disputes | Disputes | Table with status badges, resolution text |
| /payouts | Payouts | Table with formatCurrency, processed status |
| /webhooks | Webhooks | Table with URL, events, active status |

## Accessibility

- Every route has loading.tsx (role="status", aria-busy="true")
- Every route has error.tsx (role="alert", useRef + focus on heading)
- All form inputs have associated labels
- aria-required on required inputs
- [VERIFY:EM-UI-007] Keyboard navigation tests with userEvent -> Implementation: apps/web/__tests__/keyboard-navigation.test.tsx:1

## Keyboard Navigation

- Tab order: skip-link -> nav links -> form fields -> submit button
- Shift+Tab for reverse navigation
- All interactive elements reachable via keyboard
