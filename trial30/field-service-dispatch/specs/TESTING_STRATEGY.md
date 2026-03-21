# Testing Strategy — Field Service Dispatch

## Overview
This document describes the testing approach for Field Service Dispatch.
See SYSTEM_ARCHITECTURE.md for architecture context, SECURITY_MODEL.md
for security testing, and UI_SPECIFICATION.md for frontend testing.

## Backend Testing

<!-- VERIFY:FSD-UNIT-TESTS — Service specs with mocked Prisma -->
### Unit Tests
Three unit test files cover the backend services:
1. `auth.service.spec.ts` — registration, login, hashing, JWT payload
2. `work-order.service.spec.ts` — CRUD, state transitions, raw queries
3. `schedule.service.spec.ts` — CRUD, find by technician, deletion

All unit tests use mocked PrismaService and JwtService. Tests verify:
- Service instantiation (toBeDefined)
- Correct Prisma method calls with expected arguments
- State machine transition validation (valid and invalid transitions)
- Exception throwing for not-found and invalid-state scenarios
- bcrypt hash verification with salt 12
- JWT payload structure (sub, email, role)

<!-- VERIFY:FSD-INTEGRATION-TESTS — Supertest + AppModule tests -->
### Integration Tests
Integration tests use supertest with a real NestJS application instance.
PrismaService is overridden with a mock to avoid database dependency.
Tests cover:
- Health endpoint returns 200
- ADMIN role rejection in registration (400)
- Invalid email rejection (400)
- Short password rejection (400)
- Invalid login body rejection (400)
- Work order listing endpoint (200)
- Schedule listing endpoint (200)

<!-- VERIFY:FSD-SEED-TRANSITIONS — Seed data with 2+ transitions -->
### Seed Data
The seed script demonstrates entity lifecycle with state transitions:
- Work order 1: OPEN -> ASSIGNED -> IN_PROGRESS -> COMPLETED (full lifecycle)
- Work order 2: OPEN -> ASSIGNED -> CANCELLED (cancellation path)
- Work order 3: OPEN (initial state, pending dispatch)

Seed data includes 4 users, 3 customers, 3 service areas, 3 work orders,
3 equipment items, 3 skills, and 3 schedules. The seed script uses the
main() pattern with .finally(() => prisma.$disconnect()).

## Frontend Testing

<!-- VERIFY:FSD-ACCESSIBILITY-TESTS — jest-axe with real components -->
### Accessibility Tests
Seven accessibility tests use jest-axe with real component rendering:
1. Button — no violations
2. Input with Label — no violations
3. Card with content — no violations
4. Badge — no violations
5. Nav — no violations
6. Loading state — correct aria-busy attribute
7. Error state — correct role="alert"

<!-- VERIFY:FSD-KEYBOARD-TESTS — userEvent Tab/Enter/Space -->
### Keyboard Navigation Tests
Five keyboard tests use @testing-library/user-event:
1. Tab moves focus between interactive elements
2. Enter activates a focused button
3. Space activates a focused button
4. Shift+Tab moves focus backwards
5. Disabled button is not focusable via tab
