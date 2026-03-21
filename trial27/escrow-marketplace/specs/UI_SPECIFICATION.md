# UI Specification: Escrow Marketplace

## Overview

The Escrow Marketplace frontend uses Next.js 15 App Router with React 19,
Tailwind CSS 4, and shadcn/ui-style components for accessible UI.

## Navigation

### Root Layout
[VERIFY:EM-036] The root layout includes a Nav component with links to
Transactions, Login, and Register. A skip-to-content link is the first
focusable element for keyboard accessibility.

## Pages

### Root Layout
[VERIFY:EM-037] Root layout wraps all pages with Nav component, skip-to-content
link, and main content area with id="main-content".

### Register Page
[VERIFY:EM-038] Register page uses shadcn Select component (NOT raw HTML
select) for role selection. Options are Buyer, Seller, and Arbiter.
ADMIN is excluded from options.

## Component Library

### shadcn/ui Components
[VERIFY:EM-039] 8 shadcn/ui components in frontend/components/ui/: badge,
button, card, dialog, input, label, select, table. All use cn() utility
for className composition.

## Accessibility

### Loading and Error States
[VERIFY:EM-040] Every route has loading.tsx with role="status" and
aria-busy="true". Every route has error.tsx with role="alert" and
automatic focus via useRef + useEffect.

### Dark Mode
[VERIFY:EM-041] Dark mode via prefers-color-scheme CSS media query in
globals.css. Custom properties toggle between light and dark palettes.

## Routes

4 routes with loading and error states:
- `/` — Home page with escrow overview
- `/login` — Authentication form
- `/register` — Account creation with role selection
- `/dashboard` — Transaction listing

## Component Design

Components follow these patterns:
- Accept className for composition via cn()
- CSS custom properties for theming
- Focus-visible styles for keyboard navigation
- Variant and size props where applicable

## Responsive Layout

- Mobile: Single column stack
- Desktop: Two-column grid on home page
- Dashboard: Full-width table with horizontal overflow

## Cross-References

- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for component test coverage
- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature requirements
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication UI flow
