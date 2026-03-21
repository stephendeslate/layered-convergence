# API Contract: Field Service Dispatch

## Overview

The API follows REST conventions with JSON request/response bodies.
Authentication endpoints are public; all other endpoints require JWT.

## Authentication Endpoints

[VERIFY:FD-021] POST /auth/register accepts email, password, name, role,
and companyId. Role is validated via @IsIn to allow only DISPATCHER,
TECHNICIAN, and MANAGER — ADMIN is rejected with a 400 response.
Returns user id, email, and role on success.

POST /auth/login accepts email and password. Returns an accessToken
JWT on successful credential validation.

## Work Order Endpoints

[VERIFY:FD-022] Work order endpoints are JWT-protected:
- POST /work-orders — Create a new work order
- GET /work-orders — List work orders for the user's company
- PATCH /work-orders/:id/transition — Transition work order status
- PATCH /work-orders/:id/assign — Assign a technician to a work order

## Validation

[VERIFY:FD-023] Request validation uses Prisma schema Decimal(20,2) types
for financial fields. The ValidationPipe with whitelist and
forbidNonWhitelisted rejects unknown properties.

[VERIFY:FD-024] The global ValidationPipe is configured with whitelist: true
and forbidNonWhitelisted: true. This strips unknown properties and returns
400 errors for requests with non-whitelisted fields.

## Request Schemas

### Register Request
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)",
  "name": "string (required)",
  "role": "string (required, one of: DISPATCHER, TECHNICIAN, MANAGER)",
  "companyId": "string (required, UUID)"
}
```

### Work Order Create Request
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "priority": "number (required, 1-5)",
  "customerId": "string (required, UUID)",
  "estimatedCost": "number (optional, Decimal)"
}
```

## Error Responses

All errors follow a consistent format:
- 400: Validation errors, invalid state transitions, role rejection
- 401: Missing or invalid JWT token
- 403: Insufficient permissions (RLS enforcement)

## Rate Limiting

No rate limiting is currently implemented. Future versions will add
per-company rate limits based on subscription tier.

## Cross-References

- See [DATA_MODEL.md](./DATA_MODEL.md) for entity schemas
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for auth flow
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for endpoint test coverage
