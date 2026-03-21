# Testing Strategy — Analytics Engine

## Overview

The testing strategy follows a test pyramid with three layers: backend unit tests, backend
integration tests, and frontend component tests. Each layer validates different aspects of
the system with appropriate isolation levels.

## Test Pyramid

### Layer 1: Backend Unit Tests (in src/)

Every NestJS service has a corresponding `.spec.ts` file in the same directory. These tests
use `Test.createTestingModule` with mocked dependencies (PrismaService, JwtService) to test
business logic in isolation.

**Coverage:**
- auth.service.spec.ts — Registration, login, user validation
- pipeline.service.spec.ts — CRUD, state machine transitions
- dashboard.service.spec.ts — CRUD with tenant isolation
- data-source.service.spec.ts — CRUD operations
- data-point.service.spec.ts — CRUD with Decimal value handling
- widget.service.spec.ts — CRUD scoped to dashboard
- embed.service.spec.ts — CRUD, token lookup, deactivation
- sync-run.service.spec.ts — CRUD, state machine transitions
- tenant-context.service.spec.ts — RLS context setting

### Layer 2: Integration Tests (in __integration__/)

Integration tests use `Test.createTestingModule` with the real AppModule to verify module
wiring and dependency injection. They run against a test database provisioned via Docker
Compose.

[VERIFY:TS-001] docker-compose.test.yml provides PostgreSQL 16 test database on port 5433.
> Implementation: `backend/docker-compose.test.yml:1`

[VERIFY:TS-002] Auth integration test uses real AppModule — ZERO jest.spyOn on Prisma.
> Implementation: `backend/__integration__/auth.spec.ts:1`

[VERIFY:TS-003] Pipeline integration test uses real AppModule — validates module wiring.
> Implementation: `backend/__integration__/pipeline.spec.ts:1`

### Layer 3: Frontend Tests

Frontend tests use Vitest with jsdom environment and include accessibility validation via
axe-core. Tests cover all page components and keyboard navigation.

[VERIFY:TS-004] Frontend pages tested with axe-core for accessibility violations.
> Implementation: `frontend/__tests__/pages.test.tsx:1`

## Test Configuration

| Environment | Runner | Config File |
|------------|--------|-------------|
| Backend Unit | Jest | package.json (jest section) |
| Backend Integration | Jest | jest.integration.config.js |
| Frontend | Vitest | vitest.config.ts |

## Quality Gates

- Zero `as any` in production code
- Zero `console.log` in production code
- Zero `$executeRawUnsafe` anywhere
- All findFirst calls have justification comments
- Integration tests must NOT use jest.spyOn on Prisma

## CI Integration

Tests run in three stages:
1. Backend unit tests: `cd backend && npm test`
2. Backend integration tests: `cd backend && npm run test:integration`
3. Frontend tests: `cd frontend && npm run test:run`

## Cross-References

- **SYSTEM_ARCHITECTURE.md**: Defines the modules tested in isolation
- **API_CONTRACT.md**: Specifies the endpoint behaviors verified by integration tests
- **UI_SPECIFICATION.md**: Documents the pages validated by frontend tests
