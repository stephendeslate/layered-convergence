# Testing Strategy — Analytics Engine

## Overview

The testing strategy covers three levels: backend unit tests (Jest with mocked Prisma),
backend integration tests (Jest with real database), and frontend tests (Vitest with
axe-core accessibility checks).

## Backend Unit Tests

Unit tests are located in `src/` alongside the service files they test. Each service
has a corresponding `.spec.ts` file. Dependencies are mocked using `jest.fn()`.

### Test Files
- `src/auth/auth.service.spec.ts` — register, login, validateUser
- `src/pipeline/pipeline.service.spec.ts` — CRUD and state machine transitions
- `src/dashboard/dashboard.service.spec.ts` — CRUD with tenant isolation
- `src/data-source/data-source.service.spec.ts` — CRUD
- `src/data-point/data-point.service.spec.ts` — CRUD
- `src/widget/widget.service.spec.ts` — CRUD
- `src/embed/embed.service.spec.ts` — CRUD
- `src/sync-run/sync-run.service.spec.ts` — CRUD and state machine
- `src/tenant-context/tenant-context.service.spec.ts` — setTenantContext

### Mock Strategy
Prisma is mocked at the service level using `jest.fn()` for each Prisma model method.
This ensures tests are fast, isolated, and do not require a database connection.

[VERIFY:TS-001] Docker Compose for test database -> Implementation: backend/docker-compose.test.yml:1
[VERIFY:TS-002] Integration test for auth with real modules -> Implementation: backend/__integration__/auth.spec.ts:1
[VERIFY:TS-003] Integration test for pipeline state machine -> Implementation: backend/__integration__/pipeline.spec.ts:1

### Auth Service Tests
- Register: verifies password hashing with salt 12, ADMIN rejection, token generation
- Login: valid credentials return token, invalid credentials throw UnauthorizedException
- ValidateUser: returns user data for valid ID, throws for invalid ID

### Pipeline Service Tests
- State machine: tests all valid transitions (DRAFT->ACTIVE, ACTIVE->PAUSED,
  ACTIVE->ARCHIVED, PAUSED->ACTIVE, PAUSED->ARCHIVED)
- State machine: tests invalid transitions (DRAFT->PAUSED, DRAFT->ARCHIVED,
  ARCHIVED->any state)
- CRUD: create, findAll, findOne, update, remove

### SyncRun Service Tests
- State machine: PENDING->RUNNING, RUNNING->SUCCESS, RUNNING->FAILED
- Invalid transitions: PENDING->SUCCESS, SUCCESS->any, FAILED->any
- Error message handling for FAILED transitions

## Backend Integration Tests

Integration tests are in `__integration__/` and use `Test.createTestingModule` with
real NestJS modules. They verify that modules load correctly and that state machine
logic is integrated properly.

**Critical rule**: ZERO `jest.spyOn` on Prisma methods in integration tests.
Integration tests use the real database.

## Frontend Tests

Frontend tests use Vitest with jsdom environment and axe-core for accessibility.

[VERIFY:TS-004] Frontend tests with axe-core accessibility -> Implementation: frontend/__tests__/pages.test.tsx:1

### Page Tests
Every page component is tested for:
1. Correct rendering of headings and content
2. No critical accessibility violations (axe-core)

### Keyboard Navigation Tests
Dedicated test file verifying:
- Form fields are keyboard accessible
- Proper label associations
- Focus management
- Required field attributes

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for module structure
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint specifications
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for accessibility requirements
