# Frontend UI

**Project:** analytics-engine
**Layer:** 5 — Monorepo
**Version:** 1.0.0
**Cross-references:** system-architecture.md, api.md

---

## Overview

The frontend is built with Next.js 15 using the App Router. It provides
a dashboard-centric interface for managing analytics, pipelines, and
reports. The UI uses shadcn/ui components with Tailwind CSS.

## Component Library

Eight shadcn/ui components are provided in apps/web/components/ui/:
button, badge, card, input, label, alert, skeleton, and table.
All components use the cn() utility for class merging.

- VERIFY: AE-UI-COMP-001 — Button component with variants and sizes
- VERIFY: AE-UI-UTIL-001 — cn() utility using clsx and tailwind-merge

## Theme System

The theme uses CSS custom properties with oklch color values.
Light mode is the default, and dark mode is activated automatically
via the prefers-color-scheme media query.

- VERIFY: AE-UI-BASE-001 — Base theme variables in :root
- VERIFY: AE-UI-DARK-001 — Dark mode via @media (prefers-color-scheme: dark)

## Layout and Navigation

The root layout wraps all pages with a navigation component and main
content area. Navigation uses semantic HTML with aria-label.

- VERIFY: AE-UI-LAYOUT-001 — Root layout imports Nav and wraps children
- VERIFY: AE-UI-NAV-001 — Navigation with aria-label="Main navigation"

## Pages

### Home Page
Displays platform overview with data metrics using formatBytes.

- VERIFY: AE-UI-HOME-001 — Home page uses formatBytes from shared

### Dashboards
Lists all analytics dashboards with widget counts and data sizes.

- VERIFY: AE-UI-DASH-001 — Dashboards page with card grid

### Pipelines
Shows pipeline status table with badge-based status indicators.

- VERIFY: AE-UI-PIPE-001 — Pipelines page with status table

### Reports
Displays generated reports with file sizes using formatBytes.

- VERIFY: AE-UI-RPT-001 — Reports page with file size display

### Settings
Provides organization and data retention configuration forms.

- VERIFY: AE-UI-SET-001 — Settings page with form inputs

## Loading States

Every route has a loading.tsx with role="status" and aria-busy="true"
using Skeleton components for visual feedback.

- VERIFY: AE-UI-LOAD-001 — Loading states with role="status" aria-busy="true"

## Error States

Every route has an error.tsx with role="alert", useRef for focus
management, and a retry button.

- VERIFY: AE-UI-ERR-001 — Error states with role="alert" useRef focus
