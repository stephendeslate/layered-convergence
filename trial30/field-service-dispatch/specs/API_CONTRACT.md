# API Contract — Field Service Dispatch

## Overview
This document defines the HTTP API endpoints for Field Service Dispatch.
See SYSTEM_ARCHITECTURE.md for architectural context, SECURITY_MODEL.md
for authentication details, and DATA_MODEL.md for entity definitions.

## Base URL
All endpoints are served from the backend at port 4000 by default.
CORS is configured from the CORS_ORIGIN environment variable.

## Authentication Endpoints

### GET /auth/health
Returns service health status.
- Response: `{ "status": "ok" }`
- No authentication required

<!-- VERIFY:FSD-REGISTER-ENDPOINT — POST /auth/register with role restriction -->
### POST /auth/register
Creates a new user account. ADMIN role is excluded from self-registration.
- Request body: `{ email, password, role }`
- Role must be one of: TECHNICIAN, DISPATCHER, MANAGER
- Validation: @IsEmail, @MinLength(8), @IsIn(['TECHNICIAN', 'DISPATCHER', 'MANAGER'])
- Response: `{ access_token: string }`
- Errors: 400 if validation fails (invalid email, short password, ADMIN role)

<!-- VERIFY:FSD-LOGIN-ENDPOINT — POST /auth/login with JWT -->
### POST /auth/login
Authenticates a user and returns a JWT token.
- Request body: `{ email, password }`
- Validation: @IsEmail, @MinLength(8)
- Response: `{ access_token: string }`
- Errors: 401 if credentials are invalid

## Work Order Endpoints

<!-- VERIFY:FSD-WORKORDERS-LIST — GET /work-orders with technician filtering -->
### GET /work-orders
Lists all work orders, optionally filtered by technician.
- Query params: `technicianId` (optional)
- Response: Array of work orders with customer relation
- Ordered by createdAt descending

### GET /work-orders/:id
Returns a single work order with all relations.
- Response: Work order with customer, technician, equipment
- Errors: 404 if not found

### POST /work-orders
Creates a new work order with OPEN status.
- Request body: `{ title, description, priority, estimatedCost?, customerId, serviceAreaId? }`
- Response: Created work order

### PATCH /work-orders/:id/status
Transitions a work order to a new status.
- Request body: `{ status, technicianId?, actualCost? }`
- Valid transitions enforced server-side (see PRODUCT_VISION.md)
- Errors: 400 if transition is invalid or work order not found

## Schedule Endpoints

### GET /schedules
Lists all schedules, optionally filtered by technician.
- Query params: `technicianId` (optional)
- Response: Array of schedules with technician relation

### GET /schedules/:id
Returns a single schedule with technician.
- Errors: 404 if not found

### POST /schedules
Creates a new schedule entry.
- Request body: `{ dayOfWeek, startTime, endTime, technicianId }`

### DELETE /schedules/:id
Deletes a schedule entry.
- Errors: 404 if not found

<!-- VERIFY:FSD-CORS-CONFIG — CORS from environment variable -->
## CORS Configuration
CORS origin is configured from the CORS_ORIGIN environment variable.
No hardcoded origins are used. See SECURITY_MODEL.md for details.
