# API Contract — Analytics Engine

## Overview

The backend exposes RESTful endpoints organized by domain entity. All endpoints except
authentication routes require a valid JWT token in the Authorization header. Tenant isolation
is enforced by extracting tenantId from the JWT payload.

## Authentication Endpoints

### POST /auth/register
Creates a new user account. The ADMIN role is rejected at both DTO validation and service layers.

### POST /auth/login
Authenticates a user and returns a JWT access token.

### GET /auth/me
Returns the authenticated user's profile (requires JwtAuthGuard).

## Pipeline Endpoints

[VERIFY:AC-001] Pipeline CRUD with tenant isolation — all operations scoped by tenantId from JWT.
> Implementation: `backend/src/pipeline/pipeline.service.ts:1`

[VERIFY:AC-002] Pipeline state machine transition validates allowed status changes.
> Implementation: `backend/src/pipeline/pipeline.service.ts:2`

### Endpoints
- `POST /pipelines` — Create pipeline (defaults to DRAFT)
- `GET /pipelines` — List all pipelines for tenant
- `GET /pipelines/:id` — Get single pipeline
- `PUT /pipelines/:id` — Update pipeline name/config
- `PUT /pipelines/:id/transition` — Transition pipeline status
- `DELETE /pipelines/:id` — Delete pipeline

### State Machine Rules
| Current State | Allowed Transitions |
|--------------|-------------------|
| DRAFT | ACTIVE |
| ACTIVE | PAUSED, ARCHIVED |
| PAUSED | ACTIVE, ARCHIVED |
| ARCHIVED | (terminal — none) |

## Dashboard Endpoints

[VERIFY:AC-003] Dashboard CRUD with tenant isolation — includes Widget relation loading.
> Implementation: `backend/src/dashboard/dashboard.service.ts:1`

### Endpoints
- `POST /dashboards` — Create dashboard
- `GET /dashboards` — List all dashboards (includes widgets)
- `GET /dashboards/:id` — Get single dashboard (includes widgets)
- `PUT /dashboards/:id` — Update dashboard name
- `DELETE /dashboards/:id` — Delete dashboard

## DataSource Endpoints

[VERIFY:AC-004] DataSource CRUD with tenant isolation.
> Implementation: `backend/src/data-source/data-source.service.ts:1`

### Endpoints
- `POST /data-sources` — Create data source
- `GET /data-sources` — List all data sources
- `GET /data-sources/:id` — Get single data source
- `PUT /data-sources/:id` — Update data source
- `DELETE /data-sources/:id` — Delete data source

## DataPoint Endpoints

[VERIFY:AC-005] DataPoint CRUD with tenant isolation — supports filtering by dataSourceId.
> Implementation: `backend/src/data-point/data-point.service.ts:1`

### Endpoints
- `POST /data-points` — Create data point (value as string for Decimal precision)
- `GET /data-points` — List all data points (optional ?dataSourceId= filter)
- `GET /data-points/:id` — Get single data point
- `DELETE /data-points/:id` — Delete data point

## Widget Endpoints

[VERIFY:AC-006] Widget CRUD operations scoped to dashboard.
> Implementation: `backend/src/widget/widget.service.ts:1`

### Endpoints
- `POST /widgets` — Create widget
- `GET /widgets?dashboardId=` — List widgets by dashboard
- `GET /widgets/:id` — Get single widget
- `PUT /widgets/:id` — Update widget
- `DELETE /widgets/:id` — Delete widget

## Embed Endpoints

[VERIFY:AC-007] Embed CRUD with tenant isolation — supports public token lookup.
> Implementation: `backend/src/embed/embed.service.ts:1`

### Endpoints
- `POST /embeds` — Create embed (generates unique token)
- `GET /embeds` — List all embeds
- `GET /embeds/:id` — Get single embed
- `GET /embeds/token/:token` — Public lookup by token
- `PUT /embeds/:id/deactivate` — Deactivate embed
- `DELETE /embeds/:id` — Delete embed

## SyncRun Endpoints

[VERIFY:AC-008] SyncRun CRUD with tenant isolation — includes DataSource relation.
> Implementation: `backend/src/sync-run/sync-run.service.ts:1`

[VERIFY:AC-009] SyncRun state machine validates transition rules (PENDING->RUNNING->SUCCESS|FAILED).
> Implementation: `backend/src/sync-run/sync-run.service.ts:2`

### Endpoints
- `POST /sync-runs` — Create sync run (starts as PENDING)
- `GET /sync-runs` — List all sync runs (includes dataSource)
- `GET /sync-runs/:id` — Get single sync run
- `PUT /sync-runs/:id/transition` — Transition sync run status
- `DELETE /sync-runs/:id` — Delete sync run

## Authentication Guard

[VERIFY:AC-010] JwtAuthGuard protects all authenticated endpoints via @UseGuards decorator.
> Implementation: `backend/src/auth/jwt-auth.guard.ts:3`

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request — validation failure or invalid state transition |
| 401 | Unauthorized — missing or invalid JWT |
| 404 | Not Found — entity does not exist or belongs to different tenant |

## Cross-References

- **PRODUCT_VISION.md**: Defines the capabilities exposed through these endpoints
- **DATA_MODEL.md**: Specifies the entity schemas these endpoints operate on
- **SECURITY_MODEL.md**: Documents authentication and authorization mechanisms
