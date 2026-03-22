# Frontend UI

**Project:** field-service-dispatch
**Layer:** 6 — Security
**Version:** 1.0.0

---

## Overview

The Next.js 15 frontend uses App Router with React 19. The UI library
consists of 8 shadcn/ui-style components using CSS custom properties
for theming. Dark mode uses @media (prefers-color-scheme: dark).
See also: system-architecture.md for shared package integration.

## Component Library

The UI components follow the shadcn/ui pattern with class-variance-authority
for variant management and clsx + tailwind-merge for class merging.

- VERIFY: FD-UI-COMP-001 — Button component with variant and size props
- VERIFY: FD-UI-UTIL-001 — cn() utility combines clsx and tailwind-merge

Components: button, badge, card, input, label, alert, skeleton, table.

## Theme System

The theme uses CSS custom properties defined in globals.css with
system-level dark mode detection via prefers-color-scheme media query.

- VERIFY: FD-UI-BASE-001 — Base theme with CSS custom properties in :root

## Layout

The root layout includes the navigation bar and wraps children in a
max-width container for consistent page layout.

- VERIFY: FD-UI-LAYOUT-001 — Root layout renders Nav and main content area
- VERIFY: FD-UI-NAV-001 — Navigation with links to work orders, technicians, schedule

## Pages

Each route has a page, loading state, and error boundary.

- VERIFY: FD-UI-HOME-001 — Home page displays dashboard stats and quick links
- VERIFY: FD-UI-WO-001 — Work orders page with table including CANCELLED and FAILED status
- VERIFY: FD-UI-TECH-001 — Technicians page with cards and GPS coordinates

## Loading States

Loading states use the Skeleton component with role="status" and
aria-busy="true" for accessibility compliance.

- VERIFY: FD-UI-LOAD-001 — Loading states use role="status" and aria-busy="true"

## Error Boundaries

Error boundaries use role="alert" with useRef and focus management
for screen reader accessibility.

- VERIFY: FD-UI-ERR-001 — Error boundaries use role="alert" with focus management

## Security

The frontend contains zero uses of dangerouslySetInnerHTML. All user
content is rendered through React's default JSX escaping which prevents
XSS. Server actions validate response status before processing.

## Shared Package Integration

The web app imports from @field-service-dispatch/shared:
- Types: WorkOrder, Technician, PaginatedResult
- Constants used by server actions and display logic
