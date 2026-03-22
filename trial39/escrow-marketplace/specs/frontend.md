# Frontend Specification

## Overview

The Escrow Marketplace frontend is built with Next.js 15 and shadcn/ui components.
It uses Tailwind CSS for styling with dark mode via @media (prefers-color-scheme: dark).

## Next.js Configuration

- VERIFY: EM-FE-001 — Next.js 15 with transpilePackages for shared package
- VERIFY: EM-FE-002 — Tailwind CSS configuration for app and components directories

## Layout and Navigation

- VERIFY: EM-FE-003 — Root layout with Nav component for site-wide navigation
- VERIFY: EM-FE-004 — Home page with dynamic escrow stats via next/dynamic

## Loading States

All routes have loading.tsx files with role="status" and aria-busy="true" attributes.
Screen reader text is provided via sr-only class for accessibility.

- VERIFY: EM-FE-005 — Root loading state with role="status" and aria-busy="true"

## Error Boundaries

All routes have error.tsx files with role="alert" attribute. Error components use
useRef for focus management, focusing the error heading on mount.

- VERIFY: EM-FE-006 — Root error boundary with useRef focus management

## Page Components

- VERIFY: EM-FE-007 — Listings page with server action data fetching
- VERIFY: EM-FE-008 — Transactions page with table display and status badges
- VERIFY: EM-FE-009 — Text truncation utility used in listing cards
- VERIFY: EM-FE-010 — Escrow accounts page with card grid layout

## Navigation Component

- VERIFY: EM-FE-011 — Nav component with links to listings, transactions, escrow

## Dynamic Imports

- VERIFY: EM-FE-012 — EscrowStats component loaded via next/dynamic for bundle optimization

## Server Actions and API

- VERIFY: EM-FE-013 — Server Actions with 'use server' directive checking response.ok
- VERIFY: EM-FE-014 — cn() utility using clsx + tailwind-merge

## shadcn/ui Components (8 components)

- VERIFY: EM-UI-001 — Button component with variant support
- VERIFY: EM-UI-002 — Card component with Header, Title, Content, Footer
- VERIFY: EM-UI-003 — Input component with focus ring styling
- VERIFY: EM-UI-004 — Badge component with default, secondary, destructive, outline variants
- VERIFY: EM-UI-005 — Table component with Header, Body, Row, Head, Cell
- VERIFY: EM-UI-006 — Label component for form accessibility
- VERIFY: EM-UI-007 — Skeleton component for loading placeholders
- VERIFY: EM-UI-008 — Alert component with destructive variant

## Cross-References

- See system-architecture.md for shared package integration
- See performance.md for dynamic imports and bundle optimization
