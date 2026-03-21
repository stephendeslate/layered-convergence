# Analytics Engine — API Specification

## Overview

REST API endpoints for the Analytics Engine platform. All endpoints except
auth use JWT Bearer tokens. See AUTH_SPEC.md for authentication details
and DATA_MODEL.md for entity schemas.

## Base URL

`/` — all routes are relative to the API root.

## Authentication Endpoints

### POST /auth/register
- VERIFY: AE-API-REG-001 — Registration endpoint with email, password, role, tenantId
- Request body: { email: string, password: string (min 8), role: string, tenantId: string }
- Role validation: @IsIn excludes ADMIN (only OWNER, ANALYST, VIEWER allowed)
- Response 201: { id, email, role }
- Response 400: validation error or invalid role
- Cross-references: AUTH_SPEC.md (role restrictions)

### POST /auth/login
- VERIFY: AE-API-LOGIN-001 — Login endpoint returning JWT access token
- Request body: { email: string, password: string }
- Response 200: { accessToken: string }
- Response 401: invalid credentials
- Cross-references: AUTH_SPEC.md (JWT configuration)

## Dashboard Endpoints

### GET /dashboards
- VERIFY: AE-API-DASH-LIST-001 — List dashboards with pagination
- Query params: page (default 1), pageSize (default 20, max 100)
- Response 200: PaginatedResult<Dashboard> with data, total, page, pageSize, totalPages
- Requires: JWT Bearer token
- Cross-references: DATA_MODEL.md (Dashboard), REQUIREMENTS.md (FR-2)

### GET /dashboards/:id
- VERIFY: AE-API-DASH-GET-001 — Get single dashboard with widgets
- Response 200: Dashboard with included widgets
- Response 404: not found
- Uses findFirst scoped by tenantId for RLS alignment

### POST /dashboards
- VERIFY: AE-API-DASH-CREATE-001 — Create new dashboard
- Request body: { name: string }
- Response 201: created dashboard
- TenantId and userId extracted from JWT token

## Pipeline Endpoints

### GET /pipelines
- VERIFY: AE-API-PIPE-LIST-001 — List pipelines with recent runs
- Response 200: Pipeline[] with last 5 runs included
- Requires: JWT Bearer token

### PATCH /pipelines/runs/:id/transition
- VERIFY: AE-API-PIPE-TRANS-001 — Transition pipeline run status
- Request body: { status: PipelineStatus }
- Response 200: updated pipeline run
- Response 400: invalid state transition
- Response 404: run not found
- Cross-references: STATE_MACHINES.md (PipelineStatus transitions)

## Error Handling

- 400: Validation errors, invalid state transitions
- 401: Missing or invalid JWT token
- 404: Entity not found within tenant scope
- All error responses include message field

## Cross-References

- AUTH_SPEC.md: JWT configuration and role-based access
- DATA_MODEL.md: Entity schemas and relationships
- STATE_MACHINES.md: Valid status transitions
- TESTING_STRATEGY.md: Integration test coverage for endpoints
