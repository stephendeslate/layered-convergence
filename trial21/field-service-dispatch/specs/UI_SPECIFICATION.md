# UI Specification

## Overview

The frontend is built with Next.js 15 App Router using Server Components for
data fetching and Client Components for interactive forms. The UI library is
shadcn/ui with 8 core components built on Radix UI primitives. Styling uses
Tailwind CSS 4 with dark mode support via prefers-color-scheme. See
[API_CONTRACT.md](API_CONTRACT.md) for the backend endpoints consumed by
the frontend.

## Type System

[VERIFY:UI-001] All frontend data types SHALL be defined as TypeScript interfaces
in a centralized types module (lib/types.ts). Types must match the backend domain
models (User, Company, Customer, Technician, WorkOrder, Route, GpsEvent, Invoice)
to ensure type safety across the full stack.
→ Implementation: frontend/lib/types.ts:1

## Form Validation

[VERIFY:UI-002] Client-side form validation SHALL use helper functions
(validateRequiredString, validateRequiredNumber) that safely extract and validate
FormData values without type assertions. These helpers handle null, empty string,
File objects, and NaN edge cases.
→ Implementation: frontend/lib/validation.ts:1

## Authentication

[VERIFY:UI-003] Cookie parsing for user session data SHALL use runtime type
narrowing to validate the parsed JSON structure. No `as any` type assertions
are permitted in authentication code. Each field (id, email, role, companyId)
is validated with typeof checks before constructing the User object.
→ Implementation: frontend/lib/auth.ts:14

## Theming

[VERIFY:UI-004] Dark mode SHALL be supported via CSS prefers-color-scheme media
query. HSL CSS custom properties define the color palette for both light and
dark themes, ensuring consistent styling across components.
→ Implementation: frontend/app/globals.css:26

## Accessibility

[VERIFY:UI-005] A skip-to-content link SHALL be provided as the first focusable
element on every page. It becomes visible on focus and links to the main content
area via the #main-content id anchor. The link uses sr-only styles when not focused.
→ Implementation: frontend/app/globals.css:61

[VERIFY:UI-006] The main navigation SHALL include aria-label="Main navigation"
and all interactive elements must have visible focus indicators (focus:ring-2
focus:ring-ring). Navigation links are keyboard-accessible via tab order.
→ Implementation: frontend/components/nav.tsx:9

[VERIFY:UI-007] Error boundaries SHALL render with role="alert" to announce
errors to screen readers. The error message and a "Try again" recovery action
button must be present. Fallback text is shown when error.message is empty.
→ Implementation: frontend/app/error.tsx:7

## Server Actions

[VERIFY:UI-008] All mutation operations SHALL use Next.js Server Actions defined
in a centralized actions.ts file. Every Server Action must check response.ok
before performing a redirect to prevent redirecting on error responses. Actions
cover: login, register, logout, create/delete customer, create/transition/delete
work order, create technician, create/update invoice, create route, create GPS event.
→ Implementation: frontend/app/actions.ts:12

## Component Library

The following 8 shadcn/ui components are used:

1. **Button** - Primary actions, form submissions, with variant support (default, outline)
2. **Card** - Content containers for dashboard stats, forms, tables
3. **Input** - Text, email, password, number, datetime-local inputs with HTML5 validation
4. **Label** - Form field labels with htmlFor association for accessibility
5. **Badge** - Status indicators with success, warning, default, secondary variants
6. **Select** - Dropdown selectors for roles, customers, technicians, work orders
7. **Table** - Data display for work orders, customers, invoices, technicians, routes
8. **Dialog** - Modal overlays for create forms (customers, work orders, invoices)

## Page Structure

Every route includes:
- `page.tsx` - Main page component (Server Component for data pages, Client for forms)
- `loading.tsx` - Skeleton loading state with animate-pulse and role="status"
- Auth check via getCurrentUser() with redirect to /login if null

### Pages

| Route | Purpose | Data Fetched |
|-------|---------|-------------|
| /login | Authentication | None (client-side form) |
| /register | Account creation | None (client-side form) |
| /dashboard | Status overview | WorkOrder[] for status counts |
| /work-orders | Work order management | WorkOrder[], Customer[], Technician[] |
| /customers | Customer management | Customer[] |
| /technicians | Technician registry | Technician[] with user email |
| /routes | Route planning | Route[] with technician and work order |
| /invoices | Invoice management | Invoice[], WorkOrder[] |

## Loading States

All loading.tsx files use:
- `role="status"` and `aria-busy="true"` for screen reader accessibility
- `animate-pulse` with `bg-muted` for skeleton placeholders
- Layout matching the actual page structure for minimal layout shift
