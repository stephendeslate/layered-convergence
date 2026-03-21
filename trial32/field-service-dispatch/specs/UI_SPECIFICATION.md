# UI Specification — Field Service Dispatch

## Overview

The frontend is built with Next.js 15 App Router, using shadcn/ui components and
Tailwind CSS 4. It provides accessible interfaces for managing work orders, customers,
technicians, routes, and invoices.

See also: [PRODUCT_VISION.md](PRODUCT_VISION.md), [TESTING_STRATEGY.md](TESTING_STRATEGY.md)

## Styling

### Tailwind CSS 4
- Uses new `@import "tailwindcss"` syntax
- CSS custom properties for theming (--background, --foreground, --primary, etc.)
- [VERIFY:FD-UI-001] Tailwind CSS 4 import syntax -> Implementation: apps/web/app/globals.css:1

### Dark Mode
- Implemented via `@media (prefers-color-scheme: dark)` media query
- CSS custom properties switch between light and dark values
- No JavaScript toggle needed — follows system preference
- [VERIFY:FD-UI-002] Dark mode with prefers-color-scheme -> Implementation: apps/web/app/globals.css:2

## Components

### shadcn/ui Components (8 total)
All components use CSS custom properties for consistent theming:
1. Button — variants (default, destructive, outline, secondary, ghost, link) + sizes
2. Input — styled text input with focus ring
3. Card — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
4. Label — form field label
5. Table — Table, TableHeader, TableBody, TableRow, TableHead, TableCell
6. Badge — status indicators with variants
7. Select — dropdown selection (used for role in registration)
8. Dialog — modal dialog with aria-modal

- [VERIFY:FD-UI-003] Button component with variants -> Implementation: apps/web/components/ui/button.tsx:1

### Navigation
- Main navigation bar with links to all sections
- aria-label="Main navigation" for accessibility
- Links: Work Orders, Customers, Technicians, Routes, Invoices, Login
- [VERIFY:FD-UI-004] Nav component in layout -> Implementation: apps/web/components/nav.tsx:1

## Layout

### Root Layout
- Skip-to-content link as first focusable element
- Nav component in header
- main element with id="main-content" for skip link target
- [VERIFY:FD-UI-005] Root layout with skip-to-content link -> Implementation: apps/web/app/layout.tsx:1

## Routes

### Pages
- `/` — Home page with dashboard cards
- `/login` — Login form with email/password
- `/register` — Registration form with role select
- `/work-orders` — Work order table with status badges
- `/customers` — Customer table
- `/technicians` — Technician table with availability badges
- `/routes` — Route table
- `/invoices` — Invoice table with formatCurrency from shared

### Loading States
- Every route has `loading.tsx` with role="status" and aria-busy="true"

### Error States
- Every route has `error.tsx` with role="alert"
- Error heading receives focus via useRef
- Reset button to retry

## Server Actions

- All actions use 'use server' directive
- Every fetch checks response.ok before processing
- Actions: loginAction, registerAction, fetchWorkOrders, fetchCustomers, fetchTechnicians, fetchRoutes, fetchInvoices
- [VERIFY:FD-UI-006] Server actions with response.ok check -> Implementation: apps/web/app/actions.ts:1

## Accessibility

### WCAG Compliance
- All form inputs have associated labels
- Skip-to-content link for keyboard users
- aria-required on required form fields
- aria-label on navigation
- aria-modal on dialog
- axe-core tests for all major components

### Keyboard Navigation
- Full tab order through all interactive elements
- Shift+Tab for reverse navigation
- Enter key activates buttons
- [VERIFY:FD-UI-007] Keyboard navigation tests with userEvent -> Implementation: apps/web/__tests__/keyboard-navigation.test.tsx:1
