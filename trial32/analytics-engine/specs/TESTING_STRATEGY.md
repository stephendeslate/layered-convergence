# Testing Strategy — Analytics Engine

## Overview

The testing strategy covers unit tests, integration tests, accessibility tests,
and keyboard navigation tests across both backend and frontend applications.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [UI_SPECIFICATION.md](UI_SPECIFICATION.md)

## Backend Testing

### Unit Tests
- Framework: Jest with ts-jest
- Strategy: Mock Prisma service for isolated unit tests
- Coverage: Auth service, Pipeline service, Dashboard service, SyncRun service (4 test files)
- Each service test validates:
  - CRUD operations
  - Error handling (NotFoundException, BadRequestException)
  - State machine transition validation
  - Role validation

### Integration Tests
- [VERIFY:AE-TS-001] Docker Compose provides PostgreSQL for integration tests -> Implementation: docker-compose.test.yml:1
- [VERIFY:AE-TS-002] Integration tests for auth endpoints with real AppModule -> Implementation: apps/api/__integration__/auth.spec.ts:1
- [VERIFY:AE-TS-003] Integration tests for pipeline endpoints with real AppModule -> Implementation: apps/api/__integration__/pipeline.spec.ts:1
- Framework: Jest + supertest
- Real AppModule is imported — not mocked
- Real PostgreSQL database via Docker Compose
- Tests create and tear down data in beforeAll/afterAll

### Test Database
- PostgreSQL 16 in Docker with tmpfs for speed
- Isolated database: analytics_engine_test
- Migrations run before integration tests
- Data is cleaned between test suites

## Frontend Testing

### Accessibility Tests
- [VERIFY:AE-TS-004] Frontend components tested with jest-axe -> Implementation: apps/web/__tests__/pages.test.tsx:1
- Framework: Vitest + @testing-library/react + jest-axe
- Real component rendering with axe-core validation
- Tests cover: Button, Card, Form, Table, Navigation
- All components must pass WCAG 2.1 AA criteria

### Keyboard Navigation Tests
- Framework: Vitest + @testing-library/user-event
- Tab order validation through form elements
- Shift+Tab reverse navigation
- Focus management on interactive elements
- Skip-to-content link functionality

## Test Execution

### Local Development
```bash
# All tests via Turborepo
pnpm turbo run test

# Backend unit tests only
cd apps/api && pnpm test

# Frontend tests only
cd apps/web && pnpm test
```

### CI Pipeline
- Tests run in parallel via Turborepo
- PostgreSQL service container for integration tests
- Environment variables set for CI context
- Test failures block deployment

## Coverage Goals

- Backend services: 80%+ branch coverage
- State machine transitions: 100% path coverage
- Frontend accessibility: All components pass axe-core
- Integration: Happy path + error paths for auth and pipelines
