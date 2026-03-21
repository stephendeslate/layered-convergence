# UI Specification — Escrow Marketplace

## Overview
The Escrow Marketplace frontend uses Next.js App Router with shadcn/ui
components and Tailwind CSS. See TESTING_STRATEGY.md for component test
requirements and API_CONTRACT.md for data fetching patterns.

## Component Library
<!-- VERIFY:EM-SHADCN-COMPONENTS — 8 shadcn components -->
The UI uses 8 shadcn/ui components: button, input, label, card, badge,
dialog, select, table. All components use the cn() utility for class merging.

## Theming
<!-- VERIFY:EM-DARK-MODE — prefers-color-scheme dark mode -->
Dark mode is implemented via CSS custom properties with prefers-color-scheme
media query. No JavaScript theme toggle is required.

## Utility Functions
<!-- VERIFY:EM-CN-UTILITY — cn function with clsx + twMerge -->
The cn() utility combines clsx for conditional classes with tailwind-merge
for deduplication. Located in lib/utils.ts.

## Accessibility
<!-- VERIFY:EM-SKIP-LINK — Skip-to-content in layout -->
The root layout includes a skip-to-content link that becomes visible on focus.
The link targets the #main-content element.

<!-- VERIFY:EM-NAV-ARIA — Nav with aria-label -->
The Nav component uses aria-label="Main navigation" for screen reader
identification.

## Form Components
<!-- VERIFY:EM-SELECT-COMPONENT — shadcn Select in register -->
The registration form uses the shadcn Select component (not raw HTML select)
for role selection. Only BUYER, SELLER, and ARBITER options are available.

## Loading States
<!-- VERIFY:EM-LOADING-STATES — loading.tsx in all routes -->
Every route directory contains a loading.tsx file with role="status" and
aria-busy="true" attributes for accessible loading indicators.

## Error States
<!-- VERIFY:EM-ERROR-STATES — error.tsx with focus management -->
Every route directory contains an error.tsx file with role="alert", useRef,
and useEffect for automatic focus management on error.

## Design Patterns
See SECURITY_MODEL.md for form validation patterns and DATA_MODEL.md for
entity display conventions.
