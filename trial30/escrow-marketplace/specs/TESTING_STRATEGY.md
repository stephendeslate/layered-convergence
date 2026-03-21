# Testing Strategy — Escrow Marketplace

## Overview
The testing strategy covers unit tests, integration tests, accessibility
tests, and keyboard navigation tests. See SYSTEM_ARCHITECTURE.md for
architecture context and UI_SPECIFICATION.md for frontend components.

## Unit Tests
<!-- VERIFY:EM-UNIT-TESTS — Service specs with mocked Prisma -->
Three service spec files test core business logic with mocked dependencies:
1. auth.service.spec.ts — registration, login, bcrypt verification
2. transaction.service.spec.ts — CRUD, state transitions, raw SQL queries
3. dispute.service.spec.ts — CRUD, state transitions, not-found handling

Each spec uses Test.createTestingModule with mocked PrismaService and
(where applicable) JwtService. Mock implementations use jest.fn().

## Integration Tests
<!-- VERIFY:EM-INTEGRATION-TESTS — Supertest + AppModule tests -->
The integration test (test/integration.spec.ts) bootstraps the full
AppModule with PrismaService overridden by a mock implementation.
It verifies:
- Health endpoint returns 200 with correct payload
- ADMIN role rejection returns 400
- Invalid email format returns 400
- Short password returns 400
- Invalid login body returns 400
- Transaction and dispute listing endpoints return 200

## Accessibility Tests
<!-- VERIFY:EM-ACCESSIBILITY-TESTS — jest-axe with real components -->
The accessibility test suite uses jest-axe to verify WCAG compliance:
- Button component passes axe checks
- Input with Label association passes axe checks
- Card component passes axe checks
- Badge component passes axe checks
- Nav component with aria-label passes axe checks
- Loading state has correct role="status" and aria-busy="true"
- Error state has correct role="alert"

## Keyboard Tests
<!-- VERIFY:EM-KEYBOARD-TESTS — userEvent Tab/Enter/Space -->
Keyboard navigation tests use @testing-library/user-event:
- Tab moves focus sequentially through interactive elements
- Enter activates focused buttons
- Space activates focused buttons
- Shift+Tab moves focus backwards
- Disabled buttons are skipped in tab order

## Seed Data
<!-- VERIFY:EM-SEED-TRANSITIONS — Seed data with 2+ transitions -->
The seed script creates test data with multiple state transitions:
- Transaction 1: PENDING -> FUNDED -> RELEASED (complete lifecycle)
- Transaction 2: PENDING -> FUNDED -> DISPUTED (dispute path)
- Dispute 1: OPEN -> UNDER_REVIEW -> RESOLVED (resolution path)
This ensures the state machine paths are exercised during development.

## Test Configuration
Backend tests use Jest with ts-jest transform. Frontend tests use
jest-environment-jsdom with ts-jest and @/* module path mapping.
Both test suites can run independently via `pnpm test`.

## Continuous Integration
Tests run automatically in GitHub Actions CI on push and pull request.
The test job starts a PostgreSQL 16 service container and runs
prisma migrate deploy before executing the test suite.
