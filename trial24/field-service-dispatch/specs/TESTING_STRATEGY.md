# Testing Strategy — Field Service Dispatch

## Overview

FSD employs a multi-level testing strategy covering unit tests (backend services),
integration tests (API endpoints), and frontend component tests. The test pyramid
prioritizes fast, isolated unit tests at the base with integration tests for
end-to-end correctness.

## Test Pyramid

```
        ┌──────────┐
        │   E2E    │  ← 7 integration test files
        │  Tests   │     (auth, work-orders, customers,
        ├──────────┤      technicians, invoices, routes, gps-events)
        │  Unit    │  ← 8 service spec files in src/
        │  Tests   │     (mocked Prisma dependencies)
        ├──────────┤
        │ Frontend │  ← 5 test files in __tests__/
        │  Tests   │     (pages, components, loading, error, keyboard)
        └──────────┘
```

## Backend Unit Tests

### Location and Convention

All backend unit test files are co-located with their source code in the `src/` directory.
Each NestJS service has a corresponding `.spec.ts` file:

| File | Tests |
|------|-------|
| `auth/auth.service.spec.ts` | Registration, login, password hashing |
| `work-order/work-order.service.spec.ts` | CRUD, state transitions, invalid transitions |
| `customer/customer.service.spec.ts` | CRUD, not-found handling |
| `technician/technician.service.spec.ts` | CRUD, not-found handling |
| `invoice/invoice.service.spec.ts` | CRUD, state transitions |
| `route/route.service.spec.ts` | CRUD, state transitions |
| `gps-event/gps-event.service.spec.ts` | CRUD, technician filtering |
| `company-context/company-context.service.spec.ts` | RLS context setting |

### Mocking Strategy

Unit tests use `Test.createTestingModule` with **mocked** Prisma service. Each mock
provides `jest.fn()` implementations for the Prisma methods used by the service
(findMany, findFirst, create, update, delete).

**Key rule:** Unit tests MUST NOT use `jest.spyOn` on real Prisma client instances.
All database interactions are mocked at the provider level.

## Backend Integration Tests

### Location and Convention

Integration tests live in the `test/` directory with the `.e2e-spec.ts` suffix.
They use `Test.createTestingModule` with the **real** AppModule (no mocks).

| File | Coverage |
|------|----------|
| `test/auth.e2e-spec.ts` | Registration, login, token validation |
| `test/work-orders.e2e-spec.ts` | CRUD + state transitions |
| `test/customers.e2e-spec.ts` | CRUD operations |
| `test/technicians.e2e-spec.ts` | CRUD operations |
| `test/invoices.e2e-spec.ts` | CRUD + state transitions |
| `test/routes.e2e-spec.ts` | CRUD + state transitions |
| `test/gps-events.e2e-spec.ts` | CRUD + technician filtering |

### Database

Integration tests use a dedicated PostgreSQL container (`docker-compose.test.yml`)
with PostgreSQL 16. The test database is reset between test suites.

## Frontend Tests

### Test Runner

Frontend tests use Vitest with jsdom environment, configured via `vitest.config.ts`.
The setup file imports `@testing-library/jest-dom/vitest` for DOM matchers.

### Test Files

| File | Coverage |
|------|----------|
| `pages.test.tsx` | Dashboard page rendering, entity cards, navigation links |
| `components.test.tsx` | Button, Input, Label, Card, Badge rendering and variants |
| `loading.test.tsx` | Loading component rendering for all routes |
| `error.test.tsx` | Error component rendering, reset button interaction |
| `keyboard-navigation.test.tsx` | Tab focus, Enter/Space key, aria-label |

## Verified Testing Requirements

[VERIFY:TS-001] All 8 services MUST have `.spec.ts` unit test files in the `src/` directory.
> Implementation: `backend/src/auth/auth.service.spec.ts` (and 7 others)

[VERIFY:TS-002] Unit tests MUST use `Test.createTestingModule` with mocked dependencies.
> Implementation: `backend/src/auth/auth.service.spec.ts`

[VERIFY:TS-003] Integration tests MUST use `Test.createTestingModule` with real AppModule.
> Implementation: `backend/test/auth.e2e-spec.ts`

[VERIFY:TS-004] Integration tests MUST NOT use `jest.spyOn` on Prisma client.
> Implementation: `backend/test/auth.e2e-spec.ts`

[VERIFY:TS-005] Frontend pages MUST have rendering tests.
> Implementation: `frontend/__tests__/pages.test.tsx`

[VERIFY:TS-006] Frontend shadcn/ui components MUST have rendering and variant tests.
> Implementation: `frontend/__tests__/components.test.tsx`

[VERIFY:TS-007] Loading components MUST be tested to verify they render for all routes.
> Implementation: `frontend/__tests__/loading.test.tsx`

[VERIFY:TS-008] Error components MUST be tested for message display and reset interaction.
> Implementation: `frontend/__tests__/error.test.tsx`

[VERIFY:TS-009] Keyboard navigation and accessibility MUST be tested.
> Implementation: `frontend/__tests__/keyboard-navigation.test.tsx`

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for module structure that tests follow.
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint behaviors tested in integration tests.
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for component requirements tested in frontend tests.
