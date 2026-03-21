# Testing Strategy — Analytics Engine

## Overview
The testing strategy covers unit tests, integration tests, accessibility tests,
and keyboard navigation tests across both backend and frontend.

## Backend Testing

### Unit Tests
Service-level unit tests with mocked Prisma client.
Each service method has dedicated test cases verifying:
- Correct Prisma method calls and arguments
- Return value transformation
- Error handling paths
<!-- VERIFY:AE-UNIT-TESTS — Service spec files with mocked Prisma -->

### Integration Tests
End-to-end API tests using supertest with the real AppModule.
PrismaService is overridden with mock implementations for database isolation.
Tests verify:
- HTTP status codes for valid and invalid requests
- Request body validation (whitelist, forbidNonWhitelisted)
- Role restriction enforcement (ADMIN rejection)
- Response payload structure
<!-- VERIFY:AE-INTEGRATION-TESTS — Integration tests with supertest + AppModule -->

### Test Database
Docker Compose test configuration (docker-compose.test.yml) provides
an isolated PostgreSQL instance with tmpfs for fast teardown.
CI pipeline uses PostgreSQL 16 service containers.

## Frontend Testing

### Accessibility Tests
Real jest-axe tests rendering actual components:
- Button, Input, Label, Card, Badge, Nav components tested
- axe() function runs full WCAG 2.1 audit
- toHaveNoViolations matcher validates compliance
<!-- VERIFY:AE-ACCESSIBILITY-TESTS — jest-axe tests with real component rendering -->

### Keyboard Navigation Tests
userEvent-based tests verifying:
- Tab order between interactive elements
- Enter key activates focused buttons
- Space key activates focused buttons
- Shift+Tab moves focus backwards
- Disabled elements are skipped in tab order
<!-- VERIFY:AE-KEYBOARD-TESTS — userEvent Tab/Enter/Space tests -->

## Test Infrastructure

### Backend Test Runner
Jest with ts-jest transform for TypeScript support.
Test files follow *.spec.ts naming convention.
Coverage collection excludes main.ts bootstrap file.

### Frontend Test Runner
Jest with jsdom environment for DOM simulation.
Module path aliases mapped via moduleNameMapper.
@testing-library/jest-dom provides DOM assertion matchers.

## CI Integration
All tests run in the CI pipeline:
- Lint job checks code style
- Test job runs unit and integration tests with PostgreSQL service
- Build job verifies compilation succeeds
- Migration-check job validates schema/migration alignment

## Coverage Targets
- Backend services: >= 80% branch coverage
- Frontend components: accessibility audit pass
- Integration: all API endpoints tested

## Test Data
Seed script (prisma/seed.ts) creates sample data with state transitions:
- Pipeline: DRAFT -> ACTIVE transition
- SyncRun: PENDING -> RUNNING -> COMPLETED transition
<!-- VERIFY:AE-SEED-TRANSITIONS — Seed data with 2+ state transitions -->
