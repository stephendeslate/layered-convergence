# Frontend Specification

## Overview
Next.js 15 application with React 19 and Tailwind CSS 4.
Uses shadcn/ui component library with cn() utility (clsx + tailwind-merge).

## Technology Stack
- Next.js 15 with App Router
- React 19 with Server Components
- Tailwind CSS 4 with CSS custom properties
- shadcn/ui components (8+): Button, Badge, Card, Input, Label, Alert, Skeleton, Table

## Application Structure
- VERIFY:AE-FE-01 — Next.js 15 config with transpilePackages for shared
- VERIFY:AE-FE-02 — cn() utility using clsx + tailwind-merge
- VERIFY:AE-FE-03 — Server Actions with 'use server' checking response.ok

### Layout
Root layout includes Nav component with navigation links.
- VERIFY:AE-FE-04 — Nav component in root layout
- VERIFY:AE-FE-05 — Root layout with Nav and metadata

### Pages
- / — Home page with DashboardStats (dynamic import) and quick actions
- /events — Events table with type badges
- /dashboards — Dashboard cards with public/private badges
- /data-sources — Data source table with type and cost
- /pipelines — Pipeline table with status badges

## Loading States
Every route has a loading.tsx with role="status" and aria-busy="true".
Uses Skeleton component for placeholder content.

## Error Boundaries
Every route has an error.tsx with:
- role="alert" on container
- useRef for heading element
- Focus management (headingRef.current?.focus())
- Structured error logging via formatLogEntry from shared
- VERIFY:AE-FE-08 — Error boundary with focus management and structured logging
Cross-reference: monitoring.md for error logging format.

## Dynamic Imports
DashboardStats component loaded via next/dynamic for bundle optimization.
- VERIFY:AE-FE-06 — Home page with dynamic import for DashboardStats
- VERIFY:AE-PERF-09 — DashboardStats loaded via next/dynamic

## Dark Mode
CSS custom properties with @media (prefers-color-scheme: dark).
No .dark class toggling. System preference only.

## Accessibility
- jest-axe tests for all UI components
- Keyboard navigation tests with userEvent
- ARIA roles on loading (status) and error (alert) states
- Focus management in error boundaries
- VERIFY:AE-FE-07 — Events page with accessible table display
- VERIFY:AE-TEST-06 — Accessibility tests with real jest-axe
- VERIFY:AE-TEST-07 — Keyboard navigation tests with userEvent

## Server Actions
All data fetching via Server Actions in src/lib/actions.ts.
Every action checks response.ok before returning data.
Uses sanitizeInput from shared package for input cleaning.
Cross-reference: api.md for endpoint contracts consumed by actions.
