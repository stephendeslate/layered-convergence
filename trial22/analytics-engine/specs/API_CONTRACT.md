# API Contract

## Overview

The Analytics Engine exposes a RESTful API via NestJS controllers. All endpoints
(except auth and public embed lookup) require JWT authentication. The JWT payload
contains `tenantId` which scopes all operations.

## Authentication Endpoints

### POST /auth/register
Creates a new user within a tenant.

Request body:
```json
{
  "email": "user@example.com",
  "password": "minimum8chars",
  "role": "VIEWER | EDITOR | ANALYST",
  "tenantId": "uuid"
}
```

Response: `{ "accessToken": "jwt-token" }`

[VERIFY:AC-001] Auth service handles register and login flows -> Implementation: src/auth/auth.service.ts:3

[VERIFY:AC-002] Auth controller exposes POST /auth/register and POST /auth/login -> Implementation: src/auth/auth.controller.ts:1

[VERIFY:AC-003] Register DTO validates role with @IsIn([VIEWER, EDITOR, ANALYST]) -> Implementation: src/auth/dto/register.dto.ts:1

### POST /auth/login
Authenticates an existing user.

Request body:
```json
{
  "email": "user@example.com",
  "password": "minimum8chars"
}
```

[VERIFY:AC-004] Login DTO with email and password validation -> Implementation: src/auth/dto/login.dto.ts:1

## Dashboard Endpoints

All dashboard endpoints require JWT auth and scope to the authenticated tenant.

### GET /dashboards
### GET /dashboards/:id
### POST /dashboards
### PUT /dashboards/:id
### DELETE /dashboards/:id

[VERIFY:AC-005] Dashboard service with tenant-scoped CRUD -> Implementation: src/dashboard/dashboard.service.ts:1

[VERIFY:AC-006] Dashboard controller with JWT-protected CRUD endpoints -> Implementation: src/dashboard/dashboard.controller.ts:1

## Data Source Endpoints

### GET /data-sources
### GET /data-sources/:id
### POST /data-sources
### PUT /data-sources/:id
### DELETE /data-sources/:id

[VERIFY:AC-007] DataSource service with tenant-scoped operations -> Implementation: src/data-source/data-source.service.ts:1

[VERIFY:AC-008] DataSource controller with JWT-protected endpoints -> Implementation: src/data-source/data-source.controller.ts:1

## Data Point Endpoints

### GET /data-points?dataSourceId=uuid
### POST /data-points
### DELETE /data-points/:id

[VERIFY:AC-009] DataPoint service with Decimal precision handling -> Implementation: src/data-point/data-point.service.ts:1

[VERIFY:AC-010] DataPoint controller with tenant-scoped endpoints -> Implementation: src/data-point/data-point.controller.ts:1

## Pipeline Endpoints

### GET /pipelines
### GET /pipelines/:id
### POST /pipelines
### PUT /pipelines/:id/transition
### DELETE /pipelines/:id

The transition endpoint enforces the state machine: DRAFT->ACTIVE->PAUSED->ARCHIVED.

[VERIFY:AC-011] Pipeline service with state machine transitions -> Implementation: src/pipeline/pipeline.service.ts:1

[VERIFY:AC-012] Pipeline controller with transition endpoint -> Implementation: src/pipeline/pipeline.controller.ts:1

## Widget Endpoints

### GET /widgets?dashboardId=uuid
### POST /widgets
### PUT /widgets/:id
### DELETE /widgets/:id

[VERIFY:AC-013] Widget service with dashboard association -> Implementation: src/widget/widget.service.ts:1

[VERIFY:AC-014] Widget controller with tenant-scoped CRUD -> Implementation: src/widget/widget.controller.ts:1

## Embed Endpoints

### GET /embeds/token/:token (public, no auth)
### GET /embeds (auth required)
### POST /embeds (auth required)
### DELETE /embeds/:id (auth required)

[VERIFY:AC-015] Embed service with token generation and expiry -> Implementation: src/embed/embed.service.ts:1

[VERIFY:AC-016] Embed controller with public token lookup -> Implementation: src/embed/embed.controller.ts:1

## SyncRun Endpoints

### GET /sync-runs?dataSourceId=uuid
### POST /sync-runs
### PUT /sync-runs/:id/transition

[VERIFY:AC-017] SyncRun service with state machine transitions -> Implementation: src/sync-run/sync-run.service.ts:1

[VERIFY:AC-018] SyncRun controller with transition endpoint -> Implementation: src/sync-run/sync-run.controller.ts:1

## Server Actions (Frontend)

All frontend mutations use Server Actions that check `response.ok` before
redirecting.

[VERIFY:AC-019] Server Actions check response.ok before redirect -> Implementation: frontend/app/actions.ts:1

## Cross-References

- Authentication flow: see SECURITY_MODEL.md
- Entity schemas: see DATA_MODEL.md
- UI that consumes these endpoints: see UI_SPECIFICATION.md
