# Testing Specification

## Overview

The testing strategy covers unit tests, integration tests, security tests,
performance tests, accessibility tests, and keyboard navigation tests.
All backend tests use Jest with ts-jest. Frontend tests use Testing Library
with jest-axe for accessibility.

## Backend Unit Tests

<!-- VERIFY: FD-TEST-001 — Auth service unit tests -->

Auth service tests cover registration (success, duplicate email, ADMIN
rejection, sanitization, masking), login (valid, invalid user, wrong
password), and findById.

<!-- VERIFY: FD-TEST-002 — Work orders service unit tests -->

Work orders service tests cover create (with generated ID, input
sanitization), findAll (pagination), findOne (success, not found),
updateStatus (valid transitions, invalid transitions), and remove.

<!-- VERIFY: FD-TEST-003 — Technicians service unit tests -->

Technicians service tests cover create (with generated ID, sanitization),
findAll (pagination), findOne (success, not found), update (success,
not found), and remove (success, not found).

## Integration Tests

<!-- VERIFY: FD-TEST-004 — Auth integration tests with supertest -->

Auth integration tests use supertest to make real HTTP requests through
the NestJS application. Tests cover validation errors, ADMIN role
rejection, short passwords, invalid emails, missing fields, and
unauthenticated access to protected endpoints.

<!-- VERIFY: FD-TEST-005 — Domain integration tests for work orders and technicians -->

Domain integration tests verify that all work order and technician
endpoints require authentication (401 for unauthenticated requests).

## Security Tests

<!-- VERIFY: FD-TEST-006 — Security tests with supertest for Helmet, validation, utilities -->

Security tests use supertest to verify Helmet headers (CSP,
X-Content-Type-Options, X-Frame-Options, X-Powered-By removal),
input validation (length constraints), and shared utility functions
(sanitizeInput, maskSensitive, slugify, truncateText, normalizePageParams).

## Performance Tests

<!-- VERIFY: FD-TEST-007 — Performance tests for response time, pagination, and withTimeout -->

Performance tests verify response time constraints (< 500ms), pagination
limit enforcement via normalizePageParams, withTimeout behavior (success,
timeout, error propagation), and API caching header responses.

## Frontend Tests

<!-- VERIFY: FD-TEST-UI-001 — Component accessibility tests with jest-axe -->

Component tests render each shadcn/ui component and verify no
accessibility violations using jest-axe. All 8 components are tested.

<!-- VERIFY: FD-TEST-UI-002 — Keyboard navigation tests with userEvent -->

Keyboard tests verify Enter/Space activation on buttons, Tab/Shift+Tab
navigation between focusable elements, typed input acceptance, and
disabled button behavior.

<!-- VERIFY: FD-TEST-UI-003 — Page rendering tests with accessibility checks -->

Page tests verify dashboard card rendering, Badge variant rendering,
loading skeleton ARIA attributes, error alert rendering with role="alert",
and retry button presence.

## Cross-References

- See [Security](./security.md) for security hardening requirements
- See [Performance](./performance.md) for response time budgets
