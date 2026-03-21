# UI Specification — Field Service Dispatch

## Overview
The frontend uses Next.js ^15.0.0 with Tailwind CSS and shadcn/ui
components. See TESTING_STRATEGY.md for UI testing details and
API_CONTRACT.md for backend integration points.

## Component Library
<!-- VERIFY:FD-SHADCN-COMPONENTS — 8 shadcn components -->
Eight shadcn/ui components are used:
1. Button — primary actions with variant support
2. Input — text input fields
3. Label — form field labels
4. Card — content containers
5. Badge — status indicators (work order status, priority)
6. Dialog — modal dialogs (work order details)
7. Select — dropdown selection (role picker, priority selector)
8. Table — data display tables (work orders, routes, technicians)

## Dark Mode Support
<!-- VERIFY:FD-DARK-MODE — prefers-color-scheme dark mode -->
Dark mode is implemented using CSS custom properties with
@media (prefers-color-scheme: dark) in globals.css.

## Utility Function
<!-- VERIFY:FD-CN-UTILITY — cn function with clsx + twMerge -->
The cn() utility combines clsx and tailwind-merge for conditional
class name composition across all components.

## Accessibility

### Skip Link
<!-- VERIFY:FD-SKIP-LINK — Skip-to-content in layout -->
Root layout includes a skip-to-content link that becomes visible on
focus, allowing keyboard users to bypass navigation.

### Select Component
<!-- VERIFY:FD-SELECT-COMPONENT — shadcn Select in register -->
The registration form uses the shadcn Select component instead of raw
HTML select elements, providing proper keyboard navigation and ARIA
attributes. See SECURITY_MODEL.md for role restriction details.

### Loading States
<!-- VERIFY:FD-LOADING-STATES — loading.tsx in all routes -->
Every route (root, login, register, dashboard, work-orders, routes) has
a loading.tsx with role="status" and aria-busy="true" for screen reader
announcement.

### Error States
<!-- VERIFY:FD-ERROR-STATES — error.tsx with focus management -->
Every route has an error.tsx with role="alert", useRef for heading
reference, and useEffect to focus the heading on mount.

### Navigation
<!-- VERIFY:FD-NAV-ARIA — Nav with aria-label -->
The Nav component uses aria-label="Main navigation" for proper
landmark identification by assistive technologies.

## Page Structure

### Home Page
Displays welcome content with service overview cards.
Uses Card, Button components.

### Login Page
Form with email and password fields. Uses Card, Input, Label, Button.
Displays validation errors with role="alert".

### Register Page
Form with email, password, and role selection. Uses Card, Input, Label,
Button, Select. Role excludes ADMIN option.

### Dashboard Page
Displays summary cards (Work Orders, Technicians, Routes) and a recent
work orders table. Uses Card, Badge, Table components.
See DATA_MODEL.md for entity definitions.

### Work Orders Page
Full listing of work orders with status badges and priority indicators.
Uses Table, Badge components with color-coded status.

### Routes Page
Route listing with technician assignments and status tracking.
Uses Table, Badge components.

## Design System
Colors use CSS custom properties with orange/amber theme (--primary: #c2410c).
Typography uses system fonts for performance.
Spacing follows Tailwind CSS conventions.
Border radius defined by --radius variable.
