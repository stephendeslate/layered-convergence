# Testing Strategy — Field Service Dispatch

## Overview

Testing is divided into backend unit tests (Jest), backend integration tests
(Jest + real PostgreSQL), and frontend tests (Vitest + axe-core).

See: SYSTEM_ARCHITECTURE.md, PRODUCT_VISION.md

## Backend Unit Tests

### Approach
- Every service has a `.spec.ts` file in its module directory
- Dependencies are mocked using `jest.fn()` — no real database calls
- Test files use `Test.createTestingModule` with mocked providers

### Coverage

| Service | File | Key Tests |
|---------|------|-----------|
| AuthService | `auth.service.spec.ts` | register (hashing, salt 12, ADMIN rejection), login, validateUser |
| WorkOrderService | `work-order.service.spec.ts` | state transitions (valid + invalid), CRUD |
| CustomerService | `customer.service.spec.ts` | CRUD operations |
| TechnicianService | `technician.service.spec.ts` | CRUD operations |
| InvoiceService | `invoice.service.spec.ts` | state machine transitions, CRUD |
| RouteService | `route.service.spec.ts` | CRUD operations |
| GpsEventService | `gps-event.service.spec.ts` | CRUD operations |
| CompanyContextService | `company-context.service.spec.ts` | setCompanyContext |

## VERIFY:UNIT_TEST_FILES — All 8 services have .spec.ts unit test files
## VERIFY:MOCK_ISOLATION — Unit tests use jest.fn() for mock isolation

## Backend Integration Tests

### Approach
- Located in `backend/test/`
- Use `Test.createTestingModule` with real NestJS modules
- Connect to real PostgreSQL via `docker-compose.test.yml`
- ZERO `jest.spyOn` on Prisma methods — all database calls are real

## VERIFY:ZERO_SPY_ON — Integration tests never use jest.spyOn on Prisma methods

### Test Files

| File | Coverage |
|------|----------|
| `test/auth.e2e-spec.ts` | Registration, login, JWT issuance |
| `test/work-orders.e2e-spec.ts` | CRUD, state transitions |
| `test/customers.e2e-spec.ts` | CRUD operations |
| `test/technicians.e2e-spec.ts` | CRUD operations |
| `test/invoices.e2e-spec.ts` | CRUD, state transitions |

## VERIFY:INTEGRATION_TEST_COUNT — At least 5 integration test files exist

### Test Database
`docker-compose.test.yml` provides an isolated PostgreSQL 16 instance:
- Port: 5433 (avoids conflict with dev DB)
- Database: `fsd_test`
- Automatic schema migration before tests

## Frontend Tests

### Vitest Configuration
- Test framework: Vitest with jsdom environment
- Accessibility: axe-core integrated in ALL test files
- Coverage threshold: statements, branches, functions, lines

### Accessibility Testing
Every frontend test file includes axe-core checks:
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

## VERIFY:AXE_CORE_TESTS — axe-core tests present in all frontend test files

### Keyboard Navigation
Dedicated test file for keyboard navigation:
- Tab order verification
- Enter/Space activation
- Escape to close dialogs
- Focus management in error states

## VERIFY:KEYBOARD_NAV_TEST — Keyboard navigation test file exists

### Loading State Accessibility
All loading states include:
- `role="status"` attribute
- `aria-busy="true"` attribute
- `<span className="sr-only">Loading...</span>` for screen readers

## VERIFY:SR_ONLY_LOADING — Loading states include sr-only text

## Test Commands

```bash
# Backend unit tests
cd backend && npm run test

# Backend integration tests
docker compose -f docker-compose.test.yml up -d
cd backend && npm run test:e2e

# Frontend tests
cd frontend && npm run test
```

See: SECURITY_MODEL.md, UI_SPECIFICATION.md
