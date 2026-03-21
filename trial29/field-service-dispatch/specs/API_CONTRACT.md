# API Contract — Field Service Dispatch

## Overview
The Field Service Dispatch backend exposes REST endpoints for authentication,
work order management, and route operations. See DATA_MODEL.md for entity
definitions and SECURITY_MODEL.md for authentication requirements.

## Base URL
All endpoints are served from the backend at the configured PORT (default 4000).

## Authentication Endpoints

### POST /auth/register
<!-- VERIFY:FD-REGISTER-ENDPOINT — POST /auth/register with role restriction -->
Creates a new user account with role restriction.
Request body: `{ email, password, role, companyId }`
- `role` must be one of: DISPATCHER, TECHNICIAN, MANAGER (ADMIN excluded)
- `password` minimum 8 characters
- `email` must be valid email format
Response: `{ access_token: string }`

### POST /auth/login
<!-- VERIFY:FD-LOGIN-ENDPOINT — POST /auth/login with JWT -->
Authenticates a user and returns a JWT.
Request body: `{ email, password }`
Response: `{ access_token: string }`
Error: 401 Unauthorized for invalid credentials

### GET /auth/health
Returns service health status.
Response: `{ status: "ok" }`

## Work Order Endpoints

### GET /work-orders
<!-- VERIFY:FD-WORKORDERS-LIST — GET /work-orders with company filtering -->
Lists work orders filtered by company.
Query params: `companyId` (required)
Response: WorkOrder[]

### POST /work-orders
Creates a new work order in PENDING status.
Request body: `{ title, description, priority, customerId, companyId }`
Response: Created WorkOrder

### PATCH /work-orders/:id/transition
Transitions work order status following the state machine.
Request body: `{ status: string }`
Validates transitions: PENDING->ASSIGNED|CANCELLED, ASSIGNED->IN_PROGRESS|CANCELLED,
IN_PROGRESS->COMPLETED|CANCELLED

### PATCH /work-orders/:id/assign
Assigns a technician to a work order (transitions to ASSIGNED).
Request body: `{ technicianId: string }`
Response: Updated WorkOrder

### PATCH /work-orders/:id/complete
Marks a work order as COMPLETED with completion date.
Response: Updated WorkOrder with completedDate

## Route Endpoints

### GET /routes
Lists routes filtered by company.
Query params: `companyId` (required)
Response: Route[]

### POST /routes
Creates a new route for a technician.
Request body: `{ name, date, technicianId, companyId }`
Response: Created Route

### PATCH /routes/:id/transition
Transitions route status following the state machine.
Request body: `{ status: string }`
Validates transitions: PLANNED->ACTIVE, ACTIVE->COMPLETED

## CORS Configuration
<!-- VERIFY:FD-CORS-CONFIG — CORS from environment variable -->
CORS origin is configured from the CORS_ORIGIN environment variable.
No hardcoded fallback values. See SYSTEM_ARCHITECTURE.md for details.

## Error Handling
All validation errors return 400 with structured error messages.
Authentication failures return 401.
Not found errors return 404.
UI error handling is described in UI_SPECIFICATION.md.
