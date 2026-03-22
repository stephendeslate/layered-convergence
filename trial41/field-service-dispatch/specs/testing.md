# Testing Specification

## Overview

The FSD platform maintains a comprehensive test suite covering unit tests,
integration tests, security tests, performance tests, monitoring tests,
accessibility tests, and keyboard navigation tests.

See [security.md](./security.md) for security test coverage.
See [monitoring.md](./monitoring.md) for monitoring test coverage.

## Backend Unit Tests (3+)

### auth.spec.ts
Tests AuthService: user registration with hashed passwords,
login with valid/invalid credentials, token generation.

<!-- VERIFY: FD-AUTH-UNIT-TEST — apps/api/test/auth.spec.ts tests AuthService -->

### work-order.spec.ts
Tests WorkOrderService: create, findAll with pagination clamping,
findOne with NotFoundException.

<!-- VERIFY: FD-WORK-ORDER-UNIT-TEST — apps/api/test/work-order.spec.ts tests WorkOrderService -->

### technician.spec.ts
Tests TechnicianService: create, findAll, findOne with NotFoundException.

<!-- VERIFY: FD-TECHNICIAN-UNIT-TEST — apps/api/test/technician.spec.ts tests TechnicianService -->

## Integration Tests (2+ with supertest)

### security.spec.ts
Supertest integration tests against real AppModule:
- Security headers from Helmet
- Rate limiting enforcement
- Authentication rejection for protected endpoints
- Input validation for invalid roles and extra fields

### monitoring.spec.ts (FM#95 fix)
Supertest integration tests against real AppModule:
- GET /health returns required fields
- GET /metrics returns operational metrics
- Correlation ID propagation (client-sent and generated)
- Error sanitization (no stack traces, correlation ID in error response)
- Request context service propagation (T41 variation)

## Performance Tests

### performance.spec.ts
Tests response time header presence, pagination clamping via
normalizePageParams, Cache-Control header behavior.

## Frontend Tests

### accessibility.spec.tsx
Jest-axe tests on real components:
- Button, Card, Input+Label, Alert, Badge
- All must pass axe accessibility audit

<!-- VERIFY: FD-ACCESSIBILITY-TEST — apps/web/test/accessibility.spec.tsx uses jest-axe -->

### keyboard.spec.tsx
UserEvent keyboard navigation tests:
- Tab focus on buttons
- Enter/Space key triggers
- Input typing
- Tab navigation between elements
- Disabled element skip

<!-- VERIFY: FD-KEYBOARD-TEST — apps/web/test/keyboard.spec.tsx uses userEvent -->

## Loading States

All routes include loading.tsx with role="status" and aria-busy="true".

<!-- VERIFY: FD-ROOT-LOADING — apps/web/src/app/loading.tsx has role="status" and aria-busy="true" -->
<!-- VERIFY: FD-DASHBOARD-LOADING — apps/web/src/app/dashboard/loading.tsx has role="status" and aria-busy="true" -->

## Error States

All routes include error.tsx with role="alert", useRef, and focus management.

<!-- VERIFY: FD-ROOT-ERROR — apps/web/src/app/error.tsx has role="alert" and useRef focus -->

## shadcn/ui Components

8+ components in apps/web/components/ui/:
Button, Card, Input, Label, Badge, Table, Skeleton, Alert

<!-- VERIFY: FD-BUTTON-COMPONENT — apps/web/components/ui/button.tsx uses cn() with variants -->
