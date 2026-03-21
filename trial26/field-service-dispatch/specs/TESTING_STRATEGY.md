# Testing Strategy: Field Service Dispatch

## Overview

Field Service Dispatch implements comprehensive testing across unit,
integration, and accessibility test layers.

## Test Pyramid

### Unit Tests (Backend)
[VERIFY:FD-035] Unit tests in `src/` directory alongside service files
using `.spec.ts` extension with mocked dependencies.

[VERIFY:FD-036] Tests use Test.createTestingModule from @nestjs/testing
with jest.fn() mock implementations for Prisma and JWT.

Coverage includes:
- AuthService: registration, login, duplicate detection, password validation
- WorkOrderService: creation, assignment, state transitions
- CompanyService: context setting/clearing, company listing

### Integration Tests (Backend)
[VERIFY:FD-037] Integration tests use real AppModule for end-to-end
HTTP endpoint testing with supertest.

Test scenarios:
- Registration validation (empty body, ADMIN role rejection)
- Login validation (missing credentials)
- Protected endpoints (401 for work orders, routes, invoices)

### Accessibility Tests (Frontend)
[VERIFY:FD-038] Accessibility tests use jest-axe with real component
rendering via @testing-library/react for WCAG validation.

Components tested: Button, Card, Input+Label, Badge, Table
State testing: role="status" for loading, role="alert" for errors

### Keyboard Navigation Tests
[VERIFY:FD-039] Keyboard tests verify Tab focus order, Enter/Space
activation, and disabled element behavior.

## CI Integration

Tests run via `npm test` with Jest and ts-jest configuration.

## Coverage Targets

- Unit: 80% line coverage for services
- Integration: All endpoints covered
- Accessibility: All shared UI components validated

## Cross-References

- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint test targets
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for component tests
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for security requirements
