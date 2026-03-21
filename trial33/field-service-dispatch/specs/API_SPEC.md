# Field Service Dispatch — API Specification

## Overview

REST API endpoints for the Field Service Dispatch platform. All endpoints except
auth use JWT Bearer tokens. See AUTH_SPEC.md for authentication details
and DATA_MODEL.md for entity schemas.

## Base URL

`/` — all routes are relative to the API root.

## Authentication Endpoints

### POST /auth/register
- VERIFY: FD-API-REG-001 — Registration endpoint with email, password, role, tenantId
- Request body: { email, password (min 8), role, tenantId }
- Role validation: @IsIn excludes ADMIN (DISPATCHER, TECHNICIAN, CUSTOMER allowed)
- Response 201: { id, email, role }
- Response 400: validation error or invalid role
- Cross-references: AUTH_SPEC.md (role restrictions)

### POST /auth/login
- VERIFY: FD-API-LOGIN-001 — Login endpoint returning JWT access token
- Request body: { email: string, password: string }
- Response 200: { accessToken: string }
- Response 401: invalid credentials
- Cross-references: AUTH_SPEC.md (JWT configuration)

## Work Order Endpoints

### GET /work-orders
- VERIFY: FD-API-WO-LIST-001 — List work orders with pagination
- Query params: page (default 1), pageSize (default 20, max 100)
- Response 200: PaginatedResult<WorkOrder> with technician and location
- Requires: JWT Bearer token
- Cross-references: DATA_MODEL.md (WorkOrder), REQUIREMENTS.md (FR-2)

### GET /work-orders/:id
- VERIFY: FD-API-WO-GET-001 — Get single work order with notes
- Response 200: WorkOrder with technician, location, notes
- Response 404: not found
- Uses findFirst scoped by tenantId for RLS alignment

### PATCH /work-orders/:id/transition
- VERIFY: FD-API-WO-TRANS-001 — Transition work order status
- Request body: { status: WorkOrderStatus }
- Creates WorkOrderTransition record
- Response 200: updated work order
- Response 400: invalid state transition
- Cross-references: STATE_MACHINES.md (WorkOrderStatus transitions)

## Technician Endpoints

### GET /technicians
- VERIFY: FD-API-TECH-LIST-001 — List all technician profiles
- Response 200: TechnicianProfile[] with user email
- Cross-references: DATA_MODEL.md (TechnicianProfile)

### GET /technicians/available
- VERIFY: FD-API-TECH-AVAIL-001 — List available technicians only
- Filters by availability = AVAILABLE
- Cross-references: REQUIREMENTS.md (FR-3)

### PATCH /technicians/:id/availability
- VERIFY: FD-API-TECH-UPDATE-001 — Update technician availability
- Request body: { availability: AvailabilityStatus }
- Response 200: updated profile
- Response 404: profile not found

## Cross-References

- AUTH_SPEC.md: JWT configuration and role-based access
- DATA_MODEL.md: Entity schemas and relationships
- STATE_MACHINES.md: Valid work order status transitions
- TESTING_STRATEGY.md: Integration test coverage for endpoints
