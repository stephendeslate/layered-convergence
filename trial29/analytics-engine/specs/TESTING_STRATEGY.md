# Testing Strategy — Analytics Engine

## Overview
The testing strategy covers unit, integration, accessibility, and keyboard
navigation tests. See SECURITY_MODEL.md for security test requirements
and UI_SPECIFICATION.md for frontend component testing details.

## Backend Unit Tests
<!-- VERIFY:AE-UNIT-TESTS — Service specs with mocked Prisma -->
Each service has a dedicated spec file using Test.createTestingModule with
mocked PrismaService:
- `auth.service.spec.ts` — tests register, login, password hashing
- `pipeline.service.spec.ts` — tests CRUD, state transitions, raw SQL
- `dashboard.service.spec.ts` — tests CRUD, widget management

All mocks use `{ provide: PrismaService, useValue: mockPrisma }` pattern.

## Integration Tests
<!-- VERIFY:AE-INTEGRATION-TESTS — Supertest + AppModule tests -->
Integration tests use supertest with the real AppModule, overriding only
PrismaService. Tests verify:
- Health endpoint returns 200
- ADMIN role rejected during registration (400)
- Invalid email rejected (400)
- Short password rejected (400)
- Pipeline listing returns empty array
- Dashboard listing returns empty array

## Frontend Accessibility Tests
<!-- VERIFY:AE-ACCESSIBILITY-TESTS — jest-axe with real components -->
Accessibility tests use jest-axe to verify WCAG compliance on real
components:
- Button component
- Input with Label combination
- Card component
- Badge component
- Nav component
- Loading state aria attributes
- Error state role attribute

## Keyboard Navigation Tests
<!-- VERIFY:AE-KEYBOARD-TESTS — userEvent Tab/Enter/Space -->
Keyboard tests use @testing-library/user-event to verify:
- Tab moves focus sequentially between interactive elements
- Enter activates focused buttons
- Space activates focused buttons
- Shift+Tab moves focus backwards
- Disabled buttons are skipped during tab navigation

## Seed Data Verification
<!-- VERIFY:AE-SEED-TRANSITIONS — Seed data with 2+ transitions -->
The seed script creates sample data with at least 2 state transitions:
1. Pipeline: DRAFT -> ACTIVE
2. SyncRun: PENDING -> RUNNING -> COMPLETED
This verifies that state machine transitions work correctly in the
data model. Entity definitions are in DATA_MODEL.md.

## Test Infrastructure
- Backend tests run in Node.js environment with Jest
- Frontend tests run in jsdom environment with Jest
- CI runs tests against PostgreSQL 16 service container
- docker-compose.test.yml provides isolated test database
- See SYSTEM_ARCHITECTURE.md for CI pipeline details

## Coverage Goals
- Service layer: >80% line coverage
- Controllers: verified through integration tests
- Frontend components: accessibility + keyboard compliance
- Security: ADMIN exclusion, input validation verified
