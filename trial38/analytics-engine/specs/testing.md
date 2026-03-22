# Testing Specification

## Trial 38 | Analytics Engine

### Overview

Comprehensive test suite with unit tests, integration tests (supertest),
security tests, and performance tests. All spec files are >= 55 lines.
Jest is the test runner for both API and web packages.

### VERIFY: AE-TEST-01 - Unit Test Structure

Unit tests mock dependencies and test services in isolation:

- `auth.service.spec.ts` - Registration, login, password hashing
- `dashboards.service.spec.ts` - Dashboard CRUD operations
- `pipelines.service.spec.ts` - Pipeline CRUD operations

Each test file uses `Test.createTestingModule()` with mocked PrismaService.

TRACED in: `apps/api/test/auth.service.spec.ts`

### VERIFY: AE-TEST-02 - Integration Tests

Integration tests use supertest against a running NestJS application:

- `auth.integration.spec.ts` - Register/login flows end-to-end
- `domain.integration.spec.ts` - Dashboard and pipeline CRUD flows

Tests create a test application with `NestFactory.create()` or
`Test.createTestingModule().compile()`.

TRACED in: `apps/api/test/auth.integration.spec.ts`

### VERIFY: AE-TEST-03 - Security Tests

`security.spec.ts` validates security hardening:

- Helmet headers present (X-Content-Type-Options, etc.)
- Validation rejects unknown properties
- Validation strips whitespace appropriately
- CSP headers are set correctly

TRACED in: `apps/api/test/security.spec.ts`

### VERIFY: AE-TEST-04 - Performance Tests

`performance.spec.ts` validates L7 performance requirements:

- Response time header (`X-Response-Time`) is present
- Pagination clamping works correctly (oversized values clamped)
- Cache-Control headers on list endpoints
- Response times within acceptable thresholds

TRACED in: `apps/api/test/performance.spec.ts`

### VERIFY: AE-TEST-05 - Frontend Component Tests

`components.spec.tsx` tests UI component accessibility:

- Uses `jest-axe` for automated accessibility checks
- Tests all 8 UI components render without violations
- Verifies ARIA attributes on interactive elements

TRACED in: `apps/web/__tests__/components.spec.tsx`

### VERIFY: AE-TEST-06 - Frontend Keyboard Tests

`keyboard.spec.tsx` tests keyboard navigation:

- Uses `@testing-library/user-event` for keyboard simulation
- Tests tab navigation between interactive elements
- Verifies focus management in error boundaries

TRACED in: `apps/web/__tests__/keyboard.spec.tsx`

### VERIFY: AE-TEST-07 - Frontend Page Tests

`pages.spec.tsx` tests page-level components:

- Nav component renders navigation links
- Links have correct href attributes
- Active state is displayed correctly

TRACED in: `apps/web/__tests__/pages.spec.tsx`

### VERIFY: AE-TEST-08 - Test Configuration

Jest configuration in each package:

- API: `ts-jest` transform, `node` test environment
- Web: `@testing-library/react`, `jest-environment-jsdom`
- Minimum 8 spec files across the project
- Each spec file >= 55 lines

TRACED in: `apps/api/package.json`
