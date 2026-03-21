# Testing Strategy: Escrow Marketplace

## Overview

The Escrow Marketplace employs a multi-layer testing approach covering
unit, integration, and accessibility tests.

## Test Pyramid

### Unit Tests (Backend)
[VERIFY:EM-032] Unit tests in `src/` directory alongside service files.
Each service has dedicated test coverage with mocked dependencies.

[VERIFY:EM-033] Tests use Test.createTestingModule from @nestjs/testing
with jest.fn() mock implementations for Prisma and JWT services.

Coverage includes:
- AuthService: registration, duplicate detection, login, password validation
- TransactionService: state transitions, context setting
- DisputeService: filing, state machine validation

### Integration Tests (Backend)
[VERIFY:EM-034] Integration tests use real AppModule for end-to-end
HTTP endpoint testing with supertest.

Test scenarios:
- Registration validation (empty body, ADMIN rejection)
- Login validation (missing credentials)
- Protected endpoints (401 without JWT for transactions, disputes, webhooks)

### Accessibility Tests (Frontend)
[VERIFY:EM-035] Accessibility tests use jest-axe with real component
rendering via @testing-library/react for WCAG compliance checking.

Components tested: Button, Card, Input+Label, Badge, Table
State testing: role="status" for loading, role="alert" for errors

### Keyboard Navigation Tests
[VERIFY:EM-036] Keyboard tests verify Tab order, Enter/Space activation,
and disabled element behavior using @testing-library/user-event.

## CI Integration

Tests run via `npm test` with Jest and ts-jest configuration.

## Coverage Targets

- Unit: 80% line coverage for domain services
- Integration: All HTTP endpoints tested
- Accessibility: All UI components validated

## Cross-References

- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint test targets
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for component tests
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for security testing
