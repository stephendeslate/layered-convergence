# Frontend Specification

## Overview

The frontend is built with Next.js 15, React 19, and the App Router.
It uses shadcn/ui components styled with Tailwind CSS 4 and CSS custom
properties for theming.

## Components (shadcn/ui)

<!-- VERIFY: FD-UI-COMP-001 — Button component -->
<!-- VERIFY: FD-UI-UTIL-001 — cn() utility for class merging -->

The following 8 shadcn/ui components are implemented:

1. **Button** — CVA variants (default, destructive, outline, secondary, ghost, link)
2. **Badge** — Status and category labels with variant support
3. **Card** — Card, CardHeader, CardTitle, CardContent composition
4. **Input** — Form input with focus ring and disabled states
5. **Label** — Accessible form labels with forwardRef
6. **Alert** — Alert, AlertTitle, AlertDescription with role="alert"
7. **Skeleton** — Animated loading placeholder with animate-pulse
8. **Table** — Table, TableHeader, TableBody, TableRow, TableHead, TableCell

All components use the `cn()` utility (clsx + tailwind-merge) for
class name merging.

## Pages

<!-- VERIFY: FD-UI-HOME-001 — Home page with measureDuration, formatCoordinates, truncateText usage -->
<!-- VERIFY: FD-UI-WO-001 — Work orders list page with table, badges, pagination -->
<!-- VERIFY: FD-UI-WO-002 — Work order status badges with color mapping -->
<!-- VERIFY: FD-UI-TECH-001 — Technicians list page with table, status badges, GPS coordinates -->
<!-- VERIFY: FD-UI-SCHED-001 — Schedule page with table and date formatting -->

### Home (/)

Dashboard with stat cards showing active work orders, technicians on duty,
storage usage (formatted via formatBytes), and HQ location (formatted via
formatCoordinates). Displays the latest work order description truncated
via truncateText.

### Work Orders (/work-orders)

Table view of all work orders with status badges, priority badges,
assignee names, GPS coordinates, and creation dates. Uses truncateText
for long titles.

### Technicians (/technicians)

Table view of all technicians with specialty, status badges, GPS
coordinates (formatted via formatCoordinates), and active order counts.

### Schedule (/schedule)

Table view of dispatch schedules with work order details, technician
names, formatted dates, and status badges. Includes dynamically imported
schedule stats component.

## Navigation

<!-- VERIFY: FD-UI-NAV-001 — Main navigation component -->

Client-side navigation with Next.js Link components. Three routes:
Work Orders, Technicians, Schedule. Accessible navigation landmark
with aria-label.

## Layout and Theme

<!-- VERIFY: FD-UI-LAYOUT-001 — Root layout with Nav -->
<!-- VERIFY: FD-UI-BASE-001 — Base theme with CSS custom properties -->

Root layout includes the Nav component and a centered main content area.
Theme uses CSS custom properties with @media (prefers-color-scheme: dark)
for dark mode support (NOT .dark class toggle).

## Loading States

<!-- VERIFY: FD-UI-LOAD-001 — Root loading skeleton with accessibility attributes -->
<!-- VERIFY: FD-UI-WO-003 — Work orders loading skeleton with accessibility -->
<!-- VERIFY: FD-UI-TECH-002 — Technicians loading skeleton with accessibility -->
<!-- VERIFY: FD-UI-SCHED-004 — Schedule loading skeleton with accessibility -->

All loading states use Skeleton components with role="status",
aria-busy="true", and descriptive aria-label attributes.

## Error Boundaries

<!-- VERIFY: FD-UI-ERR-001 — Root error boundary with focus management and retry -->
<!-- VERIFY: FD-UI-WO-004 — Work orders error boundary with focus management -->
<!-- VERIFY: FD-UI-TECH-003 — Technicians error boundary with focus management -->
<!-- VERIFY: FD-UI-SCHED-005 — Schedule error boundary with focus management -->

All error boundaries use Alert with role="alert", useRef for focus
management (auto-focus on mount), and a retry button.

## Server Actions

<!-- VERIFY: FD-UI-ACT-001 — Server actions for work order and technician mutations -->
<!-- VERIFY: FD-UI-ACT-002 — Server action input sanitization -->

Server actions handle form submissions for creating work orders,
updating work order status, and creating technicians. All inputs
are sanitized using the shared sanitizeInput utility.

## Bundle Optimization (L7)

<!-- VERIFY: FD-UI-SCHED-002 — Schedule dynamic import for bundle optimization (L7) -->
<!-- VERIFY: FD-UI-SCHED-003 — Schedule stats component (dynamically imported for L7 bundle optimization) -->

The ScheduleStats component is loaded via next/dynamic to reduce
initial bundle size. A Skeleton loading fallback is shown during
the dynamic import.

## Cross-References

- [System Architecture](./system-architecture.md) — Monorepo structure and technology stack
