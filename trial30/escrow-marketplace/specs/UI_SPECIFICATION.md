# UI Specification — Escrow Marketplace

## Overview
The Escrow Marketplace frontend is built with Next.js 15 App Router,
Tailwind CSS, and shadcn/ui components. See PRODUCT_VISION.md for
feature context and TESTING_STRATEGY.md for test coverage details.

## Component Library
<!-- VERIFY:EM-SHADCN-COMPONENTS — 8 shadcn components -->
The UI uses 8 shadcn/ui components, each in components/ui/:
1. Button — cva variants (default, destructive, outline, secondary, ghost, link)
2. Input — forwardRef with focus ring styling
3. Label — @radix-ui/react-label with peer-disabled styles
4. Card — Card, CardHeader, CardTitle, CardContent composites
5. Badge — cva variants (default, secondary, destructive, outline)
6. Dialog — @radix-ui/react-dialog with overlay and portal
7. Select — @radix-ui/react-select with trigger, content, item
8. Table — Table, TableHeader, TableBody, TableRow, TableHead, TableCell

## Dark Mode Support
<!-- VERIFY:EM-DARK-MODE — prefers-color-scheme dark mode -->
Dark mode is implemented via CSS custom properties in globals.css with
a @media (prefers-color-scheme: dark) query. All components reference
CSS variables (--background, --foreground, --primary, etc.) instead
of hardcoded color values.

## Utility Function
<!-- VERIFY:EM-CN-UTILITY — cn function with clsx + twMerge -->
The cn() utility in lib/utils.ts combines clsx for conditional classes
and tailwind-merge for deduplication. All components use cn() for
className composition.

## Navigation
<!-- VERIFY:EM-NAV-ARIA — Nav with aria-label -->
The Nav component uses aria-label="Main navigation" for screen reader
accessibility. It provides links to Transactions, Disputes, Login,
and Register pages.

## Skip-to-Content
<!-- VERIFY:EM-SKIP-LINK — Skip-to-content in layout -->
The root layout includes a skip-to-content link that becomes visible
on focus. It targets main#main-content for keyboard-first navigation.

## Form Components
<!-- VERIFY:EM-SELECT-COMPONENT — shadcn Select in register -->
The registration form uses shadcn Select (not raw HTML select) for
role selection. Available roles are Buyer, Seller, and Arbiter.
The login form uses Input components with Label associations.

## Loading States
<!-- VERIFY:EM-LOADING-STATES — loading.tsx in all routes -->
Each route (login, register, transactions, disputes) has a loading.tsx
file with role="status" and aria-busy="true" for accessible loading
indicators. A visually hidden "Loading..." text is included via sr-only.

## Error States
<!-- VERIFY:EM-ERROR-STATES — error.tsx with focus management -->
Each route has an error.tsx component that:
- Uses 'use client' directive for client-side error handling
- Renders with role="alert" for screen reader announcements
- Uses useRef and useEffect to focus the heading on mount
- Provides a retry button to reset the error boundary

## Pages
1. Home (/) — Overview with transaction and dispute cards
2. Login (/login) — Email/password form with Server Action
3. Register (/register) — Email/password/role form with shadcn Select
4. Transactions (/transactions) — Table with status badges
5. Disputes (/disputes) — Table with resolution details

## Color Scheme
Primary colors use teal (--primary: #0f766e light, #14b8a6 dark) to
differentiate from other projects. All colors follow the CSS custom
property pattern for consistent theming.
