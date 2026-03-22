# Testing Specification

**Project:** Analytics Engine
**Prefix:** AE-TEST
**Cross-references:** [API](api.md), [Security](security.md)

---

## Overview

The test suite covers unit tests, integration tests, accessibility tests,
keyboard navigation tests, and performance tests across both API and Web apps.

---

## Requirements

### AE-TEST-01: Auth Service Unit Tests
- VERIFY:AE-TEST-01 — auth.service.spec.ts tests register, login with mocked Prisma and bcrypt
- Verifies ConflictException for duplicate emails
- Verifies UnauthorizedException for invalid credentials
- See [API](api.md) for auth endpoint specifications

### AE-TEST-02: Dashboard Service Unit Tests
- VERIFY:AE-TEST-02 — dashboards.service.spec.ts tests CRUD operations with mocked Prisma
- Verifies select usage for list, include usage for detail
- Verifies NotFoundException for missing dashboards

### AE-TEST-03: Pipeline Service Unit Tests
- VERIFY:AE-TEST-03 — pipelines.service.spec.ts tests CRUD operations with mocked Prisma
- Verifies status filtering in findAll
- Verifies NotFoundException for missing pipelines

### AE-TEST-04: Auth Integration Tests
- VERIFY:AE-TEST-04 — auth.integration.spec.ts uses supertest with real AppModule
- Tests health endpoint, ADMIN role rejection, missing field validation
- Tests forbidNonWhitelisted rejection

### AE-TEST-05: Domain Integration Tests
- VERIFY:AE-TEST-05 — domain.integration.spec.ts uses supertest for dashboard and pipeline endpoints
- Tests authentication requirement on all domain endpoints
- Tests unauthenticated CRUD attempts
- See [Security](security.md) for authentication requirements

### AE-TEST-06: Security Tests
- VERIFY:AE-TEST-06 — security.spec.ts uses supertest for HTTP security header verification
- Tests CSP header presence and directives
- Tests X-Content-Type-Options, X-Powered-By removal
- Tests input validation and authentication enforcement

### AE-TEST-07: Performance Tests
- VERIFY:AE-TEST-07 — performance.spec.ts tests response time constraints and pagination limits
- Verifies X-Response-Time header format
- Verifies MAX_PAGE_SIZE clamping behavior
- Tests edge cases: NaN, negative, fractional page params

### AE-TEST-08: Accessibility Tests
- VERIFY:AE-TEST-08 — components.spec.tsx runs jest-axe on all 8 UI components
- Tests Button, Badge, Card, Input, Label, Alert, Skeleton, Table
- Verifies zero accessibility violations per component

---

**SJD Labs, LLC** — Analytics Engine T39
