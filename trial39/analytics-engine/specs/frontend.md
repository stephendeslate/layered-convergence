# Frontend Specification

**Project:** Analytics Engine
**Prefix:** AE-FE
**Cross-references:** [API](api.md), [Security](security.md)

---

## Overview

The frontend is a Next.js 15 application with Tailwind CSS and shadcn/ui components.
It uses server actions for data fetching and dynamic imports for bundle optimization.

---

## Requirements

### AE-FE-01: Next.js Configuration
- VERIFY:AE-FE-01 — next.config.ts includes transpilePackages for shared, reactStrictMode, no poweredByHeader
- Ensures shared package TypeScript is transpiled correctly

### AE-FE-02: Root Layout
- VERIFY:AE-FE-02 — layout.tsx includes Nav component and imports globals.css
- Nav provides navigation links to dashboards, pipelines, reports

### AE-FE-03: Home Page with Dynamic Import
- VERIFY:AE-FE-03 — page.tsx uses next/dynamic for DashboardStats component
- Dynamic import reduces initial bundle size
- See [API](api.md) for data fetching patterns

### AE-FE-04: Dashboards Page
- VERIFY:AE-FE-04 — Dashboards page fetches data via server action and renders cards
- Uses formatBytes from shared for display
- See [Security](security.md) for sanitizeInput usage

### AE-FE-05: Pipelines Page
- VERIFY:AE-FE-05 — Pipelines page renders table with status badges
- Uses slugify from shared for URL-safe display

### AE-FE-06: Reports Page
- VERIFY:AE-FE-06 — Reports page renders cards with sanitized content
- Uses sanitizeInput from shared to strip HTML from report content

### AE-FE-07: Navigation Component
- VERIFY:AE-FE-07 — Nav component has aria-label and links to all routes
- Accessible navigation with proper semantic markup

### AE-FE-08: Server Actions
- VERIFY:AE-FE-08 — lib/api.ts uses 'use server' directive and checks response.ok
- Failed API calls throw descriptive errors
- All fetches go through centralized apiFetch helper

---

**SJD Labs, LLC** — Analytics Engine T39
