# API Contract: Field Service Dispatch

## Overview

The Field Service Dispatch API provides REST endpoints for work order
management, route tracking, GPS events, and invoicing.

## Authentication Endpoints

### POST /auth/register
[VERIFY:FD-023] Registration validates role with @IsIn allowing only
DISPATCHER and TECHNICIAN. ADMIN role is explicitly excluded.

Request: `{ name, email, password, role, companyId }`
Response: `{ accessToken, user: { id, email, role } }`
Errors: 400 (validation), 409 (duplicate)

### POST /auth/login
Request: `{ email, password }`
Response: `{ accessToken, user: { id, email, role } }`
Error: 401 (invalid credentials)

## Work Order Endpoints

### POST /work-orders
[VERIFY:FD-024] Creates a new work order in CREATED status.
Requires title, customerId, companyId.

### POST /work-orders/:id/assign
[VERIFY:FD-025] Assigns a technician and transitions to ASSIGNED.
Only allowed from CREATED status.

### POST /work-orders/:id/transition
Transitions work order status following state machine rules.

### GET /work-orders/company/:companyId
Returns all work orders for a company with customer and technician details.

## Route Endpoints

### POST /routes
Creates a new route in PLANNED status for a technician.

### POST /routes/:id/transition
Transitions route status following state machine rules.

### POST /routes/gps
[VERIFY:FD-026] Records a GPS event with technician location data.

## Invoice Endpoints

### POST /invoices
Creates a new invoice in DRAFT status with amount, tax, and total.

### POST /invoices/:id/transition
[VERIFY:FD-027] Transitions invoice status through DRAFT -> SENT -> PAID/OVERDUE.

### GET /invoices/company/:companyId
Returns all invoices for a company with customer details.

## Input Validation

[VERIFY:FD-028] ValidationPipe with whitelist and forbidNonWhitelisted
strips unknown properties on all endpoints.

## Cross-References

- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for JWT authentication
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity definitions
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for endpoint test coverage
