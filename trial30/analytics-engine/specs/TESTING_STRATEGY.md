# Testing Strategy — Analytics Engine

## Overview
The Analytics Engine uses a comprehensive testing strategy covering unit tests,
integration tests, accessibility tests, and keyboard navigation tests.
See SYSTEM_ARCHITECTURE.md for the architecture under test and
SECURITY_MODEL.md for security-specific test requirements.

## Backend Unit Tests
<!-- VERIFY:AE-UNIT-TESTS — Service specs with mocked Prisma -->
Three backend unit test files use Test.createTestingModule with mocked
PrismaService and JwtService:

1. **auth.service.spec.ts** — Tests registration with bcrypt salt 12,
   JWT payload generation, login with valid/invalid credentials, and
   UnauthorizedException for missing users and wrong passwords.

2. **pipeline.service.spec.ts** — Tests findAllByTenant ordering,
   valid state transitions (DRAFT→ACTIVE), invalid transitions
   (DRAFT→ARCHIVED), pipeline not found handling, countByTenantRaw
   with BigInt conversion, and activatePipeline with $executeRaw.

3. **dashboard.service.spec.ts** — Tests findAllByTenant with widgets,
   findById with NotFoundException, create, and addWidget operations.

## Integration Tests
<!-- VERIFY:AE-INTEGRATION-TESTS — Supertest + AppModule tests -->
Integration tests import the real AppModule and create a NestApplication
with ValidationPipe. PrismaService is overridden with a mock to avoid
database dependencies. Tests verify:
- Health endpoint returns 200
- ADMIN role rejected in registration (400)
- Invalid email rejected (400)
- Short password rejected (400)
- Invalid login body rejected (400)
- Pipeline listing returns data
- Dashboard listing returns data

## Frontend Accessibility Tests
<!-- VERIFY:AE-ACCESSIBILITY-TESTS — jest-axe with real components -->
Accessibility tests use jest-axe with toHaveNoViolations matcher:
- Button component renders without violations
- Input with Label association passes axe checks
- Card component hierarchy is accessible
- Badge component passes axe checks
- Nav component with aria-label passes checks
- Loading state verifies role="status" and aria-busy="true"
- Error state verifies role="alert" presence

## Keyboard Navigation Tests
<!-- VERIFY:AE-KEYBOARD-TESTS — userEvent Tab/Enter/Space -->
Keyboard tests use @testing-library/user-event:
- Tab moves focus sequentially through interactive elements
- Enter activates a focused button (onClick fires)
- Space activates a focused button
- Shift+Tab moves focus backwards
- Disabled buttons are skipped in tab order

## Seed Data Testing
<!-- VERIFY:AE-SEED-TRANSITIONS — Seed data with 2+ transitions -->
The seed script exercises two state transitions:
1. Pipeline: DRAFT → ACTIVE (create then update)
2. SyncRun: PENDING → RUNNING → COMPLETED (create then two updates)

The seed creates 3+ entities per domain model to ensure realistic data
for development and manual testing scenarios.

## CI/CD Testing
Tests run in GitHub Actions with PostgreSQL 16 service container.
The CI pipeline uses pnpm for package management and includes:
- Linting with ESLint
- Unit and integration tests with Jest
- Build verification with nest build
- Migration alignment check with prisma migrate diff

## Test Data Requirements
All test data uses realistic but non-production values:
- Email addresses use @example.com or @acme.com domains
- Passwords meet minimum 8-character requirement
- Tenant slugs are URL-safe identifiers
- Configuration JSON uses representative structures
