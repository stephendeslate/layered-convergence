# Testing Strategy Specification — Escrow Marketplace

## Overview

The testing strategy covers backend unit tests, integration tests, accessibility tests,
and keyboard navigation tests. See REQUIREMENTS.md for functional context and
AUTH_SPEC.md for authentication test details.

## Backend Unit Tests

Three unit test files cover core business logic with mocked dependencies:

### Auth Service Tests
Tests registration role validation, duplicate email rejection, bcrypt hashing,
and login credential verification.
- VERIFY: EM-TA-UNIT-001 — Auth service unit tests in auth/__tests__/

### Listing Service Tests
Tests tenant context setting, listing not found handling, and slug generation.
- VERIFY: EM-TA-UNIT-002 — Listing service unit tests in listing/__tests__/

### Transaction Service Tests
Tests invalid status rejection, invalid state transitions, valid transitions
(INITIATED->FUNDED), and transaction not found handling.
- VERIFY: EM-TA-UNIT-003 — Transaction service unit tests in transaction/__tests__/

## Integration Tests

Two integration test files test real endpoints with supertest and actual AppModule:

### Auth Integration Tests
Tests ADMIN rejection, invalid email, missing fields, JWT requirement.
- VERIFY: EM-TA-INT-001 — Auth integration tests with supertest and real AppModule

### Domain Integration Tests
Tests JWT requirement on all domain endpoints.
- VERIFY: EM-TA-INT-002 — Domain integration tests with supertest and real AppModule

## Accessibility Tests

### jest-axe Component Tests
All interactive UI components tested for WCAG violations.
- VERIFY: EM-AX-JEST-001 — jest-axe accessibility tests on real components

### Loading States
All 4 route loading.tsx files use role="status" + aria-busy="true".
- VERIFY: EM-AX-LOADING-001 — Listings loading with role="status" + aria-busy
- VERIFY: EM-AX-LOADING-002 — Transactions loading with role="status" + aria-busy
- VERIFY: EM-AX-LOADING-003 — Disputes loading with role="status" + aria-busy
- VERIFY: EM-AX-LOADING-004 — Settings loading with role="status" + aria-busy

### Error States
All 4 route error.tsx files use role="alert" + useRef + focus management.
- VERIFY: EM-AX-ERROR-001 — Listings error with role="alert" + useRef + focus
- VERIFY: EM-AX-ERROR-002 — Transactions error with role="alert" + useRef + focus
- VERIFY: EM-AX-ERROR-003 — Disputes error with role="alert" + useRef + focus
- VERIFY: EM-AX-ERROR-004 — Settings error with role="alert" + useRef + focus

## Keyboard Navigation Tests

- VERIFY: EM-AX-KEY-001 — Keyboard navigation tests with userEvent

## Cross-References
- See AUTH_SPEC.md for authentication test requirements
- See STATE_MACHINES.md for transaction transition test cases
- See SECURITY.md for security-related test expectations
- See REQUIREMENTS.md for overall test coverage goals
