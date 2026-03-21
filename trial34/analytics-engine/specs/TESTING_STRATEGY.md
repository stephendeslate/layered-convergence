# Testing Strategy Specification — Analytics Engine

## Overview

The testing strategy covers backend unit tests, integration tests, accessibility tests,
and keyboard navigation tests. See REQUIREMENTS.md for functional context and
AUTH_SPEC.md for authentication test details.

## Backend Unit Tests

Three unit test files cover core business logic with mocked dependencies:

### Auth Service Tests
Tests registration role validation, duplicate email rejection, bcrypt hashing with
salt 12, and login credential verification. Uses jest.mock for bcrypt.
- VERIFY: AE-TA-UNIT-001 — Auth service unit tests in auth/__tests__/auth.service.spec.ts

### Dashboard Service Tests
Tests tenant context setting, dashboard not found handling, and slug generation
from dashboard names using the shared slugify() utility.
- VERIFY: AE-TA-UNIT-002 — Dashboard service unit tests in dashboard/__tests__/

### Pipeline Service Tests
Tests invalid status rejection, invalid state transition rejection, valid transitions
(PENDING->RUNNING), pipeline not found handling, and slug generation.
- VERIFY: AE-TA-UNIT-003 — Pipeline service unit tests in pipeline/__tests__/

## Integration Tests

Two integration test files test real endpoints with supertest and the actual AppModule:

### Auth Integration Tests
Tests POST /auth/register ADMIN rejection, invalid email validation, missing fields
on login, and JWT requirement on GET /auth/profile.
- VERIFY: AE-TA-INT-001 — Auth integration tests with supertest and real AppModule

### Domain Integration Tests
Tests JWT requirement on all domain endpoints: GET/POST /dashboards,
GET/POST /pipelines, PATCH /pipelines/:id/status.
- VERIFY: AE-TA-INT-002 — Domain integration tests with supertest and real AppModule

## Accessibility Tests

### jest-axe Component Tests
All 7 interactive UI components are tested for WCAG violations using jest-axe.
Components tested: Button, Card, Input+Label, Badge, Alert, Table.
- VERIFY: AE-AX-JEST-001 — jest-axe accessibility tests on real components

### Loading States
All 4 route loading.tsx files use role="status" + aria-busy="true" for screen readers.
- VERIFY: AE-AX-LOADING-001 — Dashboard loading with role="status" + aria-busy
- VERIFY: AE-AX-LOADING-002 — Pipelines loading with role="status" + aria-busy
- VERIFY: AE-AX-LOADING-003 — Reports loading with role="status" + aria-busy
- VERIFY: AE-AX-LOADING-004 — Settings loading with role="status" + aria-busy

### Error States
All 4 route error.tsx files use role="alert" + useRef + focus management.
The heading receives focus on mount for screen reader announcement.
- VERIFY: AE-AX-ERROR-001 — Dashboard error with role="alert" + useRef + focus
- VERIFY: AE-AX-ERROR-002 — Pipelines error with role="alert" + useRef + focus
- VERIFY: AE-AX-ERROR-003 — Reports error with role="alert" + useRef + focus
- VERIFY: AE-AX-ERROR-004 — Settings error with role="alert" + useRef + focus

## Keyboard Navigation Tests

Keyboard tests use @testing-library/user-event to verify:
- Tab focus on Button and Input elements
- Enter and Space activation on Button
- Sequential Tab navigation through multiple focusable elements
- VERIFY: AE-AX-KEY-001 — Keyboard navigation tests with userEvent

## Cross-References
- See AUTH_SPEC.md for authentication test requirements
- See STATE_MACHINES.md for pipeline transition test cases
- See SECURITY.md for security-related test expectations
- See REQUIREMENTS.md for overall test coverage goals
