# UI Specification: Escrow Marketplace

## Overview

The Escrow Marketplace frontend provides a secure, accessible interface
for managing escrow transactions, disputes, and payouts.

## Page Inventory

### Root Layout (`app/layout.tsx`)
[VERIFY:EM-037] Root layout includes Nav component with aria-label and
skip-to-content link for keyboard accessibility.

### Home Page (`app/page.tsx`)
Welcome page with Card component and call-to-action buttons.

### Login Page (`app/login/page.tsx`)
[VERIFY:EM-038] Login form uses shadcn Input and Label with proper
htmlFor/id associations for screen reader compatibility.

### Register Page (`app/register/page.tsx`)
[VERIFY:EM-039] Register page uses shadcn Select component (not raw
<select>) for role selection per FM #71 requirements.

### Dashboard Page (`app/dashboard/page.tsx`)
Transaction overview with Badge status indicators and Card summaries.

## Component Hierarchy

### shadcn/ui Components
[VERIFY:EM-040] 8 shadcn/ui components provided: badge, button, card,
dialog, input, label, select, table. All use cn() utility.

### Navigation
Main navigation with Dashboard, Login, Register links.

## User Flows

1. Buyer: Register -> Create Transaction -> Fund -> Release
2. Seller: Register -> View Transactions -> Request Payout
3. Dispute: View Transaction -> File Dispute -> Track Resolution

## Accessibility

[VERIFY:EM-041] Loading states use role="status" with aria-busy="true".
Error states use role="alert" with focus management via useRef/useEffect.

## Styling

[VERIFY:EM-042] Tailwind CSS 4 with @import "tailwindcss" syntax.
Dark mode via prefers-color-scheme with CSS custom properties.

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature requirements
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for test coverage
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for auth UI
