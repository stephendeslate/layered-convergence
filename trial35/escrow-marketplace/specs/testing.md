# Testing Strategy

**Project:** escrow-marketplace
**Layer:** 5 — Monorepo
**Version:** 1.0.0
**Cross-references:** auth.md, api.md, frontend.md

---

## Overview

The testing strategy covers unit tests for backend services, integration
tests with supertest for API endpoints, accessibility tests with jest-axe,
and keyboard navigation tests with userEvent.

## Backend Unit Tests

Three unit test files cover authentication and domain services:

### Auth Service Tests
Tests registration, login, password hashing, and role validation.

- VERIFY: EM-TEST-001 — Auth service tests: register, login, role rejection

### Listings Service Tests
Tests listing creation with generateId, pagination, and not-found handling.

- VERIFY: EM-TEST-002 — Listings service tests: create, findAll, findOne

### Transactions Service Tests
Tests transaction creation, status transitions, and invalid transition rejection.

- VERIFY: EM-TEST-003 — Transactions service tests: create, updateStatus, findAll

## Integration Tests

Two integration test files use real AppModule with supertest:

### Auth Integration
Tests registration validation, ADMIN rejection, and unauthenticated access.

- VERIFY: EM-TEST-004 — Auth integration: validation, ADMIN rejection, 401

### Domain Integration
Tests unauthenticated access to all domain endpoints.

- VERIFY: EM-TEST-005 — Domain integration: listings and transactions 401

## Frontend Tests

### Accessibility Tests
All 8 shadcn/ui components are tested with jest-axe for WCAG compliance.

- VERIFY: EM-TEST-006 — Accessibility tests with jest-axe on all 8 components

### Keyboard Navigation Tests
Tests Tab, Enter, Space key interactions on interactive components.

- VERIFY: EM-TEST-007 — Keyboard tests with userEvent Tab/Enter/Space

## Test File Locations

| File | Type | Location |
|------|------|----------|
| auth.service.spec.ts | Unit | apps/api/src/auth/__tests__/ |
| listings.service.spec.ts | Unit | apps/api/src/listings/__tests__/ |
| transactions.service.spec.ts | Unit | apps/api/src/transactions/__tests__/ |
| auth.integration.spec.ts | Integration | apps/api/src/__tests__/ |
| domain.integration.spec.ts | Integration | apps/api/src/__tests__/ |
| accessibility.spec.tsx | Accessibility | apps/web/__tests__/ |
| keyboard.spec.tsx | Keyboard | apps/web/__tests__/ |

## Coverage Requirements

All services must have tests for:
- Happy path operations
- Error conditions (not found, conflict, unauthorized)
- Boundary cases (invalid transitions, duplicate entries)
- Security concerns (ADMIN role rejection, unauthenticated access)
