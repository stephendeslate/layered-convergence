# API Contract -- Field Service Dispatch

## Overview

RESTful API with JWT bearer token authentication. All endpoints except auth require valid JWT.

## Authentication Endpoints

[VERIFY:API-001] POST /auth/register -- Creates new user account with DISPATCHER or TECHNICIAN role.
> Implementation: `backend/src/auth/auth.controller.ts`

[VERIFY:API-002] POST /auth/login -- Authenticates user and returns JWT access token.
> Implementation: `backend/src/auth/auth.controller.ts`

## Work Order Endpoints

[VERIFY:API-003] GET /work-orders, GET /work-orders/:id, POST /work-orders, PATCH /work-orders/:id/status -- Full CRUD with company-scoped access.
> Implementation: `backend/src/work-order/work-order.service.ts`, `backend/src/work-order/work-order.controller.ts`

[VERIFY:API-004] Work order endpoints protected by JwtAuthGuard with tenant isolation.
> Implementation: `backend/src/work-order/work-order.controller.ts`

## Technician Endpoints

[VERIFY:API-005] GET /technicians, GET /technicians/:id, POST /technicians -- Technician management with company-scoped access.
> Implementation: `backend/src/technician/technician.service.ts`, `backend/src/technician/technician.controller.ts`

## Route Endpoints

[VERIFY:API-006] GET /routes, GET /routes/:id, POST /routes, PATCH /routes/:id/status -- Route management with state machine transitions.
> Implementation: `backend/src/route/route.service.ts`, `backend/src/route/route.controller.ts`

## Invoice Endpoints

[VERIFY:API-007] GET /invoices, GET /invoices/:id, POST /invoices, PATCH /invoices/:id/status -- Invoice management with state machine transitions.
> Implementation: `backend/src/invoice/invoice.service.ts`, `backend/src/invoice/invoice.controller.ts`

## Customer Endpoints

[VERIFY:API-008] Customer CRUD with company-scoped access.
> Implementation: `backend/src/customer/customer.service.ts`

## GPS Event Endpoints

[VERIFY:API-009] GPS event recording with Float coordinates for technician location tracking.
> Implementation: `backend/src/gps-event/gps-event.service.ts`

## Cross-References

- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for JWT authentication details
- See [DATA_MODEL.md](./DATA_MODEL.md) for request/response schemas
