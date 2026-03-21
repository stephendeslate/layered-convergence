# Testing Strategy — Field Service Dispatch

## Overview

Testing covers backend unit tests, integration tests with real database, frontend
accessibility tests, and keyboard navigation tests. All tests run through the
Turborepo pipeline via `pnpm turbo run test`.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [UI_SPECIFICATION.md](UI_SPECIFICATION.md)

## Test Infrastructure

### Docker Compose for Tests
- Dedicated docker-compose.test.yml for test database
- PostgreSQL 16 on port 5433 (avoids conflict with dev database)
- Uses tmpfs for faster test execution
- [VERIFY:FD-TS-001] Docker Compose for test database -> Implementation: docker-compose.test.yml:1

### CI Integration
- GitHub Actions workflow runs all tests
- PostgreSQL service container for integration tests
- Environment variables set for JWT_SECRET and DATABASE_URL

## Backend Unit Tests

### Test Structure
- Unit tests mock PrismaService using jest.fn()
- Each service has its own spec file
- Tests verify:
  - CRUD operations create correct records
  - NotFoundException thrown when records not found
  - State machine transitions validated correctly
  - Invalid transitions rejected with BadRequestException
  - ADMIN role rejected during registration
  - Password hashing uses bcrypt with salt 12

### Coverage
- auth.service.spec.ts — 6 tests (register + login)
- work-order.service.spec.ts — 7 tests (create + findOne + transitions)
- invoice.service.spec.ts — 3 tests (create + findOne + markPaid)

## Backend Integration Tests

### Structure
- Integration tests use real AppModule with TestingModule
- supertest for HTTP request assertions
- Real database operations (no mocking)
- Company created in beforeAll for test isolation

- [VERIFY:FD-TS-002] Integration test for auth endpoints -> Implementation: apps/api/__integration__/auth.spec.ts:1
- [VERIFY:FD-TS-003] Integration test for work-order endpoints -> Implementation: apps/api/__integration__/work-order.spec.ts:1

### Coverage
- auth.spec.ts — register, reject ADMIN, login, reject invalid credentials
- work-order.spec.ts — require auth, return work orders with auth

## Frontend Tests

### Accessibility Tests (axe-core)
- All major UI components tested for WCAG compliance
- Button, Card, Form, Table, and Navigation tested
- Uses jest-axe with toHaveNoViolations matcher

- [VERIFY:FD-TS-004] Frontend axe-core accessibility tests -> Implementation: apps/web/__tests__/pages.test.tsx:1

### Keyboard Navigation Tests
- Tab navigation through form fields
- Shift+Tab for reverse navigation
- Typing in input fields
- Enter key on submit buttons
- Skip-to-content link navigation
