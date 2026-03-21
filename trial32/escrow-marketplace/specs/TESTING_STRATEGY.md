# Testing Strategy — Escrow Marketplace

## Overview

The testing strategy covers unit tests, integration tests, accessibility tests,
and keyboard navigation tests across both backend and frontend applications.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [SECURITY_MODEL.md](SECURITY_MODEL.md), [UI_SPECIFICATION.md](UI_SPECIFICATION.md)

## Backend Unit Tests

- All service classes have corresponding .spec.ts files
- Prisma is mocked for isolation (no database required)
- Test state machine transitions (valid and invalid)
- Test authentication flows (register, login, role rejection)
- Test error handling (not found, bad request, unauthorized)
- Jest as test runner with ts-jest

## Backend Integration Tests

- [VERIFY:EM-TS-001] Docker Compose provides test database -> Implementation: docker-compose.test.yml:1
- [VERIFY:EM-TS-002] Integration test for auth endpoints -> Implementation: apps/api/__integration__/auth.spec.ts:1
- [VERIFY:EM-TS-003] Integration test for transaction endpoints -> Implementation: apps/api/__integration__/transaction.spec.ts:1
- Real AppModule + supertest for HTTP-level testing
- PostgreSQL test database via Docker Compose (tmpfs for speed)
- ValidationPipe applied in test setup to match production

## Frontend Tests

- [VERIFY:EM-TS-004] Frontend axe-core accessibility tests -> Implementation: apps/web/__tests__/pages.test.tsx:1
- Vitest as test runner with jsdom environment
- jest-axe for automated accessibility checks
- @testing-library/react for component rendering
- @testing-library/user-event for keyboard navigation

## Test Organization

| Test Type | Location | Runner | Database |
|-----------|----------|--------|----------|
| Unit | apps/api/src/**/*.spec.ts | Jest | Mocked |
| Integration | apps/api/__integration__/*.spec.ts | Jest | Real (Docker) |
| Accessibility | apps/web/__tests__/pages.test.tsx | Vitest | None |
| Keyboard | apps/web/__tests__/keyboard-navigation.test.tsx | Vitest | None |

## CI Integration

- All tests run via `pnpm turbo run test`
- PostgreSQL service container in CI for integration tests
- Test results gate merge to main branch
