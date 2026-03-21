# Testing Strategy — Field Service Dispatch

## Backend Testing

### Unit Tests
Service-level tests use Jest with mocked PrismaService and JwtService. Each domain module has its own spec file:
- `auth.service.spec.ts`: 5 tests (register hash, JWT payload, login valid, missing user, wrong password)
- `work-order.service.spec.ts`: 7 tests (findAll, findById not found, transitions valid/invalid, count raw, cancel overdue)
- `invoice.service.spec.ts`: 7 tests (findAll, findById not found, transitions valid/invalid, revenue raw, null revenue)
<!-- VERIFY:FD-UNIT-TESTS -->

### Integration Tests
`integration.spec.ts` uses supertest with AppModule and overridden PrismaService. Tests cover:
- Health endpoint
- ADMIN role rejection in registration
- Invalid email/password validation
- Invalid login body
- Work order, invoice, and route list endpoints
<!-- VERIFY:FD-INTEGRATION-TESTS -->

## Frontend Testing

### Accessibility Tests
`accessibility.test.tsx` uses jest-axe with real component rendering. 7 tests cover:
- Button, Input+Label, Card, Badge, Nav components
- Loading state aria attributes
- Error state role attribute
<!-- VERIFY:FD-ACCESSIBILITY-TESTS -->

### Keyboard Navigation Tests
`keyboard-navigation.test.tsx` uses @testing-library/user-event. 5 tests cover:
- Tab focus progression
- Enter key activation
- Space key activation
- Shift+Tab reverse navigation
- Disabled button skip behavior
<!-- VERIFY:FD-KEYBOARD-TESTS -->

## Seed Data

### State Transitions
Seed data demonstrates complete state machine transitions:
- Work Order 1: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED (success path)
- Work Order 2: PENDING -> ASSIGNED -> CANCELLED (T31 error/failure state)
- Invoice 1: DRAFT -> SENT -> PAID (success path)
- Invoice 2: DRAFT -> SENT -> OVERDUE (T31 error/failure state)
- Route: PLANNED -> ACTIVE
<!-- VERIFY:FD-SEED-TRANSITIONS -->

## Test Infrastructure

### Backend Test Configuration
Backend tests use ts-jest with node test environment. Jest is configured with `rootDir: src` and
`testRegex: .*\\.spec\\.ts$`. Coverage collection excludes `main.ts` to focus on testable logic.

### Frontend Test Configuration
Frontend tests use jest-environment-jsdom with ts-jest transform. Module path aliases (`@/*`) are
mapped via `moduleNameMapper` to support the same import paths used in production code.

## Cross-References
- See SECURITY_MODEL.md for security testing requirements
- See UI_SPECIFICATION.md for accessibility testing patterns
