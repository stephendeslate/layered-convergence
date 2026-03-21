# Testing Strategy — Escrow Marketplace

## Overview

Escrow Marketplace follows a test pyramid approach with unit tests for services, integration tests for module composition, and frontend tests for accessibility compliance.

See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for module structure and [API_CONTRACT.md](./API_CONTRACT.md) for endpoints under test.

## Test Pyramid

```
        ┌──────────┐
        │  E2E     │  (future)
       ┌┴──────────┴┐
       │ Integration │  test/ directory — real AppModule
      ┌┴────────────┴┐
      │   Unit Tests  │  src/**/*.spec.ts — mocked deps
     ┌┴──────────────┴┐
     │  Accessibility  │  frontend — axe-core / jest-axe
     └────────────────┘
```

## Unit Tests

[VERIFY:TS-001] AuthService unit test mocks PrismaService and JwtService.
> Implementation: `backend/src/auth/auth.service.spec.ts`

[VERIFY:TS-002] TransactionService unit test verifies state machine enforcement.
> Implementation: `backend/src/transaction/transaction.service.spec.ts`

[VERIFY:TS-003] DisputeService unit test verifies state machine enforcement.
> Implementation: `backend/src/dispute/dispute.service.spec.ts`

[VERIFY:TS-004] PayoutService unit test verifies creation and not-found handling.
> Implementation: `backend/src/payout/payout.service.spec.ts`

## Integration Tests

[VERIFY:TS-005] Integration test imports real AppModule without jest.spyOn on Prisma.
> Implementation: `backend/test/app.integration.spec.ts`

## Frontend Tests

[VERIFY:TS-006] Keyboard navigation test verifies skip link, tab indices, ARIA labels.
> Implementation: `frontend/app/keyboard.test.tsx`

[VERIFY:TS-007] Accessibility test verifies role attributes on loading and error states.
> Implementation: `frontend/app/accessibility.test.tsx`

## Coverage Targets

- Backend unit: 1+ test per service (AuthService, TransactionService, DisputeService, PayoutService)
- Backend integration: 1 integration test using real AppModule
- Frontend: keyboard navigation + accessibility compliance tests

## Cross-References

- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for security test assertions
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for accessibility test requirements
