# Testing Specification

## Overview

Comprehensive test suite covering unit tests, integration tests, security tests,
and frontend component tests. All tests use Jest as the test runner with
appropriate extensions for each testing domain.

## Unit Tests (3 files)

### auth.service.spec.ts
- Tests bcrypt hashing with correct salt rounds
- Tests JWT token generation with correct payload
- Tests ADMIN role rejection on registration
- Tests email conflict detection within tenant
- Tests sanitizeInput on user name field
- Tests allowed roles (MANAGER, SELLER, BUYER)

### listings.service.spec.ts
- Tests paginated listing retrieval
- Tests MAX_PAGE_SIZE enforcement
- Tests listing lookup by id with tenant filter
- Tests slug generation via slugify() on creation
- Tests role-based access control (SELLER/MANAGER only)
- Tests listing update authorization

### transactions.service.spec.ts
- Tests paginated transaction retrieval
- Tests transaction creation with escrow account
- Tests self-purchase prevention
- Tests state machine transitions (valid and invalid)

## Integration Tests (2 files, all use supertest)

### auth.integration.spec.ts
- Uses supertest(app.getHttpServer()) for real HTTP requests
- Tests validation rejection (invalid email, short password)
- Tests ADMIN role rejection via actual POST request
- Tests extra field rejection (forbidNonWhitelisted)
- Tests unauthenticated profile access (401)
- Tests health check endpoint (200)

### domain.integration.spec.ts
- Uses supertest(app.getHttpServer()) for real HTTP requests
- Tests 401 on unauthenticated listing/transaction access
- Tests health check endpoint via actual GET request

## Security Tests (1 file)

### security.spec.ts
- Tests Helmet security headers (x-content-type-options, x-frame-options)
- Tests Content-Security-Policy header presence
- Tests XSS-like input handling
- Tests oversized string rejection
- Tests SQL injection-like input rejection
- Tests unknown property stripping
- Tests unauthenticated access protection

## Frontend Tests (3 files)

### components.spec.tsx
- jest-axe accessibility tests on all 8 UI components
- Button, Card, Input, Label, Badge, Alert, Skeleton, Table

### keyboard.spec.tsx
- Tab focus navigation on Button and Input
- Enter/Space key handling on Button
- Disabled button click prevention
- Alert focusability with tabIndex

### pages.spec.tsx
- Page rendering with shared utility usage
- truncateText and slugify integration
- formatCurrency display verification

## Cross-References

- Frontend components: [frontend.md](./frontend.md)
- API validation: [api.md](./api.md)
- Security: [security.md](./security.md)

## Verification Tags

<!-- VERIFY: EM-TEST-001 — Unit tests for all three services -->
<!-- VERIFY: EM-TEST-002 — Integration tests with real AppModule and supertest -->
<!-- VERIFY: EM-TEST-003 — Security test for Helmet headers -->
<!-- VERIFY: EM-TEST-004 — jest-axe on 8 UI components -->
<!-- VERIFY: EM-TEST-005 — Keyboard navigation tests -->
<!-- VERIFY: EM-TEST-006 — Security input validation tests -->
<!-- VERIFY: EM-TEST-007 — Transaction state machine tests -->
