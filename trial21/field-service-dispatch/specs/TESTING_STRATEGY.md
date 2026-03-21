# Testing Strategy

## Overview

The testing strategy covers unit tests, integration tests, and frontend component
tests with accessibility validation. All tests use Jest as the test runner.
The backend uses ts-jest for TypeScript compilation; the frontend uses jsdom
for DOM simulation. See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for
the technology stack details.

## Integration Tests

[VERIFY:TS-001] Auth integration tests SHALL use Test.createTestingModule with
real service wiring (AuthService, PrismaService, JwtModule) to test the full
registration and login flow including JWT token generation and user creation.
→ Implementation: backend/test/auth.integration.spec.ts:8

[VERIFY:TS-002] Work order integration tests SHALL validate the complete state
machine lifecycle: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> INVOICED.
Invalid transitions (e.g., PENDING -> COMPLETED) SHALL be rejected with
BadRequestException. ON_HOLD transitions from ASSIGNED and IN_PROGRESS SHALL
be validated. Missing work orders SHALL throw NotFoundException.
→ Implementation: backend/test/work-order.integration.spec.ts:9

## Unit Tests

[VERIFY:TS-003] Backend services SHALL have unit tests covering core business
logic including: password hashing verification (bcrypt salt 12), state machine
transitions (valid and invalid paths), ADMIN role rejection (defense-in-depth),
company context scoping, and conflict detection (duplicate email). Unit tests
use mock PrismaService and CompanyContextService instances.
→ Implementation: backend/src/auth/auth.service.spec.ts:1

[VERIFY:TS-004] Frontend components SHALL have unit tests using
@testing-library/react with jest-axe for accessibility validation. Every
test file SHALL include at least one axe accessibility check to ensure
WCAG 2.1 AA compliance. Tests cover Nav rendering, login form labels,
error boundary role="alert", and keyboard navigation.
→ Implementation: frontend/__tests__/nav.test.tsx:1

## Test Infrastructure

### Backend
- Jest with ts-jest transform for TypeScript compilation
- Docker Compose for test PostgreSQL instance (PostgreSQL 16, port 5433)
- Test.createTestingModule for NestJS dependency injection in tests
- Mock PrismaService for unit tests; real Prisma client for integration tests
- jest.config in package.json for unit tests; test/jest-e2e.json for integration

### Frontend
- Jest with jsdom environment for DOM simulation
- @testing-library/react for component rendering and queries
- @testing-library/user-event for keyboard and mouse interaction simulation
- jest-axe (axe-core) for automated accessibility testing
- @testing-library/jest-dom for extended DOM assertions (toBeInTheDocument, etc.)

## Test Categories

| Category | Runner | Database | Mocks | Example |
|----------|--------|----------|-------|---------|
| Backend Unit | jest | None | PrismaService mocked | auth.service.spec.ts |
| Backend Integration | jest --config jest-e2e.json | Real PostgreSQL | None | auth.integration.spec.ts |
| Frontend Unit | jest (jsdom) | None | Next.js internals | login.test.tsx |
| Frontend a11y | jest-axe | None | Next.js internals | nav.test.tsx |
| Validation | jest (jsdom) | None | None | validation.test.ts |

## Coverage Requirements

- All service methods must have at least one test
- State machine transitions require both valid and invalid path tests
- All form components require accessibility tests (jest-axe)
- Error boundaries require role="alert" verification
- Company context scoping must be verified in service tests
- Frontend validation helpers require edge case coverage (empty, null, File)
