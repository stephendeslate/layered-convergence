# API Contract: Analytics Engine

## Overview

The Analytics Engine exposes a REST API via NestJS controllers
with JWT-based authentication.

## Authentication Endpoints

### POST /auth/register
[VERIFY:AE-021] Registration endpoint accepts name, email, password, role,
and tenantId. Role is validated with @IsIn excluding ADMIN.

Request body: `{ name, email, password, role, tenantId }`
Success response: `{ accessToken, user: { id, email, role } }`
Error: 400 (validation), 409 (duplicate email)

### POST /auth/login
Request body: `{ email, password }`
Success response: `{ accessToken, user: { id, email, role } }`
Error: 401 (invalid credentials)

## Analytics Endpoints

### POST /analytics/pipelines
[VERIFY:AE-022] Creates a new pipeline in DRAFT status.
Requires JWT authentication.

### POST /analytics/pipelines/:id/transition
[VERIFY:AE-023] Transitions pipeline status following state machine rules.
Returns 400 for invalid transitions.

### GET /analytics/dashboards/:tenantId
Returns all dashboards for a tenant with widget data.

### POST /analytics/dashboards
Creates a new dashboard for a tenant.

### GET /analytics/data-sources/:tenantId
Returns all data sources for a tenant.

### POST /analytics/data-sources
Creates a new data source connection.

## Error Codes

- 400: Validation error or invalid state transition
- 401: Missing or invalid JWT token
- 409: Conflict (duplicate resource)

## Input Validation

[VERIFY:AE-024] All endpoints use ValidationPipe with whitelist and
forbidNonWhitelisted options to strip unknown properties.

## Cross-References

- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for JWT configuration
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity schemas
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for endpoint testing
