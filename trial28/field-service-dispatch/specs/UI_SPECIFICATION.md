# UI Specification — Field Service Dispatch

## Design System

### Component Library
8 shadcn/ui components with cn() utility:
1. Button — actions with variant/size props
2. Input — form text inputs with focus ring
3. Label — accessible form labels via Radix
4. Card — content containers with sections
5. Badge — status indicators (PENDING, ASSIGNED, COMPLETED)
6. Dialog — modal overlays via Radix
7. Select — dropdown role selection (no raw select)
8. Table — work order and invoice data display
<!-- VERIFY:FD-SHADCN-COMPONENTS — 8 shadcn components in components/ui/ -->

### Styling
Tailwind CSS with CSS custom properties.
Dark mode via prefers-color-scheme media query.
Green-themed color palette for field service branding.
<!-- VERIFY:FD-DARK-MODE — Dark mode via prefers-color-scheme -->

### cn() Utility
clsx + tailwind-merge for conditional class names.
<!-- VERIFY:FD-CN-UTILITY — cn with clsx + twMerge -->

## Page Structure

### Root Layout (app/layout.tsx)
- Skip-to-content link for keyboard accessibility
- Nav component with aria-label="Main navigation"
- Main content area with id="main-content"
<!-- VERIFY:FD-SKIP-LINK — Skip-to-content in layout -->

### Home Page (app/page.tsx)
Landing with registration and login cards.
Describes field service operations and features.

### Login Page (app/login/page.tsx)
Email and password form with error display.

### Register Page (app/register/page.tsx)
Registration form with shadcn Select for role.
Options: DISPATCHER, TECHNICIAN, MANAGER (no ADMIN).
<!-- VERIFY:FD-SELECT-COMPONENT — shadcn Select in register -->

### Dashboard Page (app/dashboard/page.tsx)
Overview with dispatch stats and work order table.
Shows pending orders, active routes, on-site technicians, unpaid invoices.

## Loading States
Every route has loading.tsx with:
- role="status" for screen readers
- aria-busy="true" for loading indication
- Visually hidden descriptive text
<!-- VERIFY:FD-LOADING-STATES — loading.tsx in all 4 routes -->

## Error States
Every route has error.tsx with:
- role="alert" for screen reader announcement
- useRef + useEffect for focus management
- Retry button for error recovery
<!-- VERIFY:FD-ERROR-STATES — error.tsx in all 4 routes with focus -->

## Navigation
Nav component provides:
- aria-label="Main navigation"
- Links to Dashboard, Login, Register
- Responsive layout
<!-- VERIFY:FD-NAV-ARIA — Nav with aria-label="Main navigation" -->

## Accessibility
- All inputs have associated labels
- Focus indicators on interactive elements
- WCAG 2.1 AA color contrast
- Skip-to-content link
- Screen reader announcements for errors and loading
