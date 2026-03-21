# UI Specification — Analytics Engine

## Overview

The frontend is built with Next.js 15 App Router and shadcn/ui components.
It follows WCAG 2.1 AA accessibility guidelines with proper focus management.

See also: [PRODUCT_VISION.md](PRODUCT_VISION.md), [TESTING_STRATEGY.md](TESTING_STRATEGY.md)

## Design System

### CSS Framework
- [VERIFY:AE-UI-001] Tailwind CSS 4 with @import "tailwindcss" syntax -> Implementation: apps/web/app/globals.css:1
- [VERIFY:AE-UI-002] Dark mode via @media (prefers-color-scheme: dark) -> Implementation: apps/web/app/globals.css:22
- CSS custom properties for theming (--background, --foreground, etc.)

### Component Library
- [VERIFY:AE-UI-003] Button component with multiple variants -> Implementation: apps/web/components/ui/button.tsx:1
- 8 shadcn/ui components: Button, Input, Card, Label, Table, Badge, Select, Dialog
- All components use cn() utility for class merging
- Consistent API with forwardRef pattern

## Layout and Navigation

### Root Layout
- [VERIFY:AE-UI-004] Nav component rendered in root layout -> Implementation: apps/web/components/nav.tsx:1
- [VERIFY:AE-UI-005] Skip-to-content link as first focusable element -> Implementation: apps/web/app/layout.tsx:1
- HTML lang="en" attribute for screen readers
- Main content area with max-width container

### Navigation Component
- Semantic <nav> element with aria-label
- Links to all major sections: Dashboard, Pipelines, Data Sources, etc.
- Responsive layout with flexbox

## Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| / | Home page with overview cards | No |
| /login | User authentication form | No |
| /register | New user registration form | No |
| /dashboard | Dashboard listing and management | Yes |
| /pipelines | Pipeline listing with status badges | Yes |
| /data-sources | Data source configuration | Yes |
| /data-points | Data point viewing with formatted values | Yes |
| /sync-runs | Sync run monitoring | Yes |
| /widgets | Widget management | Yes |
| /embeds | Embed token management | Yes |

## Server Actions
- [VERIFY:AE-UI-006] Server actions use 'use server' directive and check response.ok -> Implementation: apps/web/app/actions.ts:1
- loginAction: Authenticates user and redirects to dashboard
- registerAction: Creates account and redirects to login
- fetchPipelines: Retrieves pipeline data
- fetchDataSources: Retrieves data source data

## Accessibility

### Keyboard Navigation
- [VERIFY:AE-UI-007] Keyboard navigation tests verify Tab and Shift+Tab flow -> Implementation: apps/web/__tests__/keyboard-navigation.test.tsx:1
- All interactive elements are keyboard-accessible
- Logical tab order follows visual layout
- Skip-to-content link bypasses navigation

### Loading States
- Every route has loading.tsx with role="status" and aria-busy="true"
- Spinner animation with sr-only "Loading..." text

### Error States
- Every route has error.tsx with role="alert"
- useRef + focus management on error heading
- Retry button for error recovery

### Form Accessibility
- All inputs have associated labels via htmlFor
- Required fields have aria-required="true"
- Select component (not raw <select> in pages) from shadcn/ui
- Error messages are linked to inputs

## Shared Package Usage in Frontend

The frontend imports from @analytics-engine/shared:
1. Type definitions (PipelineDto, DataSourceDto, etc.) for type-safe data handling
2. REGISTERABLE_ROLES for the registration form role selector
3. PIPELINE_STATUSES for displaying available pipeline statuses
4. formatCurrency() for formatting data point values as currency
