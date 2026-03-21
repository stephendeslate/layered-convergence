# UI Specification — Field Service Dispatch

## Overview

The frontend is built with Next.js 15 App Router, shadcn/ui components,
and Tailwind CSS 4. All routes include loading and error boundary files.

See: PRODUCT_VISION.md, SYSTEM_ARCHITECTURE.md

## Routes

| Path | Purpose | Auth Required |
|------|---------|---------------|
| `/` | Dashboard / landing | Yes |
| `/login` | User login | No |
| `/register` | User registration | No |
| `/work-orders` | Work order list | Yes |
| `/work-orders/[id]` | Work order detail | Yes |
| `/technicians` | Technician management | Yes |
| `/customers` | Customer management | Yes |
| `/invoices` | Invoice management | Yes |
| `/routes` | Route management | Yes |
| `/gps-events` | GPS event log | Yes |

## VERIFY:ROUTE_COUNT — All 10 routes exist with page.tsx files

## shadcn/ui Components

8 components are used throughout the application:

| Component | Usage |
|-----------|-------|
| `Button` | Form submissions, actions, navigation |
| `Card` | Content containers, dashboard widgets |
| `Input` | Text input fields in forms |
| `Label` | Form field labels, accessibility |
| `Select` | Dropdowns for status, role, priority |
| `Badge` | Status indicators, role labels |
| `Table` | Data listings (work orders, customers, etc.) |
| `Dialog` | Confirmations, detail views, forms |

## VERIFY:SHADCN_8_COMPONENTS — 8 shadcn/ui components (button, card, input, label, select, badge, table, dialog) exist

## Loading States

Every route directory contains a `loading.tsx` file:

```tsx
export default function Loading() {
  return (
    <div role="status" aria-busy="true">
      <div className="animate-pulse">Loading...</div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

Requirements:
- `role="status"` on container
- `aria-busy="true"` on container
- `<span className="sr-only">Loading...</span>` for screen readers
- Root-level `loading.tsx` exists at `app/loading.tsx`

## VERIFY:ROOT_LOADING — Root loading.tsx exists at app/loading.tsx
## VERIFY:LOADING_ARIA — Loading states have role="status" and aria-busy="true"

## Error States

Every route directory contains an `error.tsx` file:

```tsx
'use client';
export default function Error({ error, reset }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div role="alert" ref={ref} tabIndex={-1}>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

Requirements:
- `role="alert"` on container
- `useRef` + focus on mount for accessibility
- Root-level `error.tsx` exists at `app/error.tsx`

## VERIFY:ROOT_ERROR — Root error.tsx exists at app/error.tsx
## VERIFY:ERROR_FOCUS — Error components use useRef + focus

## Layout

### Root Layout (`app/layout.tsx`)
- Skip-to-content link as first focusable element
- Navigation component with links to all routes
- Dark mode support via `@media (prefers-color-scheme: dark)`
- Main content area with `id="main-content"`

## VERIFY:SKIP_TO_CONTENT — Skip-to-content link exists in root layout

### Navigation Component
- Horizontal nav bar with links to key routes
- Highlights current route
- Responsive design

## Server Actions

`app/actions.ts` with `'use server'` directive:
- `loginAction`: authenticates user, checks `response.ok` before redirect
- `registerAction`: registers user, checks `response.ok` before redirect
- `createWorkOrderAction`: creates work order
- `transitionWorkOrderAction`: transitions work order status

## VERIFY:USE_SERVER — actions.ts contains 'use server' directive
## VERIFY:RESPONSE_OK — Server actions check response.ok before redirect

## Dark Mode

Implemented via CSS media query, not JavaScript toggle:
```css
@media (prefers-color-scheme: dark) {
  /* dark mode styles */
}
```

## Tailwind CSS 4

Uses new Tailwind CSS 4 import syntax:
```css
@import "tailwindcss";
```

## VERIFY:TAILWIND_IMPORT — CSS uses @import "tailwindcss" syntax

## Accessibility Requirements

- All interactive elements are keyboard accessible
- Focus indicators are visible
- Color contrast meets WCAG 2.1 AA
- Form fields have associated labels
- Error messages are announced to screen readers
- Skip-to-content link for keyboard users

See: TESTING_STRATEGY.md, API_CONTRACT.md
