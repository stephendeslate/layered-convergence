# UI Specification — Escrow Marketplace

## Overview

The frontend is built with Next.js 15 App Router, shadcn/ui components, and Tailwind CSS 4.
All pages follow accessibility best practices with proper ARIA attributes, keyboard
navigation support, and screen reader compatibility.

**Cross-references:** [PRODUCT_VISION.md](PRODUCT_VISION.md), [API_CONTRACT.md](API_CONTRACT.md), [TESTING_STRATEGY.md](TESTING_STRATEGY.md)

## Styling

[VERIFY:UI-001] The global stylesheet MUST use Tailwind 4 import syntax: `@import "tailwindcss"`.
> Implementation: `frontend/app/globals.css:2`

## Component Library

The application uses 9 shadcn/ui components in `components/ui/`:
1. Button — Primary actions, navigation
2. Input — Form text inputs
3. Label — Form field labels
4. Card — Content containers
5. Table — Data display
6. Badge — Status indicators
7. Dialog — Modal confirmations
8. Select — Dropdown selections (Radix-based)
9. Textarea — Multi-line text inputs

[VERIFY:UI-002] The shadcn/ui Button component MUST support variant and size props.
> Implementation: `frontend/components/ui/button.tsx:44`

## Navigation

[VERIFY:UI-003] The Nav component MUST provide accessible navigation with aria-label.
> Implementation: `frontend/components/nav.tsx:7`

[VERIFY:UI-004] The root layout MUST include Nav component, skip-to-content link, and main landmark.
> Implementation: `frontend/app/layout.tsx:12`

## Accessibility

[VERIFY:UI-005] An `sr-only` CSS class MUST be defined in globals.css for screen reader text.
> Implementation: `frontend/app/globals.css:56`

[VERIFY:UI-006] Dark mode MUST be implemented via `@media (prefers-color-scheme: dark)` in globals.css.
> Implementation: `frontend/app/globals.css:5`

[VERIFY:UI-007] The shadcn Select wrapper MUST be used instead of raw `<select>` elements in pages.
> Implementation: `frontend/components/ui/select.tsx:7`

## Server Actions

[VERIFY:UI-008] Server Actions in `actions.ts` MUST use the `'use server'` directive for auth and entity operations.
> Implementation: `frontend/app/actions.ts:1`

## Loading States

All routes including root MUST have a `loading.tsx` with:
- `role="status"` attribute
- `aria-busy="true"` attribute
- `sr-only` span with descriptive loading text

[VERIFY:UI-009] Root-level `loading.tsx` MUST have `role="status"` and `aria-busy="true"` with sr-only text.
> Implementation: `frontend/app/loading.tsx:2`

## Error States

All routes including root MUST have an `error.tsx` with:
- `'use client'` directive
- `role="alert"` attribute
- `useRef` + `focus()` on heading for screen reader announcement
- Retry button

[VERIFY:UI-010] Root-level `error.tsx` MUST have `role="alert"` with useRef + focus on heading.
> Implementation: `frontend/app/error.tsx:8`

## Page Inventory

| Route | Page | Loading | Error |
|-------|------|---------|-------|
| `/` | Root landing page | Yes | Yes |
| `/home` | Dashboard | Yes | Yes |
| `/login` | Login form | Yes | Yes |
| `/register` | Registration form | Yes | Yes |
| `/transactions` | Transaction list | Yes | Yes |
| `/transactions/new` | New transaction form | Yes | Yes |
| `/transactions/[id]` | Transaction detail | Yes | Yes |
| `/disputes` | Dispute list | Yes | Yes |
| `/disputes/[id]` | Dispute detail | Yes | Yes |
| `/payouts` | Payout list | Yes | Yes |

## Responsive Design

- Max width container: `max-w-7xl`
- Responsive padding: `px-4 sm:px-6 lg:px-8`
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Navigation: hidden on small screens with `hidden sm:flex`
