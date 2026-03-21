# API Contract — Field Service Dispatch

## Authentication Endpoints

### POST /auth/register
Creates a new user account.
Request body: { email, password, name, role }.
Role restricted to DISPATCHER, TECHNICIAN, MANAGER via @IsIn validator.
ADMIN role excluded from self-registration.
Returns: { id, email, role }.
<!-- VERIFY:FD-REGISTER-ENDPOINT — POST /auth/register with restriction -->

### POST /auth/login
Authenticates a user and returns a JWT token.
Request body: { email, password }.
Returns: { accessToken }.
Token expires after 24 hours.
<!-- VERIFY:FD-LOGIN-ENDPOINT — POST /auth/login with JWT -->

### GET /auth/health
Health check endpoint for container orchestration.
Returns: { status: "ok" }.

## Work Order Endpoints

### GET /work-orders
Returns all work orders with customer and technician relations.
Supports pagination and filtering by status.
<!-- VERIFY:FD-WORKORDERS-LIST — GET /work-orders endpoint -->

### GET /work-orders/:id
Returns a single work order with full relations.
Includes customer, technician, route, and invoice data.

### PATCH /work-orders/:id/assign
Assigns a technician to a work order.
Request body: { technicianId }.
Uses $executeRaw for atomic status transition.

### PATCH /work-orders/:id/complete
Marks a work order as completed.
Sets completedAt timestamp atomically.

### GET /work-orders/stats
Returns work order counts grouped by status.

## Invoice Endpoints

### GET /invoices
Returns all invoices with customer and work order relations.
Supports filtering by status via query parameter.

### GET /invoices/:id
Returns a single invoice with full relations.

## CORS Configuration
CORS origin loaded from CORS_ORIGIN environment variable.
Validated at startup with fail-fast behavior.
<!-- VERIFY:FD-CORS-CONFIG — CORS from env variable -->

## Error Handling
All validation errors return 400 with structured error messages.
Authentication failures return 401 Unauthorized.
Unknown properties in request bodies are rejected.
