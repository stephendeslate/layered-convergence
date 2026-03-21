# UI Specification — Field Service Dispatch

## Overview
This document describes the frontend UI for Field Service Dispatch.
See PRODUCT_VISION.md for feature context, SYSTEM_ARCHITECTURE.md
for architectural patterns, and TESTING_STRATEGY.md for testing approach.

## Design System

### Color Scheme
Field Service Dispatch uses an amber/orange primary color (#b45309 light,
#d97706 dark) to reflect the industrial/field service domain. The color
scheme is defined using CSS custom properties for light and dark modes.

<!-- VERIFY:FSD-SHADCN-COMPONENTS — 8 shadcn components -->
### Components
Eight shadcn/ui components are implemented:
1. **Button** — cva variants (default, destructive, outline, secondary, ghost, link)
2. **Input** — forwardRef with focus ring styling
3. **Label** — @radix-ui/react-label with peer styling
4. **Card** — Card, CardHeader, CardTitle, CardContent
5. **Badge** — cva variants (default, secondary, destructive, outline)
6. **Dialog** — @radix-ui/react-dialog with overlay and portal
7. **Select** — @radix-ui/react-select with trigger, content, items
8. **Table** — Table, TableHeader, TableBody, TableRow, TableHead, TableCell

All components use the cn() utility for class name composition.

<!-- VERIFY:FSD-DARK-MODE — prefers-color-scheme dark mode -->
### Dark Mode
Dark mode is implemented via CSS media query `prefers-color-scheme: dark`.
CSS custom properties are overridden for dark mode colors. No JavaScript
toggle is required; the system preference is respected automatically.

<!-- VERIFY:FSD-CN-UTILITY — cn function with clsx + twMerge -->
### Utility Function
The cn() utility combines clsx for conditional classes with tailwind-merge
for Tailwind CSS class deduplication. Located in lib/utils.ts.

## Pages

### Home Page (/)
Landing page with two cards: Work Orders and Schedules. Each card links
to the corresponding listing page with Button components.

### Login Page (/login)
Card-based form with Email and Password inputs. Uses shadcn Label and
Input components. Form submits via Server Action to the backend API.

<!-- VERIFY:FSD-SELECT-COMPONENT — shadcn Select in register -->
### Register Page (/register)
Card-based form with Email, Password, and Role fields. The Role field
uses the shadcn Select component (not raw HTML select) with options:
Technician, Dispatcher, Manager. ADMIN is intentionally excluded.

### Work Orders Page (/work-orders)
Table listing work orders with columns: Title, Customer, Priority, Status.
Priority and Status use Badge components with appropriate variants.

### Schedules Page (/schedules)
Table listing technician schedules with columns: Technician, Day, Start,
End, Status. Uses Badge components for availability status.

## Accessibility

<!-- VERIFY:FSD-SKIP-LINK — Skip-to-content in layout -->
The root layout includes a skip-to-content link that becomes visible
on focus. It targets main#main-content for keyboard users.

<!-- VERIFY:FSD-LOADING-STATES — loading.tsx in all routes -->
Every route directory contains a loading.tsx file with role="status"
and aria-busy="true" attributes. A visually hidden "Loading..." text
is included for screen readers.

<!-- VERIFY:FSD-ERROR-STATES — error.tsx with focus management -->
Every route directory contains an error.tsx file with role="alert".
The error heading uses useRef and useEffect to programmatically focus
on mount, ensuring screen readers announce the error.

<!-- VERIFY:FSD-NAV-ARIA — Nav with aria-label -->
The Nav component uses aria-label="Main navigation" for screen reader
identification. Navigation links include Work Orders, Schedules,
Login, and Register.
