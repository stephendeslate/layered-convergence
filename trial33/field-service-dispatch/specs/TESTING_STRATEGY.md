# Field Service Dispatch — Testing Strategy

## Overview

Comprehensive testing strategy covering backend unit tests, integration tests,
frontend accessibility tests, and keyboard navigation tests. See API_SPEC.md
for endpoint specifications and AUTH_SPEC.md for authentication test cases.

## Backend Unit Tests

### Auth Service Tests
- VERIFY: FD-TST-AUTH-001 — AuthService rejects ADMIN role during registration
- VERIFY: FD-TST-AUTH-002 — AuthService throws UnauthorizedException on invalid login
- Test file: apps/api/src/auth/__tests__/auth.service.spec.ts
- Cross-references: AUTH_SPEC.md (registration restrictions)

### Dispatch Service Tests
- VERIFY: FD-TST-WO-001 — DispatchService returns paginated results
- VERIFY: FD-TST-WO-002 — DispatchService throws NotFoundException
- VERIFY: FD-TST-WO-003 — DispatchService rejects invalid transitions
- Test file: apps/api/src/dispatch/__tests__/dispatch.service.spec.ts
- Cross-references: STATE_MACHINES.md (WorkOrderStatus)

### Technician Service Tests
- VERIFY: FD-TST-TECH-001 — TechnicianService throws NotFoundException
- VERIFY: FD-TST-TECH-002 — TechnicianService updates availability
- VERIFY: FD-TST-TECH-003 — TechnicianService finds available technicians
- Test file: apps/api/src/technician/__tests__/technician.service.spec.ts
- Cross-references: API_SPEC.md (technician endpoints)

## Integration Tests

- VERIFY: FD-TST-INT-001 — Integration tests use real AppModule with supertest
- VERIFY: FD-TST-INT-002 — Protected endpoints return 401 without token
- VERIFY: FD-TST-INT-003 — Registration rejects ADMIN role via validation
- Test file: apps/api/src/__tests__/app.integration.spec.ts
- Uses actual NestJS application instance, not mocks
- Cross-references: API_SPEC.md (all endpoints)

## Frontend Accessibility Tests

- VERIFY: FD-TST-A11Y-001 — jest-axe validates Button, Card, Input, Label components
- VERIFY: FD-TST-A11Y-002 — jest-axe validates Badge, Alert, Table components
- Test file: apps/web/__tests__/accessibility.spec.tsx
- Uses real component renders with @testing-library/react
- Cross-references: REQUIREMENTS.md (NFR-3)

## Keyboard Navigation Tests

- VERIFY: FD-TST-KB-001 — Tab navigation between focusable elements
- VERIFY: FD-TST-KB-002 — Enter and Space activate buttons
- VERIFY: FD-TST-KB-003 — Disabled buttons are not focusable
- Test file: apps/web/__tests__/keyboard.spec.tsx
- Uses userEvent from @testing-library/user-event
- Cross-references: REQUIREMENTS.md (NFR-3)

## Test Infrastructure

- Backend: Jest with ts-jest, @nestjs/testing module builder
- Frontend: Jest with jest-environment-jsdom, @testing-library/react
- CI runs all tests via `pnpm turbo run test`
- PostgreSQL service container for integration tests
- Cross-references: SECURITY.md (CI pipeline), REQUIREMENTS.md (NFR-4)

## Coverage Requirements

- All state machine transitions must have positive and negative test cases
- All authentication flows must be covered (register, login, rejection)
- All protected endpoints must verify 401 without token
- All UI components must pass accessibility validation
- Cross-references: STATE_MACHINES.md, AUTH_SPEC.md, API_SPEC.md
