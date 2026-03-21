# API Contract — Analytics Engine

## Overview

The Analytics Engine exposes a RESTful API built with NestJS 11. All endpoints except auth require JWT bearer token authentication. Tenant context is derived from the JWT payload.

See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication flow and [DATA_MODEL.md](./DATA_MODEL.md) for entity schemas.

## Authentication Endpoints

### POST /auth/register
- Request: `{ email, password, name, role }` + `x-tenant-id` header
- Response: `{ accessToken: string }`
- Validation: role must be VIEWER, EDITOR, or ANALYST (not ADMIN)

### POST /auth/login
- Request: `{ email, password }`
- Response: `{ accessToken: string }`

## Data Source Endpoints

### GET /data-sources
- Auth: JWT required
- Response: Array of DataSource objects

### POST /data-sources
- Auth: JWT required
- Request: `{ name, type, connectionUri }`
- Response: Created DataSource

### GET /data-sources/:id
- Auth: JWT required
- Response: DataSource with tenant check

### PATCH /data-sources/:id
- Auth: JWT required
- Request: `{ name?, isActive? }`

### DELETE /data-sources/:id
- Auth: JWT required

## Pipeline Endpoints

### GET /pipelines
- Auth: JWT required

### POST /pipelines
- Auth: JWT required
- Request: `{ name, description?, config? }`

### PATCH /pipelines/:id/transition
- Auth: JWT required
- Request: `{ status }` (must be valid transition)

## Dashboard Endpoints

### GET /dashboards
- Auth: JWT required
- Response: Dashboards with widgets and owner info

### POST /dashboards
- Request: `{ title, isPublic? }`

### PATCH /dashboards/:id
### DELETE /dashboards/:id

## Verification Tags

[VERIFY:API-001] Auth endpoints handle registration with tenant header and login with credentials.
> Implementation: `backend/src/auth/auth.controller.ts`

[VERIFY:API-002] DataSource CRUD endpoints with tenant isolation via service layer.
> Implementation: `backend/src/data-source/data-source.service.ts`

[VERIFY:API-003] Pipeline endpoints include state transition endpoint at PATCH /pipelines/:id/transition.
> Implementation: `backend/src/pipeline/pipeline.service.ts`

[VERIFY:API-004] Dashboard CRUD endpoints return widgets and owner info in list responses.
> Implementation: `backend/src/dashboard/dashboard.service.ts`

[VERIFY:API-005] SyncRun service manages sync lifecycle with state transitions.
> Implementation: `backend/src/sync-run/sync-run.service.ts`

[VERIFY:API-006] Server Actions check response.ok before processing API responses.
> Implementation: `frontend/lib/actions.ts`

[VERIFY:API-007] All protected endpoints use JwtAuthGuard decorator.
> Implementation: `backend/src/data-source/data-source.controller.ts`, `backend/src/pipeline/pipeline.controller.ts`, `backend/src/dashboard/dashboard.controller.ts`

[VERIFY:API-008] Register DTO validates role with @IsIn excluding ADMIN.
> Implementation: `backend/src/auth/dto/register.dto.ts`

## Error Codes

| Code | Meaning |
|------|---------|
| 400  | Bad Request — validation failure or invalid state transition |
| 401  | Unauthorized — missing or invalid JWT |
| 404  | Not Found — entity does not exist or tenant mismatch |
| 409  | Conflict — duplicate email registration |

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature context
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for API test coverage
