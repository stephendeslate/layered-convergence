# Testing Strategy Specification — Field Service Dispatch

## Overview

The testing strategy covers backend unit tests, integration tests, accessibility tests,
and keyboard navigation tests. See REQUIREMENTS.md for functional context and
AUTH_SPEC.md for authentication test details.

## Backend Unit Tests

Three unit test files cover core business logic with mocked dependencies:

### Auth Service Tests
Tests registration role validation, duplicate email rejection, bcrypt hashing with
salt 12, and login credential verification. Uses jest.mock for bcrypt.
- VERIFY: FD-TA-UNIT-001 — Auth service unit tests in auth/__tests__/auth.service.spec.ts

### Work Order Service Tests
Tests invalid status rejection, invalid state transition rejection, valid transitions
(CREATED->ASSIGNED), work order not found handling, and slug generation from titles.
- VERIFY: FD-TA-UNIT-002 — Work order service unit tests in workorder/__tests__/

### Technician Service Tests
Tests tenant context setting before queries, and technician creation with slugified names
using the shared slugify() utility for URL-safe identifier generation.
- VERIFY: FD-TA-UNIT-003 — Technician service unit tests in technician/__tests__/

## Integration Tests

Two integration test files test real endpoints with supertest and the actual AppModule:

### Auth Integration Tests
Tests POST /auth/register ADMIN rejection, invalid email validation, missing fields
on login, and JWT requirement on GET /auth/profile. Uses real NestJS application instance.
- VERIFY: FD-TA-INT-001 — Auth integration tests with supertest and real AppModule

### Domain Integration Tests
Tests JWT requirement on all domain endpoints: GET/POST /workorders,
PATCH /workorders/:id/status, GET/POST /technicians. Ensures all routes are protected.
- VERIFY: FD-TA-INT-002 — Domain integration tests with supertest and real AppModule

## Accessibility Tests

### jest-axe Component Tests
All 8 UI components are tested for WCAG violations using jest-axe.
Components tested: Button, Card, Input+Label, Badge, Alert, Table, Skeleton.
- VERIFY: FD-AX-JEST-001 — jest-axe accessibility tests on real components

### Loading States
All 4 route loading.tsx files use role="status" + aria-busy="true" for screen readers.
Each loading component uses Skeleton placeholders to indicate content is being fetched.
- VERIFY: FD-AX-LOADING-001 — WorkOrders loading with role="status" + aria-busy
- VERIFY: FD-AX-LOADING-002 — Technicians loading with role="status" + aria-busy
- VERIFY: FD-AX-LOADING-003 — Schedule loading with role="status" + aria-busy
- VERIFY: FD-AX-LOADING-004 — Settings loading with role="status" + aria-busy

### Error States
All 4 route error.tsx files use role="alert" + useRef + focus management.
The heading receives focus on mount for screen reader announcement.
Error components display the error message in a destructive Alert variant.
- VERIFY: FD-AX-ERROR-001 — Work orders error with role="alert" + useRef + focus
- VERIFY: FD-AX-ERROR-002 — Technicians error with role="alert" + useRef + focus
- VERIFY: FD-AX-ERROR-003 — Schedule error with role="alert" + useRef + focus
- VERIFY: FD-AX-ERROR-004 — Settings error with role="alert" + useRef + focus

## Keyboard Navigation Tests

Keyboard tests use @testing-library/user-event to verify:
- Tab focus on Button and Input elements
- Enter and Space activation on Button
- Sequential Tab navigation through multiple focusable elements
- VERIFY: FD-AX-KEY-001 — Keyboard navigation tests with userEvent

## Test Coverage Goals

All service methods should have corresponding unit tests covering:
- Happy path (valid inputs produce expected outputs)
- Error cases (invalid inputs throw appropriate exceptions)
- Edge cases (empty data, missing fields, boundary values)

Integration tests should verify authentication requirements on all endpoints
and validate that unauthenticated requests return 401 status codes.

## Cross-References
- See AUTH_SPEC.md for authentication test requirements
- See STATE_MACHINES.md for work order transition test cases
- See SECURITY.md for security-related test expectations
- See REQUIREMENTS.md for overall test coverage goals
