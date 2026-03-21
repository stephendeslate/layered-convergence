# UI Specification — Analytics Engine

## Overview

The frontend is built with Next.js 15 App Router, Tailwind CSS 4, and shadcn/ui
components. It prioritizes accessibility (WCAG 2.1 AA) and dark mode support.

## Technology Stack

### Next.js 15 App Router
The application uses file-based routing with the App Router convention:
- `app/page.tsx` — home page
- `app/login/page.tsx` — login form
- `app/register/page.tsx` — registration form
- `app/dashboard/page.tsx` — dashboard management
- `app/data-sources/page.tsx` — data source listing
- `app/pipelines/page.tsx` — pipeline management
- `app/widgets/page.tsx` — widget listing
- `app/embeds/page.tsx` — embed management
- `app/sync-runs/page.tsx` — sync run history
- `app/data-points/page.tsx` — data point listing

### Tailwind CSS 4
Styling uses Tailwind CSS 4 with the new import syntax in `globals.css`.

[VERIFY:UI-001] Tailwind CSS 4 @import syntax -> Implementation: frontend/app/globals.css:2
[VERIFY:UI-002] Dark mode via @media prefers-color-scheme -> Implementation: frontend/app/globals.css:22

### shadcn/ui Components
Eight components are used from the shadcn/ui library:
1. Button — primary action triggers
2. Card — content containers
3. Input — text input fields
4. Label — form field labels
5. Select — dropdown selection
6. Badge — status indicators
7. Table — data display
8. Dialog — modal interactions

[VERIFY:UI-003] Button component with variants -> Implementation: frontend/components/ui/button.tsx:1

## Accessibility

### Navigation
The root layout includes a skip-to-content link that appears on focus,
allowing keyboard users to bypass the navigation menu.

[VERIFY:UI-004] Nav component in root layout -> Implementation: frontend/components/nav.tsx:1
[VERIFY:UI-005] Root layout with skip-to-content -> Implementation: frontend/app/layout.tsx:1

### Loading States
Every route segment includes a `loading.tsx` file with:
- `role="status"` — announces loading state to screen readers
- `aria-busy="true"` — indicates content is being loaded
- `<span className="sr-only">Loading...</span>` — screen-reader-only text

### Error States
Every route segment includes an `error.tsx` file with:
- `role="alert"` — announces errors to screen readers
- `useRef` + `focus()` — auto-focuses the error heading for keyboard users
- Reset button to retry the failed operation

### Server Actions
The `actions.ts` file uses the `'use server'` directive and checks `response.ok`
before performing any redirect.

[VERIFY:UI-006] Server actions with 'use server' and response.ok check -> Implementation: frontend/app/actions.ts:1
[VERIFY:UI-007] Keyboard navigation tests -> Implementation: frontend/__tests__/keyboard-navigation.test.tsx:1

## Dark Mode

Dark mode is implemented via CSS `@media (prefers-color-scheme: dark)` in
`globals.css`. CSS custom properties are redefined in the dark media query,
ensuring all components automatically adapt.

## Layout Structure

The root layout (`app/layout.tsx`) provides:
1. Skip-to-content link (first focusable element)
2. Navigation bar with links to all route segments
3. Main content area with `id="main-content"`
4. Maximum width constraint (7xl) with responsive padding

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for user-facing requirements
- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for frontend architecture
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for accessibility test approach
