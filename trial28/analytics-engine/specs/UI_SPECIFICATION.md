# UI Specification — Analytics Engine

## Design System

### Component Library
The frontend uses 8 shadcn/ui components with the cn() utility:
1. Button — primary actions with variant and size props
2. Input — form text inputs with focus ring styles
3. Label — accessible form labels via Radix primitive
4. Card — content containers with header, content, footer sections
5. Badge — status indicators with variant styling
6. Dialog — modal overlays with Radix primitives
7. Select — dropdown selection with Radix (no raw HTML select)
8. Table — data display with header, body, row, cell components
<!-- VERIFY:AE-SHADCN-COMPONENTS — 8 shadcn components in components/ui/ -->

### Styling
Tailwind CSS with CSS custom properties for theming.
Dark mode via prefers-color-scheme media query.
<!-- VERIFY:AE-DARK-MODE — Dark mode via prefers-color-scheme -->

### cn() Utility
Combines clsx and tailwind-merge for conditional class merging.
Located in lib/utils.ts and imported by all UI components.
<!-- VERIFY:AE-CN-UTILITY — cn function with clsx + twMerge -->

## Page Structure

### Root Layout (app/layout.tsx)
- Skip-to-content link for keyboard users
- Nav component with aria-label="Main navigation"
- Main content area with id="main-content"
<!-- VERIFY:AE-SKIP-LINK — Skip-to-content link in layout.tsx -->

### Home Page (app/page.tsx)
Landing page with two cards: registration and login CTAs.
Uses Card and Button components from the design system.

### Login Page (app/login/page.tsx)
Form with email and password inputs.
Error display with role="alert" for screen readers.
Uses Label, Input, Button components.

### Register Page (app/register/page.tsx)
Form with email, password, and role selection.
Role selector uses shadcn Select component (not raw HTML select).
Options limited to VIEWER, EDITOR, ANALYST (no ADMIN).
<!-- VERIFY:AE-SELECT-COMPONENT — shadcn Select in register page -->

### Dashboard Page (app/dashboard/page.tsx)
Overview with metric cards and activity table.
Uses Card, Badge, Table components for data display.

## Loading States
Every route has a loading.tsx with:
- role="status" for screen reader announcement
- aria-busy="true" to indicate loading state
- Visually hidden text describing what is loading
<!-- VERIFY:AE-LOADING-STATES — loading.tsx in all 4 routes -->

## Error States
Every route has an error.tsx with:
- role="alert" for screen reader announcement
- useRef + useEffect for automatic focus management
- Retry button to reset the error boundary
<!-- VERIFY:AE-ERROR-STATES — error.tsx in all 4 routes with focus management -->

## Navigation
The Nav component provides:
- aria-label="Main navigation" for accessibility
- Links to Dashboard, Login, and Register pages
- Responsive layout with border separator
<!-- VERIFY:AE-NAV-ARIA — Nav with aria-label="Main navigation" -->

## Accessibility Requirements
- All form inputs have associated labels
- Focus indicators visible on all interactive elements
- Color contrast meets WCAG 2.1 AA standards
- Skip-to-content link available for keyboard navigation
- Error messages announced to screen readers via role="alert"
