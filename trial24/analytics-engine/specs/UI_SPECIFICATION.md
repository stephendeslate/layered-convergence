# UI Specification — Analytics Engine

## Overview

The frontend is built with Next.js 15 App Router, using shadcn/ui components and Tailwind CSS 4
for styling. All routes include loading and error states with proper accessibility attributes.

## CSS Framework

The application uses Tailwind CSS 4 with the modern import syntax. The globals.css file uses
`@import "tailwindcss"` instead of the deprecated `@tailwind base` directives.

[VERIFY:UI-001] Tailwind CSS 4 import syntax — `@import "tailwindcss"` in globals.css.
> Implementation: `frontend/app/globals.css:2`

## Dark Mode

Dark mode is implemented via CSS custom properties that respond to the user's operating system
preference through `@media (prefers-color-scheme: dark)`.

[VERIFY:UI-002] Dark mode via @media (prefers-color-scheme: dark) with CSS custom properties.
> Implementation: `frontend/app/globals.css:4`

## Component Library

The UI uses 8 shadcn/ui components built on Radix UI primitives, ensuring consistent styling
and accessibility across the application.

[VERIFY:UI-003] Button component with multiple variants (default, destructive, outline, secondary, ghost, link).
> Implementation: `frontend/components/ui/button.tsx:1`

Components: button, card, input, label, select, badge, table, dialog

## Navigation

The Nav component provides primary navigation and is imported in the root layout. It includes
links to all main application sections.

[VERIFY:UI-004] Nav component present in root layout for primary navigation.
> Implementation: `frontend/components/nav.tsx:1`

## Root Layout

The root layout includes a skip-to-content link for keyboard accessibility and imports the
Nav component for consistent navigation across all pages.

[VERIFY:UI-005] Root layout includes skip-to-content link and Nav component.
> Implementation: `frontend/app/layout.tsx:1`

## Server Actions

Authentication operations use Next.js Server Actions with the 'use server' directive. Both
loginAction and registerAction check response.ok before redirecting.

[VERIFY:UI-006] Server actions with 'use server' directive — loginAction and registerAction check response.ok.
> Implementation: `frontend/app/actions.ts:1`

## Page Inventory

| Route | Page | Components Used |
|-------|------|----------------|
| / | Home | Card, Button |
| /login | Login | Card, Input, Label, Button |
| /register | Register | Card, Input, Label, Button, Select |
| /dashboard | Dashboard | Card, Badge |
| /data-sources | Data Sources | Table, Badge |
| /pipelines | Pipelines | Table, Badge |
| /widgets | Widgets | Card, Badge |
| /embeds | Embeds | Table, Badge |
| /sync-runs | Sync Runs | Table, Badge |
| /data-points | Data Points | Table |

## Loading States

Every route (including root) has a `loading.tsx` file with:
- `role="status"` attribute
- `aria-busy="true"` attribute
- `sr-only` text for screen readers ("Loading...")

## Error States

Every route (including root) has an `error.tsx` file with:
- `'use client'` directive
- `role="alert"` attribute
- `useRef` + `focus()` for screen reader announcement
- Retry button using the `reset` callback

## Keyboard Navigation

[VERIFY:UI-007] Keyboard navigation tests verify form accessibility and focus management.
> Implementation: `frontend/__tests__/keyboard-navigation.test.tsx:1`

## Accessibility Requirements

- Skip-to-content link (sr-only, visible on focus)
- All form fields have associated Label components
- No raw `<select>` elements outside ui/ wrapper
- Focus management in error boundaries
- axe-core validation in test suite

## Cross-References

- **PRODUCT_VISION.md**: Defines the user-facing capabilities rendered by the UI
- **SYSTEM_ARCHITECTURE.md**: Documents the frontend technology stack
- **TESTING_STRATEGY.md**: Describes how frontend components are tested
