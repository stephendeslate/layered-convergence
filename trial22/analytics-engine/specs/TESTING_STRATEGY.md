# Testing Strategy

## Overview

The Analytics Engine uses a multi-layered testing approach:
- Backend integration tests: Jest with real PostgreSQL database
- Frontend component tests: Vitest with Testing Library and axe-core
- Keyboard navigation tests: Vitest with userEvent

## Backend Integration Tests

Integration tests use `Test.createTestingModule` with REAL modules (no mocking).
Tests connect to a real PostgreSQL 16 database via Docker Compose.

Key principles:
- No `jest.spyOn` mocking of Prisma
- Real database operations for true integration testing
- Test data cleanup in afterAll hooks
- ValidationPipe enabled in test app

[VERIFY:TS-001] Docker Compose provides PostgreSQL 16 for integration tests -> Implementation: docker-compose.test.yml:1

[VERIFY:TS-002] Integration tests use real DB via Test.createTestingModule -> Implementation: __integration__/auth.integration.spec.ts:1

[VERIFY:TS-003] No jest.spyOn mocking of Prisma in integration tests -> Implementation: __integration__/auth.integration.spec.ts:2

[VERIFY:TS-004] Pipeline state machine integration test with real DB -> Implementation: __integration__/pipeline.integration.spec.ts:1

## Frontend Component Tests

Frontend tests use Vitest with @testing-library/react. Every test file includes
axe-core accessibility checks via jest-axe.

[VERIFY:TS-005] Nav component tests with axe-core accessibility checks -> Implementation: frontend/__tests__/nav.test.tsx:1

[VERIFY:TS-006] Loading component tests verify role="status" and aria-busy="true" -> Implementation: frontend/__tests__/loading.test.tsx:1

[VERIFY:TS-007] Button component test with axe-core accessibility audit -> Implementation: frontend/__tests__/button.test.tsx:1

## Keyboard Navigation Tests

Dedicated keyboard navigation tests validate:
- Tab order through interactive elements
- Enter and Space key activation of buttons
- Focus management including skip-to-content links
- Disabled elements are not focusable

[VERIFY:TS-008] Keyboard navigation tests for Tab, Enter/Space, focus management -> Implementation: frontend/__tests__/keyboard-navigation.test.tsx:1

## Test Infrastructure

### Backend
```bash
docker compose -f docker-compose.test.yml up -d
npx prisma db push
npx jest --config jest.integration.config.ts
```

### Frontend
```bash
npx vitest run
```

## Coverage Goals

- Backend: 80%+ line coverage on services
- Frontend: 100% of loading.tsx and error.tsx files tested
- All UI components have axe-core accessibility audits
- Keyboard navigation coverage for all interactive patterns

## Cross-References

- API endpoints under test: see API_CONTRACT.md
- Database schema tested: see DATA_MODEL.md
- UI components tested: see UI_SPECIFICATION.md
