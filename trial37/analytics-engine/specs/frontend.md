# Frontend Specification

## Overview

The frontend is a Next.js 15 application using the App Router. It provides
pages for dashboards, pipelines, and reports with server actions for data
fetching. Components use Tailwind CSS with a utility-first approach.

## Pages

### Home (/)
Landing page with overview statistics and navigation to main sections.

### Dashboards (/dashboards)
Lists dashboards with title, description, and creation date.

### Pipelines (/pipelines)
Lists pipelines with name, status badge, and schedule information.

### Reports (/reports)
Lists generated reports with title, format, and date.

## Page Structure

Each route directory contains page.tsx, loading.tsx, and error.tsx files
for proper loading states and error boundaries.

[VERIFY: AE-FE-01] The layout.tsx file imports and renders the Nav component.

[VERIFY: AE-FE-02] The error.tsx files use the 'use client' directive.

## Server Actions

[VERIFY: AE-FE-03] The actions.ts file uses the 'use server' directive and
checks response.ok before processing results.

## UI Components

All UI components accept className props merged using the cn() utility.
No raw HTML select elements are used.

[VERIFY: AE-FE-04] The cn() utility in lib/utils.ts combines clsx and
tailwind-merge for class name management.

[VERIFY: AE-FE-05] UI components (button, badge, card, input, label, alert,
skeleton, table) all use cn() for class merging.

## Shared Package Integration

[VERIFY: AE-FE-06] The dashboards page imports truncateText from
@analytics-engine/shared for description display.

[VERIFY: AE-FE-07] The pipelines page imports formatBytes from
@analytics-engine/shared for data size display.

[VERIFY: AE-FE-08] The reports page imports slugify from
@analytics-engine/shared for download link generation.
