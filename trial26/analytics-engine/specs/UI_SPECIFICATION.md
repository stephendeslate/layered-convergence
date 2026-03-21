# UI Specification: Analytics Engine

## Overview

The Analytics Engine frontend provides a responsive, accessible dashboard
interface built with Next.js 15, React 19, and shadcn/ui components.

## Page Inventory

### Root Layout (`app/layout.tsx`)
[VERIFY:AE-036] Root layout includes Nav component and skip-to-content link
for keyboard navigation accessibility.

### Home Page (`app/page.tsx`)
Welcome page with Card component displaying getting started content.

### Login Page (`app/login/page.tsx`)
[VERIFY:AE-037] Login form uses shadcn Input and Label components with
proper htmlFor/id associations for accessibility.

### Register Page (`app/register/page.tsx`)
[VERIFY:AE-038] Register page uses shadcn Select component (not raw <select>)
for role selection, preventing FM #71 violation.

### Dashboard Page (`app/dashboard/page.tsx`)
Dashboard overview with Card and Badge components showing analytics status.

## Component Hierarchy

### shadcn/ui Components (`components/ui/`)
[VERIFY:AE-039] 8 shadcn/ui components are provided: badge, button, card,
dialog, input, label, select, table. All use cn() utility for className merging.

### Navigation (`components/nav.tsx`)
Main navigation with links to Dashboard, Login, and Register pages.
Uses aria-label="Main navigation" for screen readers.

## User Flows

1. Registration: Home -> Register -> Submit -> Dashboard
2. Login: Home -> Login -> Submit -> Dashboard
3. Analytics: Dashboard -> View Pipelines / Data Sources / Dashboards

## Accessibility Requirements

[VERIFY:AE-040] All loading states use role="status" and aria-busy="true".
All error states use role="alert" with focus management via useRef and useEffect.

## Styling

[VERIFY:AE-041] Tailwind CSS 4 with @import "tailwindcss" syntax.
Dark mode via prefers-color-scheme media query with CSS custom properties.

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature requirements
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for component testing
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for auth UI requirements
