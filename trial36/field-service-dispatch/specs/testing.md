# Testing Strategy

**Project:** field-service-dispatch
**Layer:** 6 — Security
**Version:** 1.0.0

---

## Overview

The testing strategy covers unit tests, integration tests, security tests,
accessibility tests, and keyboard navigation tests across both the API
and web applications. All test files are at least 55 lines for meaningful
coverage. See also: security.md for security-specific test details.

## Backend Unit Tests

Unit tests mock the Prisma service to isolate business logic. Each
service has its own test file with focused assertions.

- VERIFY: FD-TEST-001 — Auth service tests cover registration, login, and role rejection
- VERIFY: FD-TEST-002 — Work orders service tests cover creation and status transitions
- VERIFY: FD-TEST-003 — Technicians service tests cover CRUD and not-found handling

## Backend Integration Tests

Integration tests use supertest with a real NestJS test application
to verify HTTP endpoints, authentication guards, and validation.

- VERIFY: FD-TEST-004 — Auth integration tests verify registration validation and auth
- VERIFY: FD-TEST-005 — Domain integration tests verify JWT protection on all routes

## Security Tests

Security tests verify Helmet headers, input validation, sanitization
utilities, and data masking behavior.

- VERIFY: FD-TEST-006 — Security tests verify Helmet headers, validation, and sanitization

## Frontend Accessibility Tests

Accessibility tests use jest-axe to verify all 8 UI components are
WCAG-compliant with no automated violations.

- VERIFY: FD-TEST-007 — Accessibility tests check all 8 components with jest-axe

## Frontend Keyboard Tests

Keyboard navigation tests use @testing-library/user-event to verify
Tab focus management, Enter/Space activation, and disabled states.

- VERIFY: FD-TEST-008 — Keyboard tests verify Tab, Enter, Space, and disabled states

## Test Organization

- API unit tests: apps/api/test/*.service.spec.ts
- API integration tests: apps/api/test/*.integration.spec.ts
- API security tests: apps/api/test/security.spec.ts
- Web accessibility tests: apps/web/__tests__/components.spec.tsx
- Web keyboard tests: apps/web/__tests__/keyboard.spec.tsx
- Web page tests: apps/web/__tests__/pages.spec.tsx

## Test Runners

- Backend: Jest with ts-jest transform
- Frontend: Jest with jest-environment-jsdom
- Both use @testing-library packages for consistent assertions

## Coverage Goals

- All service methods have at least one test
- All endpoints reject unauthenticated requests
- All security headers are verified
- All UI components pass accessibility checks
- Interactive elements respond to keyboard input
