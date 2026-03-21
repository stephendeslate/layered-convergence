# UI Specification — Analytics Engine

## Overview
The Analytics Engine frontend uses Next.js ^15 App Router with Tailwind CSS
and shadcn/ui components. See PRODUCT_VISION.md for feature requirements
and TESTING_STRATEGY.md for frontend test coverage.

## Component Library
<!-- VERIFY:AE-SHADCN-COMPONENTS — 8 shadcn components -->
Eight shadcn/ui components are implemented in frontend/components/ui/:
1. **Button** — Primary actions with variant and size props
2. **Input** — Text input with focus ring styling
3. **Label** — Form labels using @radix-ui/react-label
4. **Card** — Content containers (Card, CardHeader, CardTitle, CardContent)
5. **Badge** — Status indicators with variant support
6. **Dialog** — Modal dialogs using @radix-ui/react-dialog
7. **Select** — Dropdown selection using @radix-ui/react-select
8. **Table** — Data tables (Table, TableHeader, TableBody, TableRow, etc.)

## Theme System
<!-- VERIFY:AE-DARK-MODE — prefers-color-scheme dark mode -->
The application uses CSS custom properties for theming with automatic
dark mode support via @media (prefers-color-scheme: dark). Variables include
background, foreground, primary, secondary, muted, accent, destructive,
border, input, and ring colors.

## Utility Function
<!-- VERIFY:AE-CN-UTILITY — cn function with clsx + twMerge -->
The cn() utility in lib/utils.ts combines clsx for conditional class names
with tailwind-merge for deduplication. All components use cn() for
className composition.

## Layout
<!-- VERIFY:AE-SKIP-LINK — Skip-to-content in layout -->
The root layout includes a skip-to-content link that becomes visible on
focus, allowing keyboard users to bypass the navigation. The main content
area has id="main-content" as the skip target.

## Form Components
<!-- VERIFY:AE-SELECT-COMPONENT — shadcn Select in register -->
The registration page uses the shadcn Select component instead of a raw
HTML select element. This ensures consistent styling and keyboard
accessibility across browsers. The Select displays VIEWER, EDITOR, and
ANALYST roles (ADMIN excluded per SECURITY_MODEL.md).

## Loading States
<!-- VERIFY:AE-LOADING-STATES — loading.tsx in all routes -->
Every route group has a loading.tsx file with:
- role="status" for screen reader announcement
- aria-busy="true" for loading state indication
- Animated spinner with visually hidden "Loading..." text
- Centered layout with minimum viewport height

Routes with loading states: login, register, dashboard, pipelines.

## Error States
<!-- VERIFY:AE-ERROR-STATES — error.tsx with focus management -->
Every route group has an error.tsx file (marked 'use client') with:
- role="alert" for screen reader announcement
- useRef on the heading element
- useEffect to focus the heading on mount for accessibility
- tabIndex={-1} on the heading for programmatic focus
- Reset button using the Button component
- Error message display from error.message prop

Routes with error handling: login, register, dashboard, pipelines.

## Navigation
<!-- VERIFY:AE-NAV-ARIA — Nav with aria-label -->
The Nav component includes:
- aria-label="Main navigation" on the nav element
- Links to Dashboard, Pipelines, Login, and Register pages
- Responsive layout with flexbox
- Border-bottom styling with theme-aware colors

## Page Structure
Four route groups, each with page.tsx, loading.tsx, and error.tsx:
1. **/login** — Login form with email and password fields
2. **/register** — Registration form with shadcn Select for roles
3. **/dashboard** — Dashboard listing with table and badges
4. **/pipelines** — Pipeline listing with status badges

See API_CONTRACT.md for the backend endpoints these pages consume.
