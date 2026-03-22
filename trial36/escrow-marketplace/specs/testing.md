# Testing Specification

## Overview

Comprehensive test suite covering unit tests, integration tests, security tests,
component accessibility tests, and keyboard navigation tests.

## Test Categories

### Unit Tests (3 files)
- auth.service.spec.ts — Registration, login, password hashing, role validation
- listings.service.spec.ts — CRUD operations, authorization, pagination
- transactions.service.spec.ts — State transitions, escrow logic, validation

### Integration Tests (2 files)
- auth.integration.spec.ts — Full auth flow through NestJS test module
- domain.integration.spec.ts — Cross-domain interactions (listings + transactions)

### Security Tests (1 file)
- security.spec.ts — Helmet headers, rate limiting responses, input validation

### Component Tests (1 file)
- components.spec.tsx — jest-axe on all 8 UI components

### Keyboard Tests (1 file)
- keyboard.spec.tsx — Tab, Enter, Space navigation with userEvent

## Test Configuration

- Jest with ts-jest for API tests
- Jest with @testing-library/react for web tests
- jest-axe for accessibility assertions
- @testing-library/user-event for keyboard simulation

## Coverage Targets

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Verification Tags

<!-- VERIFY: EM-TEST-001 — Unit tests for all three services -->
<!-- VERIFY: EM-TEST-002 — Integration tests with real AppModule -->
<!-- VERIFY: EM-TEST-003 — Security test for Helmet headers -->
<!-- VERIFY: EM-TEST-004 — jest-axe on 8 UI components -->
<!-- VERIFY: EM-TEST-005 — Keyboard navigation tests -->
<!-- VERIFY: EM-TEST-006 — Security input validation tests -->
<!-- VERIFY: EM-TEST-007 — Transaction state machine tests -->
