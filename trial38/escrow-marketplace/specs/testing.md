# Testing Specification

## Overview

Testing is organized into unit tests, integration tests, accessibility tests, and specialized tests (security, performance, keyboard navigation, page-level shared utility validation).

## Test Files

### API Tests (apps/api/test/)

| File                           | Type        | Description                                |
|--------------------------------|-------------|--------------------------------------------|
| auth.service.spec.ts          | Unit        | AuthService: register, login, getProfile   |
| listings.service.spec.ts      | Unit        | ListingsService: CRUD with authorization   |
| transactions.service.spec.ts  | Unit        | TransactionsService: state machine, escrow |
| auth.integration.spec.ts      | Integration | Auth endpoints via supertest               |
| domain.integration.spec.ts    | Integration | Listings/Transactions endpoints            |
| security.spec.ts              | E2E         | Helmet headers, input validation, guards   |
| performance.spec.ts           | E2E         | ResponseTimeInterceptor, clampPageSize     |

### Web Tests (apps/web/__tests__/)

| File                    | Type          | Description                              |
|-------------------------|---------------|------------------------------------------|
| components.spec.tsx    | Accessibility | jest-axe on all 8 UI components          |
| keyboard.spec.tsx      | A11y          | Tab navigation, Enter/Space activation   |
| pages.spec.tsx         | Unit          | Shared utility validation for pages      |

## Test Patterns

### Unit Tests
- NestJS TestingModule with mock PrismaService
- jest.fn() mocks for Prisma methods (findFirst, findMany, create, update, delete)
- Tests verify: happy path, error cases, authorization checks, validation

### Integration Tests
- Full NestJS app bootstrap with AppModule
- supertest for HTTP assertions on status codes and response bodies
- Tests verify: authentication guards, validation pipes, error response format

### Accessibility Tests
- jest-axe for automated WCAG compliance checks on all 8 UI components
- Each component rendered with proper context (Labels for Inputs, content for Cards)
- Skeleton tested for render presence (not axe-applicable)

### Keyboard Navigation Tests
- @testing-library/user-event for simulating Tab, Enter, Space keyboard events
- Verifies: focus management, button activation, input typing, disabled state
- Tab order follows DOM order (tested with focus tracking callbacks)

### Page-Level Tests
- Validates shared utility functions used in page components
- Tests formatCurrency, truncateText, slugify, sanitizeInput, maskSensitive, clampPageSize
- Ensures shared package contract is maintained for frontend consumers

## Verification Tags

<!-- VERIFY: EM-TEST-001 — Unit tests for auth, listings, transactions services -->
<!-- VERIFY: EM-TEST-002 — Integration tests for auth endpoints -->
<!-- VERIFY: EM-TEST-003 — Integration tests for domain endpoints (listings, transactions) -->
<!-- VERIFY: EM-TEST-004 — Security tests for Helmet headers and input validation -->
<!-- VERIFY: EM-TEST-005 — Performance tests for L7 requirements -->
<!-- VERIFY: EM-TEST-006 — Accessibility tests (jest-axe) for 8 UI components -->
<!-- VERIFY: EM-TEST-007 — Transaction state machine tests -->
<!-- VERIFY: EM-TEST-008 — Keyboard navigation tests -->
<!-- VERIFY: EM-TEST-009 — Page-level tests with shared utility validation -->

## Coverage Requirements

- All service methods have at least one positive and one negative test
- All API endpoints have authentication guard tests
- All 8 UI components have jest-axe accessibility tests
- Transaction state machine has tests for valid and invalid transitions
- Shared utilities are validated at the page level for contract integrity

## Cross-References

- See [security.md](security.md) for security test expectations (Helmet, CORS, validation)
- See [performance.md](performance.md) for performance test expectations (ResponseTimeInterceptor)
