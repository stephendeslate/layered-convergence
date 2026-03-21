# UI Specification: Analytics Engine

## Overview

The Analytics Engine frontend uses Next.js 15 with App Router, React 19,
Tailwind CSS 4, and shadcn/ui-style components for a consistent, accessible
user interface.

## Navigation

### Root Layout
[VERIFY:AE-036] The root layout includes a Nav component with links to
Dashboard, Login, and Register pages. A skip-to-content link is the first
focusable element for keyboard and screen reader users.

## Pages

### Login Page
[VERIFY:AE-037] The login page contains a form with email and password
fields using shadcn Input and Label components. Form submission calls
the loginAction Server Action.

### Register Page
[VERIFY:AE-038] The register page uses a shadcn Select component (NOT a
raw HTML select element) for role selection. Available roles are Viewer,
Editor, and Analyst — ADMIN is excluded from the options.

## Component Library

### shadcn/ui Components
[VERIFY:AE-039] The frontend includes 8 shadcn/ui-style components in
frontend/components/ui/: badge, button, card, dialog, input, label,
select, and table. All components accept className for customization
via the cn() utility function.

## Accessibility

### Loading States
[VERIFY:AE-040] Every route includes a loading.tsx component with
role="status" and aria-busy="true" for screen reader compatibility.
Every route includes an error.tsx component with role="alert" and
automatic focus management via useRef and useEffect.

### Dark Mode
[VERIFY:AE-041] Dark mode is implemented via CSS prefers-color-scheme
media query in globals.css. CSS custom properties switch between light
and dark values automatically based on system preference.

## Routes

The application has 4 routes, each with its own loading and error states:
- `/` — Home page with feature overview
- `/login` — Authentication form
- `/register` — Account creation with role selection
- `/dashboard` — Analytics dashboard view

## Component Architecture

All UI components follow these conventions:
- Accept className prop for composition via cn()
- Use CSS custom properties for theming
- Include focus-visible styles for keyboard navigation
- Support variant and size props where applicable

## Responsive Design

The layout uses a max-width container with responsive grid layouts:
- Mobile: Single column layout
- Tablet/Desktop: Two-column grid on home page
- Dashboard: Full-width table with horizontal scroll on small screens

## Cross-References

- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for component test coverage
- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature requirements
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication UI flow
