# Escrow Marketplace — Testing Strategy

## Overview

Comprehensive testing strategy covering backend unit tests, integration tests,
frontend accessibility tests, and keyboard navigation tests. See API_SPEC.md
for endpoint specifications and AUTH_SPEC.md for authentication test cases.

## Backend Unit Tests

### Auth Service Tests
- VERIFY: EM-TST-AUTH-001 — AuthService rejects ADMIN role during registration
- VERIFY: EM-TST-AUTH-002 — AuthService rejects invalid roles
- VERIFY: EM-TST-AUTH-003 — AuthService throws UnauthorizedException on invalid login
- Test file: apps/api/src/auth/__tests__/auth.service.spec.ts
- Cross-references: AUTH_SPEC.md (registration restrictions)

### Escrow Service Tests
- VERIFY: EM-TST-ESC-001 — EscrowService returns paginated results
- VERIFY: EM-TST-ESC-002 — EscrowService throws NotFoundException
- VERIFY: EM-TST-ESC-003 — EscrowService rejects invalid transitions
- VERIFY: EM-TST-ESC-004 — EscrowService allows CREATED -> FUNDED
- Test file: apps/api/src/escrow/__tests__/escrow.service.spec.ts
- Cross-references: STATE_MACHINES.md (EscrowStatus)

### Dispute Service Tests
- VERIFY: EM-TST-DISP-001 — DisputeService throws NotFoundException
- VERIFY: EM-TST-DISP-002 — DisputeService rejects invalid transitions
- VERIFY: EM-TST-DISP-003 — DisputeService allows OPEN -> UNDER_REVIEW
- Test file: apps/api/src/payment/__tests__/dispute.service.spec.ts
- Cross-references: STATE_MACHINES.md (DisputeStatus)

## Integration Tests

- VERIFY: EM-TST-INT-001 — Integration tests use real AppModule with supertest
- VERIFY: EM-TST-INT-002 — Protected endpoints return 401 without token
- VERIFY: EM-TST-INT-003 — Registration rejects ADMIN role via validation
- Test file: apps/api/src/__tests__/app.integration.spec.ts
- Uses actual NestJS application instance, not mocks
- Cross-references: API_SPEC.md (all endpoints)

## Frontend Accessibility Tests

- VERIFY: EM-TST-A11Y-001 — jest-axe validates Button, Card, Input, Label components
- VERIFY: EM-TST-A11Y-002 — jest-axe validates Badge, Alert, Table components
- Test file: apps/web/__tests__/accessibility.spec.tsx
- Uses real component renders with @testing-library/react
- Cross-references: REQUIREMENTS.md (NFR-3)

## Keyboard Navigation Tests

- VERIFY: EM-TST-KB-001 — Tab navigation between focusable elements
- VERIFY: EM-TST-KB-002 — Enter and Space activate buttons
- VERIFY: EM-TST-KB-003 — Disabled buttons are not focusable
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
