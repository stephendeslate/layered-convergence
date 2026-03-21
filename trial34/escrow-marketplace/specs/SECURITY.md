# Security Specification — Escrow Marketplace

## Overview

Security is enforced at multiple layers: environment validation, authentication,
authorization, data isolation, and frontend accessibility. See AUTH_SPEC.md for
authentication details and DATA_MODEL.md for RLS configuration.

## Environment Validation

### Fail-Fast Pattern
The application validates JWT_SECRET and CORS_ORIGIN at startup. Missing values
cause an immediate throw with a descriptive error message. This prevents the
application from running in an insecure configuration where tokens cannot be
signed or CORS is misconfigured. See API_SPEC.md for specific checks.

## Code Quality Rules

### No Type Assertions
The codebase prohibits `as any` type assertions.

### No Console Logging
Production code must not contain console.log statements.

### No Raw Select Elements
Page components must not use raw HTML `<select>` elements.

## Frontend Security

### UI Component Library
- VERIFY: EM-UI-CN-001 — cn() utility for className merging in lib/utils.ts
- VERIFY: EM-UI-COMP-001 — Button component with focus-visible ring
- VERIFY: EM-UI-COMP-002 — Card component with semantic structure
- VERIFY: EM-UI-COMP-003 — Input component with disabled state handling
- VERIFY: EM-UI-COMP-004 — Label component with peer-disabled styling

### Layout and Navigation
- VERIFY: EM-UI-LAYOUT-001 — Root layout with Nav and skip-to-content link
- VERIFY: EM-UI-NAV-001 — Navigation component with aria-label attribute

## Data Isolation

### Row Level Security
Every table has ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY applied
in the migration. The PrismaService.setTenantContext() method uses $executeRaw
with Prisma.sql template literals to safely set the tenant context variable.
The codebase never uses $executeRawUnsafe for any database operations.

### findFirst Justification
All findFirst calls include inline comments explaining why findFirst is used.
Typically for RLS-scoped queries where tenant context must be verified before
returning data. This ensures auditable query patterns throughout the codebase.

## Cross-References
- See AUTH_SPEC.md for bcrypt, JWT, and role validation security
- See API_SPEC.md for CORS and environment variable fail-fast
- See TESTING_STRATEGY.md for security-related test coverage
- See DATA_MODEL.md for RLS tenant isolation
