# Testing Strategy

**Project:** analytics-engine
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

- VERIFY: AE-TEST-001 — Auth service tests: register, login, role rejection

### Dashboard Service Tests
Tests dashboard creation with generateId, pagination, and not-found handling.

- VERIFY: AE-TEST-002 — Dashboard service tests: create, findAll, findOne

### Pipeline Service Tests
Tests pipeline creation, status transitions, and invalid transition rejection.

- VERIFY: AE-TEST-003 — Pipeline service tests: create, updateStatus, findAll

## Integration Tests

Two integration test files use real AppModule with supertest:

### Auth Integration
Tests registration validation, ADMIN rejection, and unauthenticated access.

- VERIFY: AE-TEST-004 — Auth integration: validation, ADMIN rejection, 401

### Domain Integration
Tests unauthenticated access to all domain endpoints.

- VERIFY: AE-TEST-005 — Domain integration: dashboards and pipelines 401

## Frontend Tests

### Accessibility Tests
All 8 shadcn/ui components are tested with jest-axe for WCAG compliance.

- VERIFY: AE-TEST-006 — Accessibility tests with jest-axe on all 8 components

### Keyboard Navigation Tests
Tests Tab, Enter, Space key interactions on interactive components.

- VERIFY: AE-TEST-007 — Keyboard tests with userEvent Tab/Enter/Space

## Test File Locations

| File | Type | Location |
|------|------|----------|
| auth.service.spec.ts | Unit | apps/api/src/auth/__tests__/ |
| dashboards.service.spec.ts | Unit | apps/api/src/dashboards/__tests__/ |
| pipelines.service.spec.ts | Unit | apps/api/src/pipelines/__tests__/ |
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
