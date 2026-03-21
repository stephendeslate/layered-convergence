# API Contract — Field Service Dispatch

## Overview

The FSD backend exposes a RESTful API over HTTP. All endpoints except authentication
require a valid JWT Bearer token. Responses use standard HTTP status codes. Request
bodies are validated by NestJS `ValidationPipe` with `whitelist` and `forbidNonWhitelisted`.

## Base URL

```
http://localhost:3000
```

## Authentication

All protected endpoints require the `Authorization: Bearer <token>` header.
Tokens are obtained via `POST /auth/login` and contain the user's `sub`, `email`,
`role`, and `companyId` claims.

## Endpoints

### Auth Module

#### POST /auth/register

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "DISPATCHER",
  "companyId": "uuid"
}
```

**Response:** `201 Created` — returns the created user (without password hash).

**Validation:** email must be valid, password min 8 chars, role must be DISPATCHER or TECHNICIAN.

#### POST /auth/login

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK` — `{ "access_token": "jwt..." }`

**Error:** `401 Unauthorized` on invalid credentials.

### Work Orders

#### GET /work-orders
Returns all work orders for the authenticated user's company.
Includes related `customer` and `technician` data.

#### GET /work-orders/:id
Returns a single work order by ID, scoped to the user's company.
**Error:** `404 Not Found` if not found.

#### POST /work-orders
Creates a new work order with `OPEN` status.

#### PATCH /work-orders/:id/transition
Transitions a work order to a new status.
**Request Body:** `{ "status": "ASSIGNED" }`
**Error:** `409 Conflict` on invalid transition.

### Customers

#### GET /customers
Returns all customers for the authenticated user's company.

#### GET /customers/:id
Returns a single customer. **Error:** `404 Not Found` if not found.

#### POST /customers
Creates a new customer.

#### PATCH /customers/:id
Updates a customer.

#### DELETE /customers/:id
Deletes a customer.

### Technicians

#### GET /technicians
Returns all technicians for the authenticated user's company.

#### GET /technicians/:id
Returns a single technician. **Error:** `404 Not Found` if not found.

#### POST /technicians
Creates a new technician.

#### PATCH /technicians/:id
Updates a technician.

#### DELETE /technicians/:id
Deletes a technician.

### Invoices

#### GET /invoices
Returns all invoices for the authenticated user's company.

#### GET /invoices/:id
Returns a single invoice. **Error:** `404 Not Found` if not found.

#### POST /invoices
Creates a new invoice with `DRAFT` status.

#### PATCH /invoices/:id/transition
Transitions an invoice to a new status.
**Error:** `409 Conflict` on invalid transition.

### Routes

#### GET /routes
Returns all routes for the authenticated user's company.

#### GET /routes/:id
Returns a single route. **Error:** `404 Not Found` if not found.

#### POST /routes
Creates a new route with `PLANNED` status.

#### PATCH /routes/:id/transition
Transitions a route to a new status.
**Error:** `409 Conflict` on invalid transition.

### GPS Events

#### GET /gps-events
Returns all GPS events for the authenticated user's company.

#### GET /gps-events/:id
Returns a single GPS event. **Error:** `404 Not Found` if not found.

#### POST /gps-events
Creates a new GPS event.

#### GET /gps-events/technician/:technicianId
Returns GPS events for a specific technician.

## Error Responses

All error responses follow the NestJS format:

```json
{
  "statusCode": 404,
  "message": "Work order not found",
  "error": "Not Found"
}
```

## Verified API Requirements

[VERIFY:API-001] RegisterDto MUST validate email, password (min 8 chars), role, and companyId.
> Implementation: `backend/src/auth/dto/register.dto.ts`

[VERIFY:API-002] LoginDto MUST validate email and password fields.
> Implementation: `backend/src/auth/dto/login.dto.ts`

[VERIFY:API-003] Auth controller MUST expose POST /auth/register and POST /auth/login.
> Implementation: `backend/src/auth/auth.controller.ts`

[VERIFY:API-004] CreateWorkOrderDto MUST validate title, description, priority,
scheduledDate, customerId, and technicianId fields.
> Implementation: `backend/src/work-order/dto/create-work-order.dto.ts`

[VERIFY:API-005] Invalid state transitions MUST return HTTP 409 Conflict.
> Implementation: `backend/src/work-order/work-order.service.ts`

[VERIFY:API-006] Work order transition endpoint MUST be PATCH /work-orders/:id/transition.
> Implementation: `backend/src/work-order/work-order.controller.ts`

[VERIFY:API-007] Customer CRUD MUST be scoped to the authenticated user's company.
> Implementation: `backend/src/customer/customer.service.ts`

[VERIFY:API-008] Technician CRUD MUST be scoped to the authenticated user's company.
> Implementation: `backend/src/technician/technician.service.ts`

[VERIFY:API-009] Invoice CRUD and transition endpoints MUST be company-scoped.
> Implementation: `backend/src/invoice/invoice.service.ts`

[VERIFY:API-010] Route CRUD and transition endpoints MUST be company-scoped.
> Implementation: `backend/src/route/route.controller.ts`

[VERIFY:API-011] GpsEvent CRUD MUST be company-scoped with technician filter support.
> Implementation: `backend/src/gps-event/gps-event.service.ts`

## Cross-References

- See [DATA_MODEL.md](./DATA_MODEL.md) for entity field definitions.
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication and authorization details.
- See [UI_SPECIFICATION.md](./UI_SPECIFICATION.md) for how these endpoints are consumed by the frontend.
