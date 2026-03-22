# Frontend Specification

## Trial 38 | Analytics Engine

### Overview

Next.js 15 application with App Router, React 19, Tailwind CSS, and
custom UI components following shadcn/ui patterns. Dark mode is handled
via `@media (prefers-color-scheme: dark)` CSS, not JavaScript toggles.

### VERIFY: AE-FE-01 - App Router Structure

Routes follow Next.js App Router conventions:

```
app/
  layout.tsx        # Root layout with nav
  page.tsx          # Home page
  loading.tsx       # Root loading state
  error.tsx         # Root error boundary
  globals.css       # Global styles with dark mode
  actions.ts        # Server actions
  dashboards/
    page.tsx, loading.tsx, error.tsx
  pipelines/
    page.tsx, loading.tsx, error.tsx
  reports/
    page.tsx, loading.tsx, error.tsx
```

TRACED in: `apps/web/app/layout.tsx`

### VERIFY: AE-FE-02 - Loading States

Every route has a `loading.tsx` that renders accessible loading UI
with `role="status"` and `aria-busy="true"`. Loading components use
the Skeleton UI component for consistent shimmer effects.

TRACED in: `apps/web/app/loading.tsx`, `apps/web/app/dashboards/loading.tsx`

### VERIFY: AE-FE-03 - Error Boundaries

Every route has an `error.tsx` with `'use client'` directive. Error
components use `role="alert"`, `useRef` for focus management, and
provide a retry button calling `reset()`. Error details are displayed
using the Alert UI component.

TRACED in: `apps/web/app/error.tsx`, `apps/web/app/dashboards/error.tsx`

### VERIFY: AE-FE-04 - UI Components (8 shadcn/ui)

Eight UI components in `components/ui/`:

1. `button.tsx` - Button with variant prop (default, destructive, outline, ghost)
2. `badge.tsx` - Badge with variant prop (default, secondary, destructive, outline)
3. `card.tsx` - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
4. `input.tsx` - Styled input with focus ring
5. `label.tsx` - Form label with peer-disabled styles
6. `alert.tsx` - Alert, AlertTitle, AlertDescription with variant
7. `skeleton.tsx` - Animated pulse placeholder
8. `table.tsx` - Table, TableHeader, TableBody, TableRow, TableHead, TableCell

TRACED in: `apps/web/components/ui/button.tsx`

### VERIFY: AE-FE-05 - cn() Utility

The `cn()` utility combines `clsx` and `tailwind-merge` for className
merging. Located at `apps/web/lib/utils.ts`. Used by all UI components.

TRACED in: `apps/web/lib/utils.ts`

### VERIFY: AE-FE-06 - Dark Mode

Dark mode uses `@media (prefers-color-scheme: dark)` in `globals.css`
to set CSS custom properties. No JavaScript theme toggling. Components
reference CSS variables like `var(--background)`, `var(--foreground)`.

TRACED in: `apps/web/app/globals.css`

### VERIFY: AE-FE-07 - Server Actions

Data fetching uses Server Actions (`'use server'`) in `app/actions.ts`.
Each action calls the API via `fetch` with proper error handling
(checking `response.ok`). No `dangerouslySetInnerHTML` is used anywhere.

TRACED in: `apps/web/app/actions.ts`

### VERIFY: AE-FE-08 - Bundle Optimization

Heavy components are loaded via `next/dynamic` with `ssr: false` for
client-only interactive widgets. The `DashboardStats` component is
dynamically imported on the dashboards page to reduce initial bundle.

TRACED in: `apps/web/app/dashboards/page.tsx`

---

Cross-references: [system-architecture.md](system-architecture.md), [api.md](api.md)
