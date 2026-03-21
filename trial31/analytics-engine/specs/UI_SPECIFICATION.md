# UI Specification — Analytics Engine

## Overview
The frontend uses Next.js App Router with shadcn/ui components,
Tailwind CSS, and accessibility-first design patterns.

See also: [TESTING_STRATEGY.md](TESTING_STRATEGY.md), [PRODUCT_VISION.md](PRODUCT_VISION.md)

## Component Library
<!-- VERIFY:AE-SHADCN-COMPONENTS -->
Eight shadcn/ui components in frontend/components/ui/:
1. button.tsx — Primary action component with variants
2. input.tsx — Text input with focus ring styling
3. label.tsx — Form label using @radix-ui/react-label
4. card.tsx — Container with header, title, content sections
5. badge.tsx — Status indicator with variant support
6. dialog.tsx — Modal dialog using @radix-ui/react-dialog
7. select.tsx — Dropdown using @radix-ui/react-select
8. table.tsx — Data table with header, body, row, cell components

## Dark Mode
<!-- VERIFY:AE-DARK-MODE -->
CSS custom properties support dark mode via prefers-color-scheme media query.
All components reference CSS variables (e.g., var(--primary)) instead of
hardcoded colors for automatic theme switching.

## Utility Function
<!-- VERIFY:AE-CN-UTILITY -->
The cn() function in lib/utils.ts combines clsx and tailwind-merge
for conditional class name merging without conflicts.

## Skip Navigation
<!-- VERIFY:AE-SKIP-LINK -->
Root layout includes a skip-to-content link as the first focusable element.
Uses sr-only class with focus:not-sr-only for screen reader and keyboard users.

## Form Controls
<!-- VERIFY:AE-SELECT-COMPONENT -->
Registration page uses shadcn Select component (not raw HTML select).
SelectTrigger, SelectContent, and SelectItem from @radix-ui/react-select
provide accessible dropdown functionality.

## Loading States
<!-- VERIFY:AE-LOADING-STATES -->
Every route (login, register, dashboard, pipelines) has a loading.tsx file.
Each loading component uses role="status" and aria-busy="true" attributes
for screen reader announcement of loading state.

## Error States
<!-- VERIFY:AE-ERROR-STATES -->
Every route has an error.tsx file with:
- role="alert" on the container div
- useRef for the heading element
- useEffect to focus the heading on mount
- tabIndex={-1} on the heading for programmatic focus
- Reset button to retry the failed operation

## Navigation
<!-- VERIFY:AE-NAV-ARIA -->
Nav component uses aria-label="Main navigation" on the nav element.
Links to Dashboard, Pipelines, Login, and Register pages.
