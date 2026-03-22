# Testing Specification

## Overview

The testing strategy covers unit tests for services, integration tests for
API endpoints, accessibility tests for UI components, and keyboard navigation
tests. All spec files are at least 55 lines.

## Unit Tests

### Auth Service Tests
Test registration (password hashing, token generation), login (credential
verification), and error cases (duplicate email, wrong password).

[VERIFY: AE-TEST-01] auth.service.spec.ts tests password hashing with
bcrypt during registration.

[VERIFY: AE-TEST-02] auth.service.spec.ts tests JWT token generation
on successful login.

### Dashboard Service Tests
Test CRUD operations with tenant isolation, slug generation, and pagination.

[VERIFY: AE-TEST-03] dashboards.service.spec.ts tests that slugify is
called when creating a dashboard.

### Pipeline Service Tests
Test CRUD operations with tenant isolation, status transitions, and filtering.

[VERIFY: AE-TEST-04] pipelines.service.spec.ts tests pipeline creation
with proper tenant assignment.

## Integration Tests

Integration tests use supertest to make actual HTTP requests to the
running NestJS application.

[VERIFY: AE-TEST-05] auth.integration.spec.ts uses supertest to test
the POST /auth/register endpoint.

[VERIFY: AE-TEST-06] domain.integration.spec.ts uses supertest to test
dashboard and pipeline CRUD endpoints.

## Frontend Tests

### Accessibility Tests
Components are tested for accessibility compliance using jest-axe.

[VERIFY: AE-TEST-07] components.spec.tsx runs axe accessibility checks
on rendered UI components.

### Keyboard Navigation Tests
Interactive components are tested for keyboard accessibility using userEvent.

[VERIFY: AE-TEST-08] keyboard.spec.tsx tests keyboard navigation using
userEvent.tab() and userEvent.keyboard().
