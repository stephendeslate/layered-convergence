# Testing Strategy -- Field Service Dispatch

## Overview

Testing follows a layered approach with unit tests for services, integration tests for the full application, and frontend accessibility tests.

## Unit Tests

[VERIFY:TS-001] Unit test for AuthService covering registration and login flows.
> Implementation: `backend/src/auth/auth.service.spec.ts`

[VERIFY:TS-002] Unit test for WorkOrderService covering state machine transitions.
> Implementation: `backend/src/work-order/work-order.service.spec.ts`

[VERIFY:TS-003] Unit test for RouteService covering state machine transitions.
> Implementation: `backend/src/route/route.service.spec.ts`

[VERIFY:TS-004] Unit test for InvoiceService covering state machine transitions.
> Implementation: `backend/src/invoice/invoice.service.spec.ts`

## Integration Tests

[VERIFY:TS-005] Integration test using real AppModule to verify application bootstrap.
> Implementation: `backend/test/app.integration.spec.ts`

## Frontend Tests

[VERIFY:TS-006] Keyboard navigation test verifying skip-to-content link and navigation landmarks.
> Implementation: `frontend/app/keyboard.test.tsx`

[VERIFY:TS-007] Accessibility test verifying role="status" on loading states and role="alert" on error boundaries.
> Implementation: `frontend/app/accessibility.test.tsx`

## Test Coverage Goals

- All state machine services have transition validation tests
- All auth flows tested (register, login, duplicate email, invalid credentials)
- All error boundaries have role="alert" verification
- All loading states have role="status" and aria-busy="true" verification

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for module structure
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for frontend accessibility requirements
