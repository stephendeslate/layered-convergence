# Testing Strategy: Analytics Engine

## Overview

The Analytics Engine follows a comprehensive testing pyramid with unit,
integration, and accessibility test layers.

## Test Pyramid

### Unit Tests (Backend)
[VERIFY:AE-031] Unit tests reside in `src/` alongside service files using
`.spec.ts` extension. Each service has dedicated unit tests.

[VERIFY:AE-032] Dependencies are mocked using Test.createTestingModule from
@nestjs/testing with jest.fn() mock implementations.

Test coverage includes:
- AuthService: registration, login, duplicate email, wrong password
- AnalyticsService: pipeline state transitions, dashboard CRUD
- TenantService: context setting and clearing

### Integration Tests (Backend)
[VERIFY:AE-033] Integration tests use real AppModule to test actual HTTP
endpoints including validation, authentication guards, and error responses.

Test scenarios:
- Registration validation (missing fields, ADMIN role rejection)
- Login validation (missing credentials)
- Protected endpoint authentication (401 without JWT)

### Accessibility Tests (Frontend)
[VERIFY:AE-034] Accessibility tests use jest-axe with real component rendering
via @testing-library/react to detect WCAG violations.

Components tested:
- Button, Card, Input+Label, Badge, Table
- Loading states (role="status", aria-busy)
- Error states (role="alert")

### Keyboard Navigation Tests (Frontend)
[VERIFY:AE-035] Keyboard tests verify Tab focus order, Enter/Space activation,
and disabled element skip behavior.

## CI Integration

Tests run via `npm test` with Jest configuration:
- Backend: ts-jest transform for TypeScript
- Frontend: jest-environment-jsdom for DOM testing

## Coverage Targets

- Unit tests: 80% line coverage for services
- Integration tests: All endpoints covered
- Accessibility: All shared UI components checked

## Cross-References

- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint test targets
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for component test targets
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for security test requirements
