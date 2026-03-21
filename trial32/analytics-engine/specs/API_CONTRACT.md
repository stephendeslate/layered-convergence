# API Contract — Analytics Engine

## Overview

RESTful API with JWT authentication. All domain endpoints require Bearer token.
Tenant isolation is enforced through the JWT payload's tenantId claim.

See also: [SECURITY_MODEL.md](SECURITY_MODEL.md), [DATA_MODEL.md](DATA_MODEL.md)

## Authentication Endpoints

### POST /auth/register
- Body: { email, password, role, tenantId }
- Role must be one of: VIEWER, EDITOR, ANALYST (no ADMIN)
- Returns: { id, email, role }

### POST /auth/login
- Body: { email, password }
- Returns: { accessToken }

## Domain Endpoints

### Pipelines
- [VERIFY:AE-AC-001] Pipeline CRUD with tenant isolation -> Implementation: apps/api/src/pipeline/pipeline.service.ts:1
- [VERIFY:AE-AC-002] Pipeline transition validates state machine rules -> Implementation: apps/api/src/pipeline/pipeline.service.ts:2
- POST /pipelines — Create pipeline (DRAFT status)
- GET /pipelines — List pipelines for tenant
- GET /pipelines/:id — Get pipeline by ID
- PUT /pipelines/:id — Update pipeline
- POST /pipelines/:id/transition — Transition pipeline status
- DELETE /pipelines/:id — Delete pipeline

### Dashboards
- [VERIFY:AE-AC-003] Dashboard CRUD with tenant isolation -> Implementation: apps/api/src/dashboard/dashboard.service.ts:1
- POST /dashboards — Create dashboard
- GET /dashboards — List dashboards for tenant
- GET /dashboards/:id — Get dashboard with widgets
- PUT /dashboards/:id — Update dashboard
- DELETE /dashboards/:id — Delete dashboard

### Data Sources
- [VERIFY:AE-AC-004] DataSource CRUD with tenant isolation -> Implementation: apps/api/src/data-source/data-source.service.ts:1
- POST /data-sources — Create data source
- GET /data-sources — List data sources for tenant
- GET /data-sources/:id — Get data source by ID
- PUT /data-sources/:id — Update data source
- DELETE /data-sources/:id — Delete data source

### Data Points
- [VERIFY:AE-AC-005] DataPoint CRUD with tenant isolation -> Implementation: apps/api/src/data-point/data-point.service.ts:1
- POST /data-points — Create data point
- GET /data-points — List data points for tenant
- GET /data-points/:id — Get data point by ID
- DELETE /data-points/:id — Delete data point

### Widgets
- [VERIFY:AE-AC-006] Widget CRUD operations -> Implementation: apps/api/src/widget/widget.service.ts:1
- POST /widgets — Create widget
- GET /widgets/dashboard/:dashboardId — List widgets for dashboard
- GET /widgets/:id — Get widget by ID
- PUT /widgets/:id — Update widget
- DELETE /widgets/:id — Delete widget

### Embeds
- [VERIFY:AE-AC-007] Embed CRUD with tenant isolation -> Implementation: apps/api/src/embed/embed.service.ts:1
- POST /embeds — Create embed
- GET /embeds — List embeds for tenant
- GET /embeds/token/:token — Get embed by token (public)
- GET /embeds/:id — Get embed by ID
- DELETE /embeds/:id — Delete embed

### Sync Runs
- [VERIFY:AE-AC-008] SyncRun CRUD with tenant isolation -> Implementation: apps/api/src/sync-run/sync-run.service.ts:1
- [VERIFY:AE-AC-009] SyncRun state machine validation -> Implementation: apps/api/src/sync-run/sync-run.service.ts:2
- POST /sync-runs — Create sync run (PENDING status)
- GET /sync-runs — List sync runs for tenant
- GET /sync-runs/:id — Get sync run by ID
- POST /sync-runs/:id/transition — Transition sync run status
- DELETE /sync-runs/:id — Delete sync run

## Error Responses

All errors follow the format:
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## State Machine Validation

Transition endpoints validate against allowed state machine transitions:
- Invalid transitions return 400 with descriptive error message
- Terminal states reject all transitions
