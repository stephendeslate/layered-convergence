# API Specification

## Overview

The FSD API is a RESTful service built with NestJS 11. It provides CRUD
operations for all domain entities with JWT authentication, multi-tenant
isolation, and comprehensive input validation.

See [security.md](./security.md) for authentication and authorization details.
See [data-model.md](./data-model.md) for entity schemas.

## Authentication Endpoints

### POST /auth/register
Create a new user account. Role restricted to non-ADMIN values.
Rate limited: 5 requests per 60 seconds.

### POST /auth/login
Authenticate and receive JWT access token.
Rate limited: 5 requests per 60 seconds.

### GET /auth/profile
Returns authenticated user profile. Requires JWT.

## Work Order Endpoints

### POST /work-orders
Create a new work order. Requires authentication.

### GET /work-orders
List work orders with pagination. Clamped to MAX_PAGE_SIZE.
Cache-Control: private, max-age=30.

### GET /work-orders/:id
Get work order details with technician include.

### PUT /work-orders/:id
Update work order fields.

### DELETE /work-orders/:id
Delete a work order.

## Technician Endpoints

### POST /technicians
Create a new technician.

### GET /technicians
List technicians with pagination.
Cache-Control: private, max-age=30.

### GET /technicians/:id
Get technician details with work order associations.

### PUT /technicians/:id
Update technician fields.

### DELETE /technicians/:id
Delete a technician.

## Schedule Endpoints

Full CRUD at /schedules with the same patterns as above.

## Service Area Endpoints

Full CRUD at /service-areas with the same patterns as above.
Cache-Control: private, max-age=60 on list endpoint.

## Health Endpoints

### GET /health
Basic health check. No authentication required.

### GET /health/ready
Database readiness check. No authentication required.

### GET /metrics
Operational metrics. In-memory only.

## Server Actions

Frontend uses Next.js Server Actions for API communication:
- getWorkOrders, getTechnicians, getSchedules, getServiceAreas
- login, reportError, getAppVersion

<!-- VERIFY: FD-SERVER-ACTIONS — apps/web/lib/actions.ts implements server actions with response.ok checks -->

## Error Response Format

All errors return standardized JSON:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2026-03-21T00:00:00.000Z",
  "correlationId": "uuid"
}
```
