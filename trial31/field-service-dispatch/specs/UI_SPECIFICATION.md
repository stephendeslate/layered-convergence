# UI Specification — Field Service Dispatch

## Component Library

### shadcn/ui Components
The frontend uses 8 shadcn/ui components, all built with Radix UI primitives and styled with Tailwind CSS:
1. Button (with variants: default, destructive, outline, secondary, ghost, link)
2. Input
3. Label (Radix Label primitive)
4. Card (with CardHeader, CardTitle, CardContent, CardDescription, CardFooter)
5. Badge (with variants: default, secondary, destructive, outline)
6. Dialog (Radix Dialog primitive)
7. Select (Radix Select primitive — used instead of raw HTML select)
8. Table (with TableHeader, TableRow, TableHead, TableBody, TableCell)
<!-- VERIFY:FD-SHADCN-COMPONENTS -->

### Styling
All components use CSS custom properties with dark mode support via `prefers-color-scheme` media query. This provides automatic theme switching without JavaScript.
<!-- VERIFY:FD-DARK-MODE -->

### cn() Utility
The `cn()` function combines `clsx` for conditional classes and `twMerge` for Tailwind conflict resolution. Used across all UI components.
<!-- VERIFY:FD-CN-UTILITY -->

## Accessibility

### Skip-to-Content Link
Root layout includes a skip-to-content link that becomes visible on focus. Links to `#main-content` element wrapping page content.
<!-- VERIFY:FD-SKIP-LINK -->

### Select Component Usage
Registration page uses shadcn Select component (Radix primitive) instead of raw HTML `<select>`. Provides keyboard navigation, screen reader support, and consistent styling.
<!-- VERIFY:FD-SELECT-COMPONENT -->

### Loading States
Every route includes a `loading.tsx` file with `role="status"` and `aria-busy="true"` attributes. Screen reader text provided via `sr-only` class.
<!-- VERIFY:FD-LOADING-STATES -->

### Error States
Every route includes an `error.tsx` file with `role="alert"` attribute. Uses `useRef` and `useEffect` to focus the error heading on mount, ensuring screen readers announce the error immediately.
<!-- VERIFY:FD-ERROR-STATES -->

### Navigation
Nav component uses `aria-label="Main navigation"` for landmark identification. Links to Work Orders, Invoices, Routes, Login, and Register pages.
<!-- VERIFY:FD-NAV-ARIA -->

## Page Layout

### Root Layout
The root layout provides consistent structure across all pages: skip-to-content link, navigation
bar, and main content area. The `<html>` element includes `lang="en"` for screen reader language
detection. The `<main>` element uses `id="main-content"` as the skip link target.

### Route Structure
The application uses Next.js App Router with the following route groups:
- `/` — Home page with three Card CTAs linking to work orders, invoices, and routes
- `/login` — Login form with email and password fields
- `/register` — Registration form with shadcn Select for role selection
- `/work-orders` — Work order listing with Table and Badge status indicators
- `/invoices` — Invoice listing with Table and Badge status indicators
- `/routes` — Route listing with Table and Badge status indicators

## Cross-References
- See TESTING_STRATEGY.md for accessibility test coverage
- See PRODUCT_VISION.md for page content requirements
