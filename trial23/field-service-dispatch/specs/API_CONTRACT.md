# API Contract — Field Service Dispatch

## Overview

RESTful API served by NestJS 11 on port 3000. All endpoints except auth
require a valid JWT Bearer token. Company scoping is automatic via RLS.

See: SECURITY_MODEL.md, DATA_MODEL.md

## Authentication

### POST /auth/register
Register a new user. ADMIN role is rejected.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "DISPATCHER",
  "companyId": "uuid"
}
```

**Validation:**
- `role` must be `@IsIn(['DISPATCHER', 'TECHNICIAN'])` — ADMIN rejected

## VERIFY:REGISTER_NO_ADMIN — Registration DTO rejects ADMIN role via @IsIn validator

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "DISPATCHER"
}
```

### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "access_token": "jwt-token"
}
```

## Work Orders

### GET /work-orders
List work orders for the authenticated company.

### POST /work-orders
Create a new work order (status defaults to OPEN).

### GET /work-orders/:id
Get a single work order by ID.

### PATCH /work-orders/:id
Update work order fields.

### PATCH /work-orders/:id/transition
Transition work order status. Returns 409 if transition is invalid.

## VERIFY:WO_TRANSITION_ENDPOINT — PATCH /work-orders/:id/transition endpoint exists

**Request:**
```json
{
  "status": "ASSIGNED",
  "technicianId": "uuid"
}
```

## Customers

### GET /customers
### POST /customers
### GET /customers/:id
### PATCH /customers/:id
### DELETE /customers/:id

## Technicians

### GET /technicians
### POST /technicians
### GET /technicians/:id
### PATCH /technicians/:id
### DELETE /technicians/:id

## Invoices

### GET /invoices
### POST /invoices
### GET /invoices/:id
### PATCH /invoices/:id/transition

## VERIFY:INV_TRANSITION_ENDPOINT — Invoice transition endpoint exists

**Valid transitions:** DRAFT→SENT, SENT→PAID, any→VOID

## Routes

### GET /routes
### POST /routes
### GET /routes/:id
### PATCH /routes/:id
### DELETE /routes/:id

## GPS Events

### GET /gps-events
### POST /gps-events
### GET /gps-events/:id

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized (missing/invalid JWT) |
| 403 | Forbidden (insufficient role) |
| 404 | Not found |
| 409 | Conflict (invalid state transition) |

## VERIFY:FINDFIRST_JUSTIFIED — Every findFirst call has a justification comment

## Request Headers

All authenticated endpoints require:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

See: SYSTEM_ARCHITECTURE.md, TESTING_STRATEGY.md
