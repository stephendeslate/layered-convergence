# API Contract — Analytics Engine

## Overview
The Analytics Engine exposes a RESTful API via NestJS controllers. All endpoints
use JSON request/response bodies. See SYSTEM_ARCHITECTURE.md for the validation
pipeline and SECURITY_MODEL.md for authentication requirements.

## Authentication Endpoints

<!-- VERIFY:AE-REGISTER-ENDPOINT — POST /auth/register with role restriction -->
### POST /auth/register
Creates a new user account. The role field is validated with @IsIn to
exclude ADMIN from self-registration.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1",
  "role": "VIEWER | EDITOR | ANALYST",
  "tenantId": "tenant-cuid"
}
```

**Response (201):**
```json
{ "access_token": "jwt-token-string" }
```

**Validation Rules:**
- email: Must be a valid email format (@IsEmail)
- password: Minimum 8 characters (@MinLength)
- role: Must be one of VIEWER, EDITOR, ANALYST — ADMIN excluded (@IsIn)
- tenantId: Required non-empty string (@IsNotEmpty)

<!-- VERIFY:AE-LOGIN-ENDPOINT — POST /auth/login with JWT -->
### POST /auth/login
Authenticates an existing user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss1"
}
```

**Response (200):**
```json
{ "access_token": "jwt-token-string" }
```

### GET /auth/health
Returns service health status. Used by Docker HEALTHCHECK.

**Response (200):**
```json
{ "status": "ok" }
```

## Pipeline Endpoints

<!-- VERIFY:AE-PIPELINES-LIST — GET /pipelines with tenant filtering -->
### GET /pipelines?tenantId={id}
Returns all pipelines for a tenant, ordered by creation date descending.

### PATCH /pipelines/:id/status
Transitions a pipeline to a new status. Validates against the state machine
defined in PRODUCT_VISION.md (DRAFT→ACTIVE→PAUSED→ARCHIVED).

### GET /pipelines/count?tenantId={id}
Returns pipeline count using raw SQL query (see DATA_MODEL.md for schema).

## Dashboard Endpoints
### GET /dashboards?tenantId={id}
Returns dashboards with associated widgets for a tenant.

### GET /dashboards/:id
Returns a single dashboard with widgets by ID.

### POST /dashboards
Creates a new dashboard. Requires title, tenantId, and userId.

### POST /dashboards/:id/widgets
Adds a widget to a dashboard. Requires type and config.

## CORS Configuration
<!-- VERIFY:AE-CORS-CONFIG — CORS from environment variable -->
CORS origin is configured from the CORS_ORIGIN environment variable.
No hardcoded fallback values are used. The origin must be set at startup.

## Error Responses
All error responses follow the standard NestJS format:
```json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "Bad Request"
}
```

Status codes: 400 (validation), 401 (auth), 404 (not found), 500 (server).
