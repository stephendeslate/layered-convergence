# UI Specification

## Overview

The Analytics Engine frontend is built with Next.js 15 (App Router), React 19, and shadcn/ui
components styled with Tailwind CSS 4. The interface follows a server-first rendering model
where data fetching happens in React Server Components and mutations flow through Server
Actions.

## Type Definitions

[VERIFY:UI-001] Frontend type definitions MUST match the backend API contract with Role restricted to VIEWER|EDITOR|ANALYST.
> Implementation: `frontend/lib/types.ts:1` — AuthUser.role typed as union without ADMIN

All API response types are defined in `frontend/lib/types.ts` and mirror the backend Prisma
models. The `AuthUser.role` type explicitly excludes ADMIN as a valid value.

## Visual Design

[VERIFY:UI-002] Dark mode MUST be supported via CSS prefers-color-scheme media query, not JavaScript toggling.
> Implementation: `frontend/app/globals.css:1` — @media (prefers-color-scheme: dark) block

The design system uses CSS custom properties (variables) defined in `globals.css`. Light mode
is the default, with dark mode activated automatically based on the user's OS preference:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: ...;
    --foreground: ...;
  }
}
```

## Component Hierarchy

### shadcn/ui Components (8 total)

[VERIFY:UI-003] The project MUST include 8 shadcn/ui components: Button, Card, Input, Label, Badge, Select, Table, Dialog.
> Implementation: `frontend/components/ui/button.tsx:1` — Button component with CVA variants

| Component | File | Usage |
|-----------|------|-------|
| Button | `components/ui/button.tsx` | Primary actions, navigation, form submission |
| Card | `components/ui/card.tsx` | Content containers, forms, dashboard cards |
| Input | `components/ui/input.tsx` | Text input fields in forms |
| Label | `components/ui/label.tsx` | Form field labels with htmlFor association |
| Badge | `components/ui/badge.tsx` | Status indicators (pipeline state, embed status) |
| Select | `components/ui/select.tsx` | Dropdown selection (role, type) |
| Table | `components/ui/table.tsx` | Data tables (dashboards, pipelines, data sources) |
| Dialog | `components/ui/dialog.tsx` | Modal confirmations |

## Navigation

[VERIFY:UI-004] Nav MUST be a shared component in the root layout with links to all main routes.
> Implementation: `frontend/components/nav.tsx:1` — Nav with aria-label="Main navigation"

The navigation bar appears on every page via the root layout. It includes links to:
Dashboards, Data Sources, Pipelines, Widgets, Embeds, and Login.

## Layout Structure

[VERIFY:UI-005] The root layout MUST include Nav component and skip-to-content accessibility link.
> Implementation: `frontend/app/layout.tsx:1` — layout with Nav and <a href="#main-content">

```
┌─────────────────────────────────────┐
│ [Skip to content]                   │  (visually hidden, keyboard accessible)
├─────────────────────────────────────┤
│ Nav: Logo | Dashboards | Sources    │
│       | Pipelines | Widgets | Login │
├─────────────────────────────────────┤
│                                     │
│  <main id="main-content">           │
│    {children}                       │
│  </main>                            │
│                                     │
└─────────────────────────────────────┘
```

## Error Handling

[VERIFY:UI-006] The error boundary MUST include role="alert" for screen reader announcement.
> Implementation: `frontend/app/error.tsx:1` — <div role="alert"> wrapping error content

The global error boundary (`error.tsx`) displays a card with the error message and a "Try
again" button that calls `reset()`. The `role="alert"` attribute ensures screen readers
announce the error immediately.

## Page Inventory

| Route | Type | Description |
|-------|------|-------------|
| `/` | Server | Landing page with platform description |
| `/auth/login` | Client | Login form with useActionState |
| `/auth/register` | Client | Registration form with role selection |
| `/dashboards` | Server | Dashboard list table |
| `/dashboards/new` | Client | Create dashboard form |
| `/dashboards/[id]` | Server | Dashboard detail with widgets |
| `/data-sources` | Server | Data source list table |
| `/data-sources/new` | Client | Create data source form |
| `/pipelines` | Server | Pipeline list with state badges |
| `/pipelines/new` | Client | Create pipeline form |
| `/widgets` | Server | Widget list across all dashboards |
| `/embeds` | Server | Embed list with expiration status |

## Loading States

Every route has a `loading.tsx` file that displays a centered "Loading..." indicator. This
follows Next.js 15 streaming patterns where the loading state is shown while Server Components
are being rendered.

## Accessibility Requirements

- Skip-to-content link as first focusable element
- All form inputs have associated labels (htmlFor/id or wrapping)
- Focus rings (ring-2) on all interactive elements
- role="alert" on error boundaries
- aria-label on navigation landmark
- Color contrast meets WCAG AA (managed via CSS custom properties)
- Keyboard navigation: full tab order through all interactive elements

## Cross-References

- API contract for data fetching: [API_CONTRACT.md](./API_CONTRACT.md)
- Component testing: [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
- Product vision: [PRODUCT_VISION.md](./PRODUCT_VISION.md)
