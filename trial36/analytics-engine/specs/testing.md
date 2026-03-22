# Testing Specification

## Overview

Comprehensive testing strategy covering unit tests, integration tests,
security tests, component accessibility tests, and keyboard navigation tests.

## Test Structure

### API Tests (apps/api/test/)

#### Unit Tests (3 files)

1. **auth.service.spec.ts**: Tests AuthService methods
   - Registration: success, tenant not found, email conflict, invalid role, XSS sanitization
   - Login: valid credentials, non-existent user, wrong password
   - Validate: user found, user not found

2. **dashboards.service.spec.ts**: Tests DashboardsService methods
   - findAll: pagination, MAX_PAGE_SIZE cap
   - findOne: found, not found
   - create: sanitized input
   - update: existing dashboard
   - remove: existing dashboard

3. **pipelines.service.spec.ts**: Tests PipelinesService methods
   - findAll: pagination, MAX_PAGE_SIZE cap
   - findOne: found, not found
   - create: sanitized name
   - updateStatus: valid transitions, invalid transitions, FAILED->ACTIVE
   - remove: existing pipeline

#### Integration Tests (2 files)

4. **auth.integration.spec.ts**: Tests auth endpoints against real AppModule
   - Registration validation (missing fields, invalid email, short password, ADMIN role)
   - Login validation (missing credentials)
   - /auth/me protection (unauthenticated, invalid token)

5. **domain.integration.spec.ts**: Tests domain endpoints authentication
   - Dashboards: GET, POST, GET/:id, DELETE require auth
   - Pipelines: GET, POST, PATCH/:id/status, DELETE require auth

#### Security Tests (1 file)

6. **security.spec.ts**: Tests security controls
   - Helmet headers (CSP, X-Content-Type-Options, X-Frame-Options, X-Powered-By removal)
   - Rate limiting (rate limit headers present)
   - Input validation (oversized email, name, password; short password; unknown properties)
   - CORS (allowed origin headers)

### Frontend Tests (apps/web/__tests__/)

7. **components.spec.tsx**: jest-axe accessibility tests on all 8 UI components
   - Button, Badge, Card, Input, Label, Alert, Skeleton, Table

8. **keyboard.spec.tsx**: userEvent keyboard navigation
   - Tab to focus Button and Input
   - Enter and Space to activate Button
   - Type in Input after Tab focus
   - Tab between multiple focusable elements

9. **pages.spec.tsx**: Page rendering tests
   - HomePage renders heading, feature cards, links, badges

## Test Configuration

### API (jest.config.ts)
- Transform: ts-jest
- Environment: node
- Module mapping: @analytics-engine/shared -> packages/shared/src/index.ts
- Test regex: *.spec.ts

### Frontend
- Environment: jsdom
- Libraries: @testing-library/react, @testing-library/user-event, jest-axe
- Mock: next/link

## VERIFY Tags

- `AE-TEST-001`: Unit tests for all 3 services <!-- VERIFY: AE-TEST-001 -->
- `AE-TEST-002`: Integration tests import real AppModule <!-- VERIFY: AE-TEST-002 -->
- `AE-TEST-003`: Security tests verify Helmet, rate limiting, input validation <!-- VERIFY: AE-TEST-003 -->
- `AE-TEST-004`: jest-axe accessibility tests on all 8 components <!-- VERIFY: AE-TEST-004 -->
- `AE-TEST-005`: Keyboard navigation tests with userEvent <!-- VERIFY: AE-TEST-005 -->
