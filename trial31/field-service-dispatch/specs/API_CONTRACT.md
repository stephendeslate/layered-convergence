# API Contract — Field Service Dispatch

## Authentication Endpoints

### POST /auth/register
Creates a new user account. Returns JWT access token.
- Request: `{ email, password, role, companyId }`
- Role must be one of: DISPATCHER, TECHNICIAN, MANAGER (ADMIN excluded via @IsIn validator)
- Password minimum length: 8 characters
<!-- VERIFY:FD-REGISTER-ENDPOINT -->

### POST /auth/login
Authenticates existing user. Returns JWT access token.
- Request: `{ email, password }`
- Uses findFirst for future multi-company login scoping
<!-- VERIFY:FD-LOGIN-ENDPOINT -->

### GET /auth/health
Health check endpoint returning `{ status: "ok" }`.

## Work Order Endpoints

### GET /work-orders
Lists work orders for a company. Accepts `companyId` query parameter.
Includes customer and technician relations.
<!-- VERIFY:FD-WORKORDERS-LIST -->

### GET /work-orders/:id
Retrieves a single work order with all relations (customer, technician, route, invoices).

### PATCH /work-orders/:id/status
Transitions work order status. Validates against state machine.
- Request: `{ status }`
- Returns BadRequestException for invalid transitions

### PATCH /work-orders/:id/assign
Assigns a technician and transitions to ASSIGNED status.
- Request: `{ technicianId }`
- Only allowed when status is PENDING

## Invoice Endpoints

### GET /invoices
Lists invoices for a company with customer and work order relations.

### PATCH /invoices/:id/status
Transitions invoice status with state machine validation.
Sets `paidAt` automatically when transitioning to PAID.

## CORS Configuration
CORS origin is configured from `CORS_ORIGIN` environment variable. No hardcoded origins.
<!-- VERIFY:FD-CORS-CONFIG -->

## Cross-References
- See SYSTEM_ARCHITECTURE.md for validation and pipeline configuration
- See SECURITY_MODEL.md for authentication and authorization details
