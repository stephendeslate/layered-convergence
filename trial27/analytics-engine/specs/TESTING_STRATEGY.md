# Testing Strategy: Analytics Engine

## Overview

The Analytics Engine follows a test pyramid approach with unit tests at the
base, integration tests in the middle, and accessibility tests for frontend
components.

## Backend Unit Tests

### Auth Service Tests
[VERIFY:AE-031] Backend unit tests use Test.createTestingModule with mocked
dependencies (PrismaService, JwtService). Tests verify bcrypt salt round 12,
credential validation, and token generation independently of the database.

### Test Structure
[VERIFY:AE-032] Auth service tests cover four scenarios: successful registration
with bcrypt salt 12, rejection of invalid credentials (user not found),
rejection of wrong password, and successful login with token generation.

### Analytics Service Tests
[VERIFY:AE-033] Analytics service unit tests verify dashboard retrieval with
tenant context, pipeline state machine transition validation (rejecting invalid
transitions from ARCHIVED), and valid pipeline transitions (DRAFT to ACTIVE).

### Tenant Service Tests
[VERIFY:AE-034] Tenant service unit tests verify tenant context setting via
$executeRaw, tenant listing, and tenant creation. All use Test.createTestingModule
with mocked PrismaService.

## Backend Integration Tests

[VERIFY:AE-035] Integration tests use the real AppModule with supertest for
HTTP endpoint testing. PrismaService is overridden with mocks to avoid database
dependency. Tests verify:
- ADMIN role rejection on registration (400 status)
- Missing required fields rejection (400 status)
- Non-whitelisted fields rejection (forbidNonWhitelisted)
- Authentication requirement on protected endpoints (401 status)

## Frontend Tests

### Accessibility Testing
Tests use jest-axe to verify WCAG compliance of UI components. Each component
(Button, Card, Input with Label, Badge) is rendered and checked for violations.

### Keyboard Navigation Testing
Tests use @testing-library/user-event to verify Tab key navigation between
form elements, Enter and Space key activation of buttons, and proper focus
management across interactive components.

## Test Coverage Goals

- Unit tests: 80%+ line coverage on service classes
- Integration tests: All REST endpoints have at least one happy-path test
- Accessibility: All interactive components pass jest-axe
- Keyboard: All forms navigable without mouse

## Test Commands

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for module structure
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint specifications being tested
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for components under test
