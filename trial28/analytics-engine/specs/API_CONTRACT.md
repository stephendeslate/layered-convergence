# API Contract — Analytics Engine

## Base URL
All endpoints are served from the backend on the configured PORT (default 4000).

## Authentication Endpoints

### POST /auth/register
Creates a new user account and returns a JWT token.
Request body: { email, password, role, tenantId }
Role must be one of: VIEWER, EDITOR, ANALYST (ADMIN excluded).
Response: { access_token: string }
<!-- VERIFY:AE-REGISTER-ENDPOINT — POST /auth/register with role restriction -->

### POST /auth/login
Authenticates a user and returns a JWT token.
Request body: { email, password }
Response: { access_token: string }
Errors: 401 for invalid credentials.
<!-- VERIFY:AE-LOGIN-ENDPOINT — POST /auth/login with JWT response -->

### GET /auth/health
Returns application health status.
Response: { status: "ok" }
Used by Docker HEALTHCHECK for container monitoring.

## Pipeline Endpoints

### GET /pipelines?tenantId={id}
Returns all pipelines for the specified tenant.
Response: Pipeline[]
<!-- VERIFY:AE-PIPELINES-LIST — GET /pipelines with tenant filtering -->

### GET /pipelines/count?tenantId={id}
Returns pipeline count using raw SQL query.
Response: { count: number }

### PATCH /pipelines/:id/activate
Activates a pipeline using $executeRaw with Prisma.sql.
Response: Pipeline with updated status.

### PATCH /pipelines/:id/status?status={status}
Transitions pipeline to a new status.
Response: Pipeline with updated status.

## Dashboard Endpoints

### GET /dashboards?tenantId={id}
Returns all dashboards with widgets for the specified tenant.
Response: Dashboard[] (includes widgets relation)

### GET /dashboards/:id
Returns a single dashboard with its widgets.
Response: Dashboard (includes widgets relation)

### POST /dashboards
Creates a new dashboard.
Request body: { title, tenantId, userId }
Response: Dashboard

## Validation
All endpoints use ValidationPipe with:
- whitelist: true (strips unknown properties)
- forbidNonWhitelisted: true (rejects unknown properties with 400)
- transform: true (auto-transforms types)

## Error Responses
Standard NestJS error format:
```json
{
  "statusCode": 400,
  "message": ["validation error details"],
  "error": "Bad Request"
}
```

## CORS
Configured via CORS_ORIGIN environment variable.
Requests from unauthorized origins are rejected.
<!-- VERIFY:AE-CORS-CONFIG — CORS configured from environment variable -->
