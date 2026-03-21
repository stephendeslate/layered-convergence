# UI Specification

## Overview

The Analytics Engine frontend is built with Next.js 15 App Router, using shadcn/ui
components styled with Tailwind CSS 4. The UI follows accessibility-first principles
with WCAG 2.1 AA compliance.

## Component Library

The project uses 8 shadcn/ui components:

[VERIFY:UI-001] Utility function cn() for className merging -> Implementation: frontend/lib/utils.ts:1

### Design System

[VERIFY:UI-002] Global CSS with dark mode via @media (prefers-color-scheme: dark) -> Implementation: frontend/app/globals.css:1

## Layout Structure

[VERIFY:UI-003] Nav component with accessible navigation landmark -> Implementation: frontend/components/nav.tsx:1

[VERIFY:UI-004] Root layout with Nav component and skip-to-content link -> Implementation: frontend/app/layout.tsx:1

### Skip-to-Content

The root layout includes a skip-to-content link that is visually hidden but
becomes visible on focus, allowing keyboard users to bypass navigation.

## Route Pages

[VERIFY:UI-005] Home page with platform overview cards -> Implementation: frontend/app/page.tsx:1

### Loading States

Every route segment has a `loading.tsx` file with:
- `role="status"` for ARIA live region semantics
- `aria-busy="true"` to indicate loading state
- `<span className="sr-only">` with descriptive screen reader text

[VERIFY:UI-006] Root loading.tsx with role="status" and aria-busy="true" -> Implementation: frontend/app/loading.tsx:1

[VERIFY:UI-007] Root error.tsx with role="alert" -> Implementation: frontend/app/error.tsx:1

[VERIFY:UI-008] Dashboard page with widget count display -> Implementation: frontend/app/dashboard/page.tsx:1

[VERIFY:UI-009] Dashboard loading.tsx with role="status" and aria-busy="true" -> Implementation: frontend/app/dashboard/loading.tsx:1

[VERIFY:UI-010] Dashboard error.tsx with role="alert" -> Implementation: frontend/app/dashboard/error.tsx:1

[VERIFY:UI-011] Data sources page with type display -> Implementation: frontend/app/data-sources/page.tsx:1

[VERIFY:UI-012] Data sources loading.tsx with role="status" and aria-busy="true" -> Implementation: frontend/app/data-sources/loading.tsx:1

[VERIFY:UI-013] Data sources error.tsx with role="alert" -> Implementation: frontend/app/data-sources/error.tsx:1

[VERIFY:UI-014] Pipelines page with status badges -> Implementation: frontend/app/pipelines/page.tsx:1

[VERIFY:UI-015] Pipelines loading.tsx with role="status" and aria-busy="true" -> Implementation: frontend/app/pipelines/loading.tsx:1

[VERIFY:UI-016] Pipelines error.tsx with role="alert" -> Implementation: frontend/app/pipelines/error.tsx:1

[VERIFY:UI-017] Login page with accessible form -> Implementation: frontend/app/login/page.tsx:1

[VERIFY:UI-018] Login loading.tsx with role="status" and aria-busy="true" -> Implementation: frontend/app/login/loading.tsx:1

[VERIFY:UI-019] Login error.tsx with role="alert" -> Implementation: frontend/app/login/error.tsx:1

## shadcn/ui Components

[VERIFY:UI-020] Button component with variant and size props -> Implementation: frontend/components/ui/button.tsx:1

[VERIFY:UI-021] Card component with Header, Title, Description, Content, Footer -> Implementation: frontend/components/ui/card.tsx:1

[VERIFY:UI-022] Input component with focus-visible styles -> Implementation: frontend/components/ui/input.tsx:1

[VERIFY:UI-023] Label component with peer-disabled support -> Implementation: frontend/components/ui/label.tsx:1

[VERIFY:UI-024] Badge component with variant support -> Implementation: frontend/components/ui/badge.tsx:1

[VERIFY:UI-025] Select component with accessible styling -> Implementation: frontend/components/ui/select.tsx:1

[VERIFY:UI-026] Table component with responsive overflow -> Implementation: frontend/components/ui/table.tsx:1

[VERIFY:UI-027] Dialog component with aria-modal and role="dialog" -> Implementation: frontend/components/ui/dialog.tsx:1

## Keyboard Accessibility

[VERIFY:UI-028] Keyboard navigation tests for Tab, Enter/Space, focus management -> Implementation: frontend/__tests__/keyboard-navigation.test.tsx:2

## Cross-References

- Component tests: see TESTING_STRATEGY.md
- API integration via Server Actions: see API_CONTRACT.md
- Design tokens and dark mode: globals.css referenced in layout
