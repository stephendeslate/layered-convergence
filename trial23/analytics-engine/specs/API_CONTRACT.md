# API Contract — Analytics Engine

## Overview

The API follows RESTful conventions with JWT authentication. All endpoints
return JSON. Tenant isolation is enforced by extracting tenantId from the
JWT token claims.

## Authentication Endpoints

### POST /auth/register
Creates a new user account and returns a JWT token.

Request body:
- email (string, required) — valid email format
- password (string, required) — minimum 8 characters
- role (string, required) — one of: VIEWER, EDITOR, ANALYST
- tenantId (string, required) — UUID of existing tenant

Response: `{ access_token: string }`

[VERIFY:AC-001] Pipeline CRUD endpoints with tenant isolation -> Implementation: backend/src/pipeline/pipeline.service.ts:1
[VERIFY:AC-002] Pipeline transition endpoint validates state machine -> Implementation: backend/src/pipeline/pipeline.service.ts:2

### POST /auth/login
Authenticates a user and returns a JWT token.

Request body:
- email (string, required)
- password (string, required)

Response: `{ access_token: string }`

### GET /auth/me
Returns the authenticated user's profile. Requires JWT.

Response: `{ id, email, role, tenantId }`

## Resource Endpoints

All resource endpoints require JWT authentication (except embed token lookup).
Resources are automatically scoped to the authenticated user's tenant.

### Pipelines
- `POST /pipelines` — create pipeline (starts as DRAFT)
- `GET /pipelines` — list all pipelines for tenant
- `GET /pipelines/:id` — get single pipeline
- `PUT /pipelines/:id` — update pipeline name/config
- `PATCH /pipelines/:id/transition` — transition pipeline state
- `DELETE /pipelines/:id` — delete pipeline

[VERIFY:AC-003] Dashboard CRUD with tenant isolation -> Implementation: backend/src/dashboard/dashboard.service.ts:1
[VERIFY:AC-004] DataSource CRUD with tenant isolation -> Implementation: backend/src/data-source/data-source.service.ts:1
[VERIFY:AC-005] DataPoint CRUD with tenant isolation -> Implementation: backend/src/data-point/data-point.service.ts:1

### Dashboards
- `POST /dashboards` — create dashboard
- `GET /dashboards` — list dashboards
- `GET /dashboards/:id` — get dashboard with widgets
- `PUT /dashboards/:id` — update dashboard
- `DELETE /dashboards/:id` — delete dashboard

### Data Sources
- `POST /data-sources` — create data source
- `GET /data-sources` — list data sources
- `GET /data-sources/:id` — get data source
- `PUT /data-sources/:id` — update data source
- `DELETE /data-sources/:id` — delete data source

### Data Points
- `POST /data-points` — create data point
- `GET /data-points` — list data points
- `GET /data-points/:id` — get data point
- `PUT /data-points/:id` — update data point
- `DELETE /data-points/:id` — delete data point

### Widgets
- `POST /widgets` — create widget
- `GET /widgets/dashboard/:dashboardId` — list widgets for dashboard
- `GET /widgets/:id` — get widget
- `PUT /widgets/:id` — update widget
- `DELETE /widgets/:id` — delete widget

[VERIFY:AC-006] Widget CRUD operations -> Implementation: backend/src/widget/widget.service.ts:1
[VERIFY:AC-007] Embed CRUD with tenant isolation -> Implementation: backend/src/embed/embed.service.ts:1

### Embeds
- `POST /embeds` — create embed (JWT required)
- `GET /embeds` — list embeds (JWT required)
- `GET /embeds/token/:token` — get embed by token (public)
- `GET /embeds/:id` — get embed (JWT required)
- `PUT /embeds/:id` — update embed (JWT required)
- `DELETE /embeds/:id` — delete embed (JWT required)

### Sync Runs
- `POST /sync-runs` — create sync run
- `GET /sync-runs` — list sync runs
- `GET /sync-runs/:id` — get sync run
- `PATCH /sync-runs/:id/transition` — transition sync run state
- `DELETE /sync-runs/:id` — delete sync run

[VERIFY:AC-008] SyncRun CRUD with tenant isolation -> Implementation: backend/src/sync-run/sync-run.service.ts:1
[VERIFY:AC-009] SyncRun state machine validation -> Implementation: backend/src/sync-run/sync-run.service.ts:2

## Validation

All endpoints use NestJS ValidationPipe with whitelist and forbidNonWhitelisted
options. Extra properties in request bodies are rejected.

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for module structure
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for JWT and auth details
- See [DATA_MODEL.md](./DATA_MODEL.md) for entity schemas
