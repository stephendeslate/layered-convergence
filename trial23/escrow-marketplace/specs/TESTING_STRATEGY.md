# Testing Strategy — Escrow Marketplace

## Overview
Testing follows a pyramid approach: unit tests at the base, integration tests
in the middle, and accessibility tests for frontend components. Backend uses
Jest; frontend uses Vitest with axe-core.

<!-- VERIFY:TS-001: Backend unit tests mock Prisma (no real DB) -->
<!-- VERIFY:TS-002: Integration tests use real DB via docker-compose.test.yml -->
<!-- VERIFY:TS-003: Frontend tests include axe-core accessibility checks -->
<!-- VERIFY:TS-004: Every service has a corresponding .spec.ts file -->
<!-- VERIFY:TS-005: Keyboard navigation tested in frontend -->

## Test Pyramid

### Unit Tests (Backend — Jest)
Located alongside source files as `*.spec.ts`.

| File | Coverage Target |
|------|----------------|
| auth.service.spec.ts | register, login, validateUser, salt 12 assertion |
| transaction.service.spec.ts | CRUD, state transitions (valid + invalid) |
| dispute.service.spec.ts | create, resolve, list |
| payout.service.spec.ts | list, findFirst with justification |
| webhook.service.spec.ts | create, list |

All dependencies mocked with `jest.fn()`. Prisma client is mocked — these are
pure unit tests with no database interaction.

### Integration Tests (Backend — Jest)
Located in `backend/test/`.

- Use `Test.createTestingModule` with real `AppModule`
- Connect to real PostgreSQL via `docker-compose.test.yml`
- Zero `jest.spyOn` on Prisma methods
- Cover full request lifecycle: auth → create → update → verify

### Frontend Tests (Vitest + axe-core)
Located in `frontend/__tests__/`.

- Every test file imports axe-core and runs accessibility assertions
- Keyboard navigation tests verify tab order and focus management
- Loading states tested for `role="status"` and `aria-busy="true"`
- Error states tested for `role="alert"` and focus behavior

## Test Infrastructure

### docker-compose.test.yml
Provides an isolated PostgreSQL 16 instance for integration tests:
```yaml
services:
  test-db:
    image: postgres:16
    environment:
      POSTGRES_DB: escrow_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
```

### Coverage Targets
- Backend unit: > 80% line coverage per service
- Backend integration: all happy paths + key error paths
- Frontend: all routes rendered, all interactive elements accessible

## Conventions
- No `console.log` in test files (use Jest/Vitest matchers)
- No `as any` type assertions
- Every `findFirst` call has a justification comment
- Test descriptions follow "should [expected behavior] when [condition]" format

## Related Specifications
- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for module structure
- See [API_CONTRACT.md](API_CONTRACT.md) for endpoint coverage targets
- See [UI_SPECIFICATION.md](UI_SPECIFICATION.md) for accessibility requirements
