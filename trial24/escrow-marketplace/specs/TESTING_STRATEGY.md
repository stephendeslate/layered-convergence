# Testing Strategy — Escrow Marketplace

## Overview

The testing strategy follows a test pyramid approach with unit tests at the base,
integration tests in the middle, and accessibility tests for the frontend. All tests
use industry-standard frameworks and follow NestJS and Next.js best practices.

**Cross-references:** [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [API_CONTRACT.md](API_CONTRACT.md), [UI_SPECIFICATION.md](UI_SPECIFICATION.md)

## Test Pyramid

```
        /  E2E (Integration)  \
       /   Service Unit Tests   \
      /  Component & A11y Tests  \
     /___________________________\
```

## Backend Unit Tests

Unit tests are co-located with services in `backend/src/`. Each service has a
corresponding `.spec.ts` file that tests business logic in isolation using
mocked dependencies.

[VERIFY:TS-001] Backend unit tests MUST use `Test.createTestingModule` with mocked dependencies.
> Implementation: `backend/src/auth/auth.service.spec.ts:10`

[VERIFY:TS-002] The tenant context service MUST have unit tests verifying RLS context setting.
> Implementation: `backend/src/tenant-context/tenant-context.service.spec.ts:6`

### Unit Test Files (6 total)
1. `auth.service.spec.ts` — Registration, login, password hashing, duplicate detection
2. `transaction.service.spec.ts` — CRUD, state transitions, role validation
3. `dispute.service.spec.ts` — Creation, resolution, state validation
4. `payout.service.spec.ts` — Creation, status transitions, authorization
5. `webhook.service.spec.ts` — CRUD operations, ownership verification
6. `tenant-context.service.spec.ts` — RLS context management

## Backend Integration Tests

Integration tests use real database connections via Docker Compose and test full
request/response cycles through the NestJS application.

[VERIFY:TS-003] Integration tests MUST use `Test.createTestingModule` with real AppModule (no Prisma mocking).
> Implementation: `backend/test/app.e2e-spec.ts:8`

[VERIFY:TS-004] A `docker-compose.test.yml` MUST provide a test PostgreSQL instance.
> Implementation: `docker-compose.test.yml:3`

### Integration Test Coverage
- Auth flow: register, login, duplicate rejection, ADMIN rejection
- Transaction flow: create, list, fund, ship, invalid transitions
- Dispute flow: create, list, resolve
- Webhook flow: create, list
- Validation: unknown fields rejected, auth required

## Frontend Tests

Frontend tests use Vitest with Testing Library and jest-axe for accessibility validation.

[VERIFY:TS-005] Frontend accessibility tests MUST use axe-core (jest-axe) with `toHaveNoViolations`.
> Implementation: `frontend/__tests__/accessibility.test.tsx:5`

[VERIFY:TS-006] A dedicated `keyboard-navigation.test.tsx` MUST verify Tab, Shift+Tab, Enter, and Space interactions.
> Implementation: `frontend/__tests__/keyboard-navigation.test.tsx:5`

[VERIFY:TS-007] Page-level tests MUST verify rendering structure and accessibility compliance.
> Implementation: `frontend/__tests__/pages.test.tsx:6`

### Frontend Test Files (4 total)
1. `accessibility.test.tsx` — axe-core violations, ARIA attributes, sr-only
2. `keyboard-navigation.test.tsx` — Tab navigation, skip link, button activation
3. `pages.test.tsx` — Page rendering, form accessibility
4. `components.test.tsx` — Component rendering, accessible markup

## CI Integration

Tests are designed to run in CI pipelines:
- `npm test` — runs backend unit tests
- `npm run test:e2e` — runs integration tests (requires Docker)
- Frontend `vitest run` — runs all frontend tests
- All tests must pass before merge to main
