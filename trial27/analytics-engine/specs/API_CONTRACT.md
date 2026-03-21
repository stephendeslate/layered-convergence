# API Contract: Analytics Engine

## Overview

The Analytics Engine exposes a RESTful API through NestJS controllers.
All endpoints except authentication require JWT Bearer token authorization.

## Authentication Endpoints

### POST /auth/register
[VERIFY:AE-021] Pipeline state machine defined in Prisma schema with
PipelineStatus enum (DRAFT, ACTIVE, PAUSED, ARCHIVED). Registration
endpoint accepts email, password, name, role, and tenantId. The role
field is validated via @IsIn to exclude ADMIN.

Request body:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "Jane Doe",
  "role": "VIEWER",
  "tenantId": "tenant-uuid"
}
```

Response: 201 Created with user object and JWT token.

### POST /auth/login
Login endpoint accepts email and password credentials. Returns JWT token
on successful authentication.

Request body:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response: 200 OK with user object and JWT token.

## Analytics Endpoints

### GET /analytics/dashboards
[VERIFY:AE-022] Pipeline entity with state machine status tracking. The
dashboards endpoint returns all dashboards for the authenticated user's
tenant, including nested widget data. Requires JWT authentication.

Response: 200 OK with array of dashboard objects including widgets.

### POST /analytics/pipelines
Creates a new pipeline in DRAFT status for the authenticated user's tenant.

Request body:
```json
{
  "name": "Sales Pipeline",
  "config": { "source": "postgres", "schedule": "hourly" }
}
```

### POST /analytics/pipelines/:id/transition
[VERIFY:AE-023] Embed tokens with expiration dates are scoped to specific
dashboards. Pipeline transition endpoint validates state machine rules
before updating status.

Request body:
```json
{
  "status": "ACTIVE"
}
```

## Validation

[VERIFY:AE-024] ValidationPipe with whitelist and forbidNonWhitelisted
ensures that unknown properties are rejected and only declared DTO
properties are accepted. Transform option enables automatic type conversion.

## Error Responses

All error responses follow a consistent format:
- 400: Validation errors, invalid state transitions
- 401: Missing or invalid JWT token
- 403: Insufficient permissions
- 404: Resource not found
- 500: Internal server error

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for authentication flow
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity schemas
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authorization rules
