# Testing Strategy: Escrow Marketplace

## Overview

The Escrow Marketplace uses a test pyramid with unit tests, integration
tests, and accessibility tests to ensure correctness and security.

## Backend Unit Tests

### Auth Service Tests
[VERIFY:EM-031] Backend unit tests use Test.createTestingModule with mocked
PrismaService and JwtService. Tests verify bcrypt salt 12 usage, credential
validation, and token generation independently.

[VERIFY:EM-032] Auth tests cover: registration with bcrypt salt 12, login
rejection for non-existent users, login rejection for wrong passwords,
and successful login with token return.

### Transaction Service Tests
[VERIFY:EM-033] Transaction service tests verify state machine enforcement:
rejection of invalid transitions (RELEASED -> FUNDED), acceptance of valid
transitions (PENDING -> FUNDED), and user context setting via $executeRaw.

### Dispute Service Tests
[VERIFY:EM-034] Dispute service tests verify dispute creation, rejection of
resolution on already-resolved disputes, and successful resolution of open
disputes.

## Integration Tests

[VERIFY:EM-035] Integration tests use real AppModule with supertest endpoint
testing. PrismaService is overridden with mocks. Tests verify:
- ADMIN role rejection on registration (400)
- Missing field rejection (400)
- Non-whitelisted field rejection (forbidNonWhitelisted)
- Authentication requirement on protected endpoints (401)

## Frontend Tests

### Accessibility
Tests use jest-axe to verify WCAG compliance of Button, Card, Input+Label,
and Badge components.

### Keyboard Navigation
Tests verify Tab navigation, Enter activation, Space activation, and
sequential field focus using @testing-library/user-event.

## Test Commands

```bash
cd backend && npm test    # Backend unit + integration tests
cd frontend && npm test   # Frontend accessibility + keyboard tests
```

## Cross-References

- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoints being tested
- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for module structure
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for components under test
