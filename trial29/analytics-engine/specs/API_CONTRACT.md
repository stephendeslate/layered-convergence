# API Contract — Analytics Engine

## Overview
The Analytics Engine backend exposes REST endpoints for authentication,
pipeline management, and dashboard operations. See DATA_MODEL.md for entity
definitions and SECURITY_MODEL.md for authentication requirements.

## Base URL
All endpoints are served from the backend at the configured PORT (default 4000).

## Authentication Endpoints

### POST /auth/register
<!-- VERIFY:AE-REGISTER-ENDPOINT — POST /auth/register with role restriction -->
Creates a new user account with role restriction.
Request body: `{ email, password, role, tenantId }`
- `role` must be one of: VIEWER, EDITOR, ANALYST (ADMIN excluded)
- `password` minimum 8 characters
- `email` must be valid email format
Response: `{ access_token: string }`

### POST /auth/login
<!-- VERIFY:AE-LOGIN-ENDPOINT — POST /auth/login with JWT -->
Authenticates a user and returns a JWT.
Request body: `{ email, password }`
Response: `{ access_token: string }`
Error: 401 Unauthorized for invalid credentials

### GET /auth/health
Returns service health status.
Response: `{ status: "ok" }`

## Pipeline Endpoints

### GET /pipelines
<!-- VERIFY:AE-PIPELINES-LIST — GET /pipelines with tenant filtering -->
Lists pipelines filtered by tenant.
Query params: `tenantId` (required)
Response: Pipeline[]

### GET /pipelines/count
Returns raw SQL count of pipelines for a tenant.
Query params: `tenantId` (required)
Response: `{ count: number }`

### PATCH /pipelines/:id/status
Transitions pipeline status following the state machine.
Request body: `{ status: string }`
Validates transitions: DRAFT->ACTIVE, ACTIVE->PAUSED|ARCHIVED, PAUSED->ACTIVE|ARCHIVED

### PATCH /pipelines/:id/activate
Activates a pipeline using raw SQL update.
Response: Updated Pipeline

## Dashboard Endpoints

### GET /dashboards
Lists dashboards with widgets for a tenant.
Query params: `tenantId` (required)
Response: Dashboard[] with nested Widget[]

### GET /dashboards/:id
Returns a single dashboard with its widgets.
Response: Dashboard with nested Widget[]

### POST /dashboards
Creates a new dashboard.
Request body: `{ title, tenantId, userId }`
Response: Created Dashboard

### POST /dashboards/:id/widgets
Adds a widget to a dashboard.
Request body: `{ type, config }`
Response: Created Widget

## CORS Configuration
<!-- VERIFY:AE-CORS-CONFIG — CORS from environment variable -->
CORS origin is configured from the CORS_ORIGIN environment variable.
No hardcoded fallback values. See SYSTEM_ARCHITECTURE.md for details.

## Error Handling
All validation errors return 400 with structured error messages.
Authentication failures return 401.
Not found errors return 404.
UI error handling is described in UI_SPECIFICATION.md.
