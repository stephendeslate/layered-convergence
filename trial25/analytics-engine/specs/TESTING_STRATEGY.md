# Testing Strategy — Analytics Engine

## Overview

Analytics Engine follows a test pyramid approach with unit tests for services, integration tests for module composition, and frontend tests for accessibility compliance.

See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for the module structure and [API_CONTRACT.md](./API_CONTRACT.md) for endpoint specifications under test.

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

[VERIFY:TS-001] AuthService unit test mocks PrismaService and JwtService, tests register and login flows.
> Implementation: `backend/src/auth/auth.service.spec.ts`

[VERIFY:TS-002] PipelineService unit test verifies state machine transition enforcement.
> Implementation: `backend/src/pipeline/pipeline.service.spec.ts`

[VERIFY:TS-003] DataSourceService unit test verifies CRUD operations with tenant context.
> Implementation: `backend/src/data-source/data-source.service.spec.ts`

[VERIFY:TS-004] DashboardService unit test verifies creation and not-found error handling.
> Implementation: `backend/src/dashboard/dashboard.service.spec.ts`

## Integration Tests

[VERIFY:TS-005] Integration test imports real AppModule and resolves all service providers without jest.spyOn on Prisma.
> Implementation: `backend/test/app.integration.spec.ts`

## Frontend Tests

[VERIFY:TS-006] Keyboard navigation test verifies skip-to-content link, tab indices, and ARIA labels.
> Implementation: `frontend/app/keyboard.test.tsx`

[VERIFY:TS-007] Accessibility test verifies role="status" on loading states and role="alert" on error boundaries.
> Implementation: `frontend/app/accessibility.test.tsx`

## Coverage Targets

- Backend unit: 1+ test file per service
- Backend integration: 1 integration test using real AppModule
- Frontend: keyboard navigation + accessibility compliance tests

## Cross-References

- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for security-related test assertions
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for accessibility test requirements
