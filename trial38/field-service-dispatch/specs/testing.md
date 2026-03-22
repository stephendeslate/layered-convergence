# Testing Specification

## Overview

The testing strategy covers unit tests, integration tests, accessibility
tests, and keyboard interaction tests across both the API and web
applications.

## API Unit Tests

<!-- VERIFY: FD-TEST-001 — Auth service unit tests -->
<!-- VERIFY: FD-TEST-002 — Work orders service unit tests -->
<!-- VERIFY: FD-TEST-003 — Technicians service unit tests -->

### Auth Service Tests (7 tests)

- Registers a new user with hashed password
- Rejects duplicate email within same tenant
- Authenticates with valid credentials
- Rejects invalid password
- Rejects non-existent user
- Rejects ADMIN role registration
- Returns user profile for valid JWT payload

### Work Orders Service Tests (7 tests)

- Creates a work order with valid data
- Lists work orders with pagination
- Finds a work order by ID with schedules
- Updates work order fields
- Transitions work order status (valid transition)
- Rejects invalid status transition
- Removes a work order

### Technicians Service Tests (8 tests)

- Creates a technician with generated ID
- Lists technicians with pagination
- Finds a technician by ID with schedules
- Updates technician fields
- Updates technician status
- Sanitizes technician name input
- Removes a technician
- Rejects creation with missing required fields

## API Integration Tests

<!-- VERIFY: FD-TEST-004 — Auth integration tests with supertest -->
<!-- VERIFY: FD-TEST-005 — Domain integration tests with supertest -->

### Auth Integration (5 tests)

Uses supertest to test the full HTTP request/response cycle:
- POST /auth/register returns 201 with access_token
- POST /auth/register rejects invalid role
- POST /auth/login returns 200 with access_token
- POST /auth/login rejects wrong password
- GET /auth/me returns 401 without token

### Domain Integration (8 tests)

Tests work orders and technicians endpoints:
- GET /work-orders returns paginated list
- POST /work-orders creates a work order
- GET /work-orders/:id returns single work order
- PATCH /work-orders/:id/status transitions status
- DELETE /work-orders/:id removes a work order
- GET /technicians returns paginated list
- POST /technicians creates a technician
- DELETE /technicians/:id removes a technician

## Security Tests

<!-- VERIFY: FD-TEST-006 — Security tests for Helmet, rate limiting, input validation -->

Tests verify:
- Helmet headers are present in responses
- ValidationPipe rejects invalid input
- sanitizeInput strips HTML tags
- maskSensitive hides sensitive data
- slugify generates valid URL slugs
- truncateText respects max length
- clampPageSize clamps values correctly

## Performance Tests

<!-- VERIFY: FD-TEST-009 — Performance tests for response time and pagination -->

Tests verify:
- Response time interceptor logs duration
- Pagination respects MAX_PAGE_SIZE limit
- measureDuration returns result and durationMs
- Cache-Control headers present on list endpoints

## Frontend Tests

<!-- VERIFY: FD-TEST-UI-001 — Component accessibility tests with jest-axe -->
<!-- VERIFY: FD-TEST-UI-002 — Keyboard interaction tests with userEvent -->
<!-- VERIFY: FD-TEST-UI-003 — Page rendering tests for all routes -->

### Component Accessibility Tests (10 tests)

Uses jest-axe to verify WCAG compliance:
- Button has no violations
- All button variants pass
- Badge renders correctly
- Card composition passes
- Input with Label passes
- Alert with role="alert" passes
- Skeleton renders with animation
- Table passes
- Disabled button is not clickable

### Keyboard Interaction Tests (8 tests)

Uses userEvent to test keyboard navigation:
- Button focusable via Tab
- Button fires on Enter
- Button fires on Space
- Disabled button skipped in tab order
- Input accepts keyboard input
- Input clears on select-all + delete
- Label click focuses associated input
- Tab order follows DOM order

### Page Rendering Tests (15 tests)

Verifies all page components render correctly:
- Home page heading, stats, latest work order
- Work orders page heading, table, status badges
- Technicians page heading, names, specialties
- Navigation links, hrefs, accessible landmark
- Loading states with aria-busy and role="status"

## Cross-References

- [Security Specification](./security.md) — Security test coverage for Helmet, throttling, validation
