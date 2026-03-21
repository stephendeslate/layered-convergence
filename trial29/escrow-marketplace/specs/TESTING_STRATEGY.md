# Testing Strategy — Escrow Marketplace

## Overview
The Escrow Marketplace testing strategy covers unit tests, integration tests,
accessibility tests, and keyboard navigation tests. See SECURITY_MODEL.md for
security test requirements and UI_SPECIFICATION.md for component test targets.

## Unit Testing
<!-- VERIFY:EM-UNIT-TESTS — Service specs with mocked Prisma -->
Each service has a dedicated spec file using Test.createTestingModule with
`{ provide: PrismaService, useValue: mockPrisma }` pattern:
- auth.service.spec.ts: register, login, bcrypt salt 12, JWT payload
- transaction.service.spec.ts: CRUD, state transitions, raw SQL
- dispute.service.spec.ts: CRUD, state transitions, NotFoundException

## Integration Testing
<!-- VERIFY:EM-INTEGRATION-TESTS — Supertest + AppModule tests -->
Integration tests use supertest with real AppModule and overridden PrismaService.
Tests verify ADMIN rejection, validation pipe enforcement, and endpoint routing.

## Accessibility Testing
<!-- VERIFY:EM-ACCESSIBILITY-TESTS — jest-axe with real components -->
Frontend components are tested with jest-axe to verify WCAG 2.1 AA compliance.
Tests cover Button, Input+Label, Card, Badge, and Nav components.

## Keyboard Navigation Testing
<!-- VERIFY:EM-KEYBOARD-TESTS — userEvent Tab/Enter/Space -->
Keyboard navigation tests use @testing-library/user-event to verify Tab focus
order, Enter/Space activation, Shift+Tab reverse navigation, and disabled
button exclusion from tab order.

## Seed Data Testing
<!-- VERIFY:EM-SEED-TRANSITIONS — Seed data with 2+ transitions -->
Seed data includes at least 2 state transitions:
1. Transaction PENDING -> FUNDED
2. Dispute OPEN -> UNDER_REVIEW -> RESOLVED

## Test Data Requirements
See DATA_MODEL.md for entity schemas and SYSTEM_ARCHITECTURE.md for database
configuration used in test environments.
