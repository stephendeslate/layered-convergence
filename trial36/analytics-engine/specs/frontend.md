# Frontend Specification

## Overview

Next.js ^15.0.0 web application using App Router with Server Components as the default
rendering strategy. Client Components are used only where interactivity is required
(error boundaries, navigation).

## Routes

| Route | Type | Description |
|-------|------|-------------|
| `/` | Server Component | Home page with feature cards |
| `/dashboards` | Server Component | Dashboard listing with table |
| `/pipelines` | Server Component | Pipeline listing with status badges |
| `/reports` | Server Component | Report listing with status tracking |

Each route has:
- `loading.tsx` with `role="status" aria-busy="true"`
- `error.tsx` with `role="alert"`, `useRef`, and `headingRef.current?.focus()` in useEffect

## Components

### Layout Components

- **Nav**: Client Component with main navigation links (Dashboards, Pipelines, Reports)
- **RootLayout**: Server Component wrapping all pages with Nav and metadata

### UI Components (8 total)

All components use `cn()` utility for class merging (clsx + tailwind-merge).

1. **Button**: Variants (default, destructive, outline, ghost), sizes (default, sm, lg)
2. **Badge**: Variants (default, secondary, destructive, outline)
3. **Card**: Compound component (Card, CardHeader, CardContent, CardFooter)
4. **Input**: Standard HTML input with consistent styling
5. **Label**: Form label with consistent typography
6. **Alert**: Variants (default, destructive), includes role="alert"
7. **Skeleton**: Loading placeholder with pulse animation, aria-hidden="true"
8. **Table**: Compound component (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)

## Server Actions

Located in `app/actions.ts` with `'use server'` directive:
- `fetchDashboards(page, pageSize)`: Fetches dashboards from API with response.ok check
- `fetchPipelines(page, pageSize)`: Fetches pipelines from API with response.ok check

## Dark Mode

CSS custom properties with `@media (prefers-color-scheme: dark)` media query.
No JavaScript theme toggle; follows system preference.

## Accessibility

- All loading states have `role="status"` and `aria-busy="true"`
- All error states have `role="alert"` with auto-focused heading
- Skeleton components have `aria-hidden="true"`
- No `dangerouslySetInnerHTML` anywhere in codebase
- No raw `<select>` elements in pages
- jest-axe tests on all 8 UI components
- Keyboard navigation tests (Tab, Enter, Space)

## VERIFY Tags

- `AE-FE-001`: Next.js config with standalone output and security headers <!-- VERIFY: AE-FE-001 -->
- `AE-FE-002`: Dark mode via prefers-color-scheme media query <!-- VERIFY: AE-FE-002 -->
- `AE-FE-003`: Root layout with Nav component and metadata <!-- VERIFY: AE-FE-003 -->
- `AE-FE-004`: Nav component with navigation links <!-- VERIFY: AE-FE-004 -->
- `AE-FE-005`: fetchDashboards server action with response.ok check <!-- VERIFY: AE-FE-005 -->
- `AE-FE-006`: fetchPipelines server action with response.ok check <!-- VERIFY: AE-FE-006 -->
- `AE-FE-007`: Home page with feature cards <!-- VERIFY: AE-FE-007 -->
- `AE-FE-008`: Loading state with role="status" aria-busy="true" <!-- VERIFY: AE-FE-008 -->
- `AE-FE-009`: Error state with role="alert" and auto-focused heading <!-- VERIFY: AE-FE-009 -->
- `AE-FE-010`: Dashboards page with table layout <!-- VERIFY: AE-FE-010 -->
- `AE-FE-011`: Pipelines page with status badges <!-- VERIFY: AE-FE-011 -->
- `AE-FE-012`: Reports page with status tracking <!-- VERIFY: AE-FE-012 -->
- `AE-UI-001`: Button component with variants and sizes <!-- VERIFY: AE-UI-001 -->
- `AE-UI-002`: Badge component with variants <!-- VERIFY: AE-UI-002 -->
- `AE-UI-003`: Card compound component <!-- VERIFY: AE-UI-003 -->
- `AE-UI-004`: Input component with consistent styling <!-- VERIFY: AE-UI-004 -->
- `AE-UI-005`: Label component with typography <!-- VERIFY: AE-UI-005 -->
- `AE-UI-006`: Alert component with role="alert" <!-- VERIFY: AE-UI-006 -->
- `AE-UI-007`: Skeleton component with aria-hidden <!-- VERIFY: AE-UI-007 -->
- `AE-UI-008`: Table compound component <!-- VERIFY: AE-UI-008 -->
