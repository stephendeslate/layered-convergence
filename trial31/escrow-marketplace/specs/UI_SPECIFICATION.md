# UI Specification — Escrow Marketplace

## Overview
Frontend design specifications for the escrow marketplace platform,
including component library, accessibility requirements, and page layouts.

See also: [TESTING_STRATEGY.md](TESTING_STRATEGY.md), [PRODUCT_VISION.md](PRODUCT_VISION.md)

## Component Library

### shadcn/ui Components
<!-- VERIFY:EM-SHADCN-COMPONENTS -->
8 shadcn/ui components implemented with consistent patterns:
1. Button — cva variants, forwardRef, Slot support
2. Input — forwardRef with ring focus styles
3. Label — @radix-ui/react-label primitive
4. Card — Card, CardHeader, CardTitle, CardContent
5. Badge — cva variants (default, secondary, destructive, outline)
6. Dialog — @radix-ui/react-dialog with overlay and portal
7. Select — @radix-ui/react-select (no raw HTML select)
8. Table — Table, TableHeader, TableBody, TableRow, TableHead, TableCell

### Dark Mode
<!-- VERIFY:EM-DARK-MODE -->
CSS custom properties with prefers-color-scheme media query.
All component styles reference CSS variables for theme consistency.

### Utility Function
<!-- VERIFY:EM-CN-UTILITY -->
cn() function combining clsx and tailwind-merge for className composition.
Used in all shadcn components for conditional class merging.

## Accessibility

### Skip Navigation
<!-- VERIFY:EM-SKIP-LINK -->
Skip-to-content link in root layout with sr-only styling.
Becomes visible on focus for keyboard users.

### Select Component
<!-- VERIFY:EM-SELECT-COMPONENT -->
Register page uses shadcn Select component (not raw HTML select).
Radix-based accessible select with proper ARIA attributes.

### Loading States
<!-- VERIFY:EM-LOADING-STATES -->
Every route has loading.tsx with:
- role="status" attribute
- aria-busy="true" attribute
- sr-only "Loading..." text

### Error States
<!-- VERIFY:EM-ERROR-STATES -->
Every route has error.tsx with:
- 'use client' directive
- role="alert" attribute
- useRef for heading element
- useEffect to focus heading on mount

### Navigation
<!-- VERIFY:EM-NAV-ARIA -->
Nav component includes aria-label="Main navigation" on the nav element.
Links to all major sections: Transactions, Disputes, Login, Register.

## Page Layouts
- Home: Card-based overview with CTAs for transactions, disputes, registration
- Login: Centered card with email/password form
- Register: Centered card with email/password/role form (shadcn Select)
- Transactions: Table view with status badges
- Disputes: Table view with status badges and arbiter info
