# API Contract — Analytics Engine

## Overview
RESTful API served by NestJS with JWT authentication and input validation.
All endpoints use ValidationPipe for request body validation.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [SECURITY_MODEL.md](SECURITY_MODEL.md)

## Authentication Endpoints

### POST /auth/register
<!-- VERIFY:AE-REGISTER-ENDPOINT -->
Register a new user account. ADMIN role is excluded from self-registration.

Request body:
- email: valid email (required)
- password: string, minimum 8 characters (required)
- role: one of VIEWER, EDITOR, ANALYST (required)
- tenantId: string (required)

Response: { access_token: string }
Error: 400 if role is ADMIN or validation fails.

### POST /auth/login
<!-- VERIFY:AE-LOGIN-ENDPOINT -->
Authenticate an existing user and receive a JWT token.

Request body:
- email: valid email (required)
- password: string, minimum 8 characters (required)

Response: { access_token: string }
Error: 401 for invalid credentials.

### GET /auth/health
Returns { status: "ok" } for container health checks.

## Pipeline Endpoints

### GET /pipelines
<!-- VERIFY:AE-PIPELINES-LIST -->
List pipelines filtered by tenant. Requires tenantId query parameter.

Query: tenantId (required)
Response: Pipeline[]

### PATCH /pipelines/:id/status
Transition a pipeline to a new status. Validates state machine rules.

Body: { status: string }
Error: 400 for invalid transitions.

### GET /pipelines/count
Raw SQL count of pipelines for a tenant.
Query: tenantId (required)
Response: number

## Dashboard Endpoints

### GET /dashboards
List dashboards with widgets for a tenant.
Query: tenantId (required)
Response: Dashboard[] (includes widgets)

### GET /dashboards/:id
Get a single dashboard with its widgets.
Response: Dashboard (includes widgets)
Error: 404 if not found.

## CORS Configuration
<!-- VERIFY:AE-CORS-CONFIG -->
CORS origin is configured from the CORS_ORIGIN environment variable.
No hardcoded fallback values. The enableCors method is called in main.ts.
