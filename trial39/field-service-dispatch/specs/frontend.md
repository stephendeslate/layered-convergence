# Frontend Specification

## Overview

The frontend is built with Next.js 15 App Router, React 19, Tailwind CSS 4,
and shadcn/ui components. It communicates with the API via server actions
and a typed API client.

## Configuration

<!-- VERIFY: FD-UI-CONFIG-001 — Next.js configuration with transpile packages -->

Next.js is configured to transpile the shared workspace package and enable
server actions with a 1MB body size limit.

<!-- VERIFY: FD-UI-CONFIG-002 — Tailwind CSS configuration -->

Tailwind scans app/, components/, and lib/ directories for class usage.

## Layout

<!-- VERIFY: FD-UI-LAYOUT-001 — Root layout with Nav component -->

The root layout includes the Nav component and wraps children in a
max-width container with consistent padding.

<!-- VERIFY: FD-UI-BASE-001 — Base application shell with CSS custom properties -->

CSS custom properties define the color system with automatic dark mode
via @media (prefers-color-scheme: dark).

## Navigation

<!-- VERIFY: FD-UI-NAV-001 — Navigation component in root layout -->

The Nav component provides links to Dashboard, Work Orders, Technicians,
and Schedule pages.

## Pages

<!-- VERIFY: FD-UI-HOME-001 — Dashboard home page with overview cards -->

The dashboard displays summary cards for open work orders, active
technicians, completed today, and system usage.

<!-- VERIFY: FD-UI-WO-001 — Work orders list page with table and status badges -->
<!-- VERIFY: FD-UI-WO-002 — Work order priority display with color-coded badges -->

The work orders page renders a table with status and priority badges,
GPS coordinates formatted via formatCoordinates, and truncated titles.

<!-- VERIFY: FD-UI-TECH-001 — Technicians list page with status indicators -->

The technicians page displays a table with status badges, specialties,
GPS locations, and active job counts.

<!-- VERIFY: FD-UI-SCHED-001 — Schedule page with dynamic import for ScheduleStats -->
<!-- VERIFY: FD-UI-SCHED-002 — ScheduleStats loaded via next/dynamic for bundle optimization -->

The schedule page uses next/dynamic to lazy-load the ScheduleStats component
for bundle size optimization (L7 requirement).

## Loading States

<!-- VERIFY: FD-UI-LOAD-001 — Root loading state with role="status" and aria-busy -->
<!-- VERIFY: FD-UI-LOAD-002 — Work orders loading state -->
<!-- VERIFY: FD-UI-LOAD-003 — Technicians loading state -->
<!-- VERIFY: FD-UI-LOAD-004 — Schedule loading state -->

All routes have loading.tsx files with role="status" and aria-busy="true"
attributes for accessibility compliance.

## Error Boundaries

<!-- VERIFY: FD-UI-ERR-001 — Root error boundary with role="alert" and focus management -->
<!-- VERIFY: FD-UI-ERR-002 — Work orders error boundary with focus management -->
<!-- VERIFY: FD-UI-ERR-003 — Technicians error boundary with focus management -->
<!-- VERIFY: FD-UI-ERR-004 — Schedule error boundary with focus management -->

All routes have error.tsx files with role="alert", useRef for focus management,
and a retry button.

## UI Components

<!-- VERIFY: FD-UI-COMP-001 — Button component with variants -->
<!-- VERIFY: FD-UI-COMP-002 — Badge component with variant styles -->
<!-- VERIFY: FD-UI-COMP-003 — Card component composition -->
<!-- VERIFY: FD-UI-COMP-004 — Input component -->
<!-- VERIFY: FD-UI-COMP-005 — Label component -->
<!-- VERIFY: FD-UI-COMP-006 — Alert component with variants -->
<!-- VERIFY: FD-UI-COMP-007 — Skeleton loading placeholder -->
<!-- VERIFY: FD-UI-COMP-008 — Table component composition -->

All 8 shadcn/ui components (Button, Badge, Card, Input, Label, Alert,
Skeleton, Table) are implemented with consistent variant patterns using
cva (class-variance-authority) and the cn() utility.

## Utilities

<!-- VERIFY: FD-UI-UTIL-001 — cn utility with clsx and tailwind-merge -->

The cn() utility uses clsx for conditional classes and tailwind-merge
for deduplication of conflicting Tailwind classes.

<!-- VERIFY: FD-UI-API-001 — API client for backend communication -->

The API client provides typed fetch wrapper for backend communication.

## Server Actions

<!-- VERIFY: FD-UI-ACT-001 — Server actions for work order and technician mutations -->
<!-- VERIFY: FD-UI-ACT-002 — Server action response.ok check and input sanitization -->

Server actions use 'use server' directive, sanitize inputs via shared
sanitizeInput, and check response.ok before returning results.

## Cross-References

- See [Security](./security.md) for CSP and XSS prevention
- See [Performance](./performance.md) for bundle optimization
