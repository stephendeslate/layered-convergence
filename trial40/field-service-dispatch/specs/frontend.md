# Frontend Specification

## Overview

The frontend is built with Next.js 15 (App Router), React 19, and Tailwind CSS 4.
UI components follow shadcn/ui patterns with CSS custom properties for theming.

## Pages

| Route | Description | Components Used |
|-------|-------------|-----------------|
| / | Dashboard with summary cards | Card, Badge |
| /work-orders | Work order list with status badges | Table, Badge |
| /technicians | Technician list with status indicators | Table, Badge |
| /schedules | Schedule list with stats | Table, ScheduleStats (dynamic) |
| /service-areas | Service area cards | Card |

## Components

### UI Components (shadcn/ui pattern)

- `Button` — variant (default, destructive, outline, secondary, ghost), size (default, sm, lg)
- `Badge` — variant (default, secondary, destructive, outline)
- `Card` — Card, CardHeader, CardTitle, CardDescription, CardContent
- `Input` — standard form input with ring focus styles
- `Label` — accessible form label
- `Alert` — Alert, AlertTitle, AlertDescription with role="alert"
- `Skeleton` — loading state placeholder with pulse animation
- `Table` — Table, TableHeader, TableBody, TableRow, TableHead, TableCell

### Application Components

- `Nav` — main navigation bar with accessible links
- `ScheduleStats` — dynamically imported for bundle optimization

## Dark Mode

- VERIFY: FD-SA-005 — Dark mode uses @media (prefers-color-scheme: dark), NOT .dark class

CSS custom properties switch values based on prefers-color-scheme media query.
All components reference CSS variables (e.g., `var(--background)`) instead of
hardcoded color values.

## Error Handling

Each route has an `error.tsx` boundary that:
1. Logs errors via structured JSON to stderr
2. Displays user-friendly error message
3. Provides a "Try again" button that calls reset()

## Loading States

Each route has a `loading.tsx` file using Skeleton components for
progressive content loading.

## Server Actions

- VERIFY: FD-API-001 — All fetch calls validate response.ok before parsing JSON
- Actions defined in `lib/actions.ts` with 'use server' directive
- API URL configurable via API_URL environment variable

## Bundle Optimization

- VERIFY: FD-PERF-008 — ScheduleStats loaded via next/dynamic with ssr: false

## Accessibility

- Semantic HTML (nav, main, headings, role attributes)
- Focus-visible ring styles on interactive elements
- Color contrast maintained in both light and dark themes
