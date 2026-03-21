# Security Specification — Analytics Engine

## Overview

Security is enforced at multiple layers: environment validation, authentication,
authorization, data isolation, and frontend accessibility. See AUTH_SPEC.md for
authentication details and DATA_MODEL.md for RLS configuration.

## Environment Validation

### Fail-Fast Pattern
The application validates JWT_SECRET and CORS_ORIGIN at startup. Missing values cause
an immediate throw, preventing the app from running in an insecure configuration.
See API_SPEC.md for specific environment variable checks.

## Code Quality Rules

### No Type Assertions
The codebase prohibits `as any` type assertions to maintain type safety.
All types are properly defined in the shared package or inline.

### No Console Logging
Production code must not contain console.log statements. Structured logging
should be used instead when logging is needed.

### No Raw Select Elements
Page components must not use raw HTML `<select>` elements. Use shadcn/ui
Select component or equivalent accessible component instead.

## Frontend Security

### UI Component Library
All UI components use the cn() utility for safe className merging with
tailwind-merge to prevent class conflicts.
- VERIFY: AE-UI-CN-001 — cn() utility for className merging in lib/utils.ts

### UI Components
The project uses 8 shadcn/ui components: Button, Card, Input, Label, Badge, Alert,
Skeleton, and Table. Each is built with proper ARIA attributes.
- VERIFY: AE-UI-COMP-001 — Button component with focus-visible ring
- VERIFY: AE-UI-COMP-002 — Card component with semantic structure
- VERIFY: AE-UI-COMP-003 — Input component with disabled state handling
- VERIFY: AE-UI-COMP-004 — Label component with peer-disabled styling

### Layout and Navigation
Root layout includes skip-to-content link and Nav component with aria-label.
- VERIFY: AE-UI-LAYOUT-001 — Root layout with Nav and skip-to-content link
- VERIFY: AE-UI-NAV-001 — Navigation component with aria-label attribute

## findFirst Justification

All findFirst calls in the codebase include inline comments explaining why findFirst
is used instead of findUnique. This is typically for RLS-scoped queries where
the tenant context must be verified alongside the primary key lookup.

## Cross-References
- See AUTH_SPEC.md for bcrypt, JWT, and role validation security
- See API_SPEC.md for CORS and environment variable fail-fast
- See TESTING_STRATEGY.md for security-related test coverage
- See DATA_MODEL.md for RLS tenant isolation
