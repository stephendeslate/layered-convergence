# Testing Specification

## Overview

Testing covers unit tests, integration tests, security tests, performance tests,
monitoring tests, accessibility tests, and keyboard interaction tests.

## Test Structure

### Backend Tests (apps/api/test/)

| File | Type | Coverage |
|------|------|----------|
| auth.service.spec.ts | Unit | Auth registration, login, role validation |
| auth.integration.spec.ts | Integration | HTTP request/response validation |
| work-orders.service.spec.ts | Unit | CRUD, state machine, sanitization |
| technicians.service.spec.ts | Unit | CRUD, select optimization, tenant scoping |
| domain.integration.spec.ts | Integration | CRUD auth enforcement |
| security.spec.ts | Unit | sanitizeInput, maskSensitive, role validation |
| performance.spec.ts | Unit | withTimeout, normalizePageParams, paginate |
| monitoring.spec.ts | Unit | createCorrelationId, formatLogEntry, MetricsService |

### Frontend Tests (apps/web/__tests__/)

| File | Type | Coverage |
|------|------|----------|
| accessibility.test.tsx | A11y | jest-axe on all UI components |
| keyboard.test.tsx | Interaction | Tab focus, Enter/Space activation |

## Test Configuration

- Backend: Jest with ts-jest, node environment
- Frontend: Jest with ts-jest, jsdom environment
- Module alias: `@field-service-dispatch/shared` mapped to source

## Key Assertions

### Auth Tests
- VERIFY: FD-AUTH-005 — Role rejection, duplicate email, token generation
- VERIFY: FD-AUTH-006 — HTTP 400/401/409 status code validation

### Work Order Tests
- VERIFY: FD-WO-005 — State machine transitions (OPEN->IN_PROGRESS, FAILED->OPEN)
- VERIFY: FD-WO-006 — Domain integration auth enforcement

### Technician Tests
- VERIFY: FD-TECH-005 — CRUD with sanitized input and select optimization

### Security Tests
- VERIFY: FD-SEC-001 — sanitizeInput strips HTML and script tags
- VERIFY: FD-SEC-002 — XSS prevention validation
- VERIFY: FD-SEC-003 — Rate limiting configuration

### Performance Tests
- VERIFY: FD-PERF-003 — withTimeout resolves/rejects correctly
- VERIFY: FD-PERF-006 — MAX_PAGE_SIZE capping

### Monitoring Tests
- VERIFY: FD-MON-003 — Correlation ID format and uniqueness
- VERIFY: FD-MON-004 — Structured log entry format

## Mocking Strategy

- PrismaService mocked with jest.fn() for all model methods
- JwtService mocked to return deterministic tokens
- No actual database connections in unit tests
- Integration tests use test database (docker-compose.test.yml)

## Coverage Goals

- All shared utility functions covered
- All service methods covered with positive and negative cases
- State machine transitions exhaustively tested
- Input sanitization edge cases covered
