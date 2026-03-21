# UI Specification — Analytics Engine

## Overview
The frontend uses Next.js ^15.0.0 with Tailwind CSS and shadcn/ui
components. See TESTING_STRATEGY.md for UI testing details and
API_CONTRACT.md for backend integration points.

## Component Library
<!-- VERIFY:AE-SHADCN-COMPONENTS — 8 shadcn components -->
Eight shadcn/ui components are used:
1. Button — primary actions with variant support
2. Input — text input fields
3. Label — form field labels
4. Card — content containers
5. Badge — status indicators
6. Dialog — modal dialogs
7. Select — dropdown selection (replaces raw HTML select)
8. Table — data display tables

## Dark Mode Support
<!-- VERIFY:AE-DARK-MODE — prefers-color-scheme dark mode -->
Dark mode is implemented using CSS custom properties with
@media (prefers-color-scheme: dark) in globals.css.

## Utility Function
<!-- VERIFY:AE-CN-UTILITY — cn function with clsx + twMerge -->
The cn() utility combines clsx and tailwind-merge for conditional
class name composition across all components.

## Accessibility

### Skip Link
<!-- VERIFY:AE-SKIP-LINK — Skip-to-content in layout -->
Root layout includes a skip-to-content link that becomes visible on
focus, allowing keyboard users to bypass navigation.

### Select Component
<!-- VERIFY:AE-SELECT-COMPONENT — shadcn Select in register -->
The registration form uses the shadcn Select component instead of raw
HTML select elements, providing proper keyboard navigation and ARIA
attributes. See SECURITY_MODEL.md for role restriction details.

### Loading States
<!-- VERIFY:AE-LOADING-STATES — loading.tsx in all routes -->
Every route (root, login, register, dashboard) has a loading.tsx with
role="status" and aria-busy="true" for screen reader announcement.

### Error States
<!-- VERIFY:AE-ERROR-STATES — error.tsx with focus management -->
Every route has an error.tsx with role="alert", useRef for heading
reference, and useEffect to focus the heading on mount.

### Navigation
<!-- VERIFY:AE-NAV-ARIA — Nav with aria-label -->
The Nav component uses aria-label="Main navigation" for proper
landmark identification by assistive technologies.

## Page Structure

### Home Page
Displays welcome content with registration and login cards.
Uses Card, Button components.

### Login Page
Form with email and password fields. Uses Card, Input, Label, Button.
Displays validation errors with role="alert".

### Register Page
Form with email, password, and role selection. Uses Card, Input, Label,
Button, Select. Role excludes ADMIN option.

### Dashboard Page
Displays summary cards and a pipeline activity table. Uses Card, Badge,
Table components. See DATA_MODEL.md for entity definitions.

## Design System
Colors use CSS custom properties for theme consistency.
Typography uses system fonts for performance.
Spacing follows Tailwind CSS conventions.
Border radius defined by --radius variable.
