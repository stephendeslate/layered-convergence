# Frontend UI

**Project:** escrow-marketplace
**Layer:** 5 — Monorepo
**Version:** 1.0.0
**Cross-references:** system-architecture.md, api.md

---

## Overview

The frontend is built with Next.js 15 using the App Router. It provides
a marketplace interface for managing listings, transactions, disputes,
and account settings. The UI uses shadcn/ui components with Tailwind CSS.

## Component Library

Eight shadcn/ui components are provided in apps/web/components/ui/:
button, badge, card, input, label, alert, skeleton, and table.
All components use the cn() utility for class merging.

- VERIFY: EM-UI-COMP-001 — Button component with variants and sizes
- VERIFY: EM-UI-UTIL-001 — cn() utility using clsx and tailwind-merge

## Theme System

The theme uses CSS custom properties with oklch color values.
Light mode is the default, and dark mode is activated automatically
via the prefers-color-scheme media query.

- VERIFY: EM-UI-BASE-001 — Base theme variables in :root
- VERIFY: EM-UI-DARK-001 — Dark mode via @media (prefers-color-scheme: dark)

## Layout and Navigation

The root layout wraps all pages with a navigation component and main
content area. Navigation uses semantic HTML with aria-label.

- VERIFY: EM-UI-LAYOUT-001 — Root layout imports Nav and wraps children
- VERIFY: EM-UI-NAV-001 — Navigation with aria-label="Main navigation"

## Pages

### Home Page
Displays platform overview with storage metrics using formatBytes.

- VERIFY: EM-UI-HOME-001 — Home page uses formatBytes from shared

### Listings
Lists marketplace listings with prices using formatCurrency.

- VERIFY: EM-UI-LIST-001 — Listings page with card grid and prices

### Transactions
Shows transaction status table with badge-based status indicators.

- VERIFY: EM-UI-TXN-001 — Transactions page with status table

### Disputes
Displays dispute tracking table with open and resolved statuses.

- VERIFY: EM-UI-DISP-001 — Disputes page with dispute tracking

### Settings
Provides account and payment preference configuration forms.

- VERIFY: EM-UI-SET-001 — Settings page with form inputs

## Loading States

Every route has a loading.tsx with role="status" and aria-busy="true"
using Skeleton components for visual feedback.

- VERIFY: EM-UI-LOAD-001 — Loading states with role="status" aria-busy="true"

## Error States

Every route has an error.tsx with role="alert", useRef for focus
management, and a retry button.

- VERIFY: EM-UI-ERR-001 — Listings error state with role="alert" useRef focus
- VERIFY: EM-UI-ERR-002 — Transactions error state with role="alert" useRef focus
