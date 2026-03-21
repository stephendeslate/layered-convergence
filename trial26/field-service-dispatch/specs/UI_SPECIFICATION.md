# UI Specification: Field Service Dispatch

## Overview

The Field Service Dispatch frontend provides a responsive interface
for dispatchers and technicians built with Next.js 15 and shadcn/ui.

## Page Inventory

### Root Layout (`app/layout.tsx`)
[VERIFY:FD-040] Root layout includes Nav component with aria-label
and skip-to-content link for keyboard navigation.

### Home Page (`app/page.tsx`)
Welcome page with Card component and navigation to work orders.

### Login Page (`app/login/page.tsx`)
[VERIFY:FD-041] Login form uses shadcn Input and Label with proper
htmlFor/id associations for screen reader accessibility.

### Register Page (`app/register/page.tsx`)
[VERIFY:FD-042] Register page uses shadcn Select component (not raw
<select>) for role selection per FM #71 compliance.

### Dashboard Page (`app/dashboard/page.tsx`)
Operations overview with Badge indicators and Card summaries showing
active work orders, available technicians, and pending invoices.

## Component Hierarchy

### shadcn/ui Components
[VERIFY:FD-043] 8 shadcn/ui components: badge, button, card, dialog,
input, label, select, table. All use cn() for className merging.

### Navigation
Main navigation for Dashboard, Login, Register with focus indicators.

## User Flows

1. Dispatcher: Dashboard -> Create Work Order -> Assign Technician
2. Technician: Login -> View Assignments -> Start/Complete Work
3. Invoicing: Dashboard -> Create Invoice -> Send -> Track Payment

## Accessibility

[VERIFY:FD-044] Loading states use role="status" with aria-busy="true".
Error states use role="alert" with useRef/useEffect focus management.

## Styling

[VERIFY:FD-045] Tailwind CSS 4 with @import "tailwindcss" syntax.
Dark mode via prefers-color-scheme with CSS custom properties.

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature requirements
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for component testing
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for auth UI flows
