# Testing Specification

## Overview

The Escrow Marketplace has comprehensive test coverage across unit, integration,
security, performance, accessibility, and keyboard navigation tests.

## Backend Unit Tests

Three unit test files cover the core services:

- VERIFY: EM-TEST-001 — AuthService unit tests (register, login, validateUser)
- VERIFY: EM-TEST-002 — ListingsService unit tests (CRUD, slug generation, pagination)
- VERIFY: EM-TEST-003 — TransactionsService unit tests (CRUD, state machine, escrow)

### Test Patterns

Unit tests use NestJS TestingModule with mock PrismaService. All Prisma methods
are mocked with jest.fn(). Tests verify both success and error paths.

## Backend Integration Tests

Two integration test files use supertest for real HTTP assertions:

- VERIFY: EM-TEST-004 — Auth integration tests (registration validation, health check)
- VERIFY: EM-TEST-005 — Domain integration tests (listings, transactions with auth)

### Integration Test Patterns

Integration tests create real NestJS applications with overridden PrismaService.
JWT tokens are generated for authenticated requests. Tests verify HTTP status codes,
response bodies, and header values.

## Security Tests

- VERIFY: EM-TEST-006 — Security tests with supertest verifying Helmet headers,
  input validation, MaxLength enforcement, and auth guard behavior

## Performance Tests

- VERIFY: EM-TEST-007 — Performance tests verifying X-Response-Time header,
  normalizePageParams behavior, withTimeout utility, and pagination enforcement

## Frontend Tests

Accessibility tests use jest-axe to verify all 8 shadcn/ui components pass WCAG rules.
Keyboard navigation tests use userEvent to verify Tab focus order and Enter/Space activation.

- VERIFY: EM-TEST-008 — Accessibility tests with jest-axe on all UI components
- VERIFY: EM-TEST-009 — Keyboard navigation tests with userEvent

## Cross-References

- See security.md for security test requirements
- See performance.md for performance test requirements
