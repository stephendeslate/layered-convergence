# Testing Strategy — Analytics Engine

## Overview
Comprehensive testing across unit, integration, accessibility, and keyboard
navigation layers. All tests use proper mocking and assertion patterns.

See also: [SECURITY_MODEL.md](SECURITY_MODEL.md), [UI_SPECIFICATION.md](UI_SPECIFICATION.md)

## Backend Unit Tests
<!-- VERIFY:AE-UNIT-TESTS -->
Three backend unit test files using Test.createTestingModule with mocked Prisma:

1. auth.service.spec.ts — Tests registration (bcrypt salt 12, JWT payload),
   login (valid credentials, invalid user, wrong password).
2. pipeline.service.spec.ts — Tests findAllByTenant, transitionStatus
   (valid transitions, invalid transitions, missing pipeline), countByTenantRaw,
   activatePipeline.
3. dashboard.service.spec.ts — Tests findAllByTenant, findById (found, not found),
   create, addWidget (existing dashboard, missing dashboard).

## Integration Tests
<!-- VERIFY:AE-INTEGRATION-TESTS -->
Integration tests import the real AppModule and use supertest for HTTP assertions.
PrismaService is overridden with a mock to avoid database dependency.
Tests cover: health endpoint, registration validation (ADMIN rejection,
invalid email, short password), login validation, pipeline listing,
dashboard listing.

## Frontend Accessibility Tests
<!-- VERIFY:AE-ACCESSIBILITY-TESTS -->
jest-axe is imported and used with real component rendering:
- Button component accessibility
- Input with Label accessibility
- Card component accessibility
- Badge component accessibility
- Nav component accessibility
- Loading state aria attributes (role="status", aria-busy="true")
- Error state role attribute (role="alert")

## Keyboard Navigation Tests
<!-- VERIFY:AE-KEYBOARD-TESTS -->
userEvent from @testing-library/user-event is used for keyboard interaction:
- Tab moves focus between interactive elements
- Enter activates a focused button
- Space activates a focused button
- Shift+Tab moves focus backwards
- Disabled buttons are skipped in tab order

## Seed Data and State Transitions
<!-- VERIFY:AE-SEED-TRANSITIONS -->
Seed data (prisma/seed.ts) includes:
- Pipeline state transition: DRAFT -> ACTIVE
- SyncRun state transition: PENDING -> RUNNING -> COMPLETED
- SyncRun failure transition: PENDING -> FAILED (T31 variation)
- Multiple entities per model (3+ data sources, dashboards, widgets, etc.)
- main() function with proper disconnect in finally block
