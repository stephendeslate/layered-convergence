# API Contracts Specification

## Overview

The API exposes RESTful endpoints for four domain resources plus authentication
and health monitoring. All endpoints (except @Public) require JWT authentication.

## VERIFY:AE-API-001 -- Dashboard DTOs

- `CreateDashboardDto`: `name` (@IsString, @MaxLength(100)), `tenantId` (@IsString, @MaxLength(36))
- `UpdateDashboardDto`: `name` (@IsOptional, @IsString, @MaxLength(100))

## VERIFY:AE-API-002 -- Dashboard Service

CRUD operations scoped by `tenantId`. Uses `findFirst` for single record retrieval
(tenant-scoped lookup, not unique by ID alone in multi-tenant context).

## VERIFY:AE-API-003 -- Dashboard Controller

- `POST /dashboards` -- Create dashboard
- `GET /dashboards?tenantId=` -- List dashboards (paginated)
- `GET /dashboards/:id` -- Get single dashboard
- `PATCH /dashboards/:id` -- Update dashboard
- `DELETE /dashboards/:id` -- Delete dashboard

## VERIFY:AE-API-004 -- DataSource DTOs

- `CreateDataSourceDto`: `name`, `type` (@IsIn), `connectionString`, `tenantId`
- `UpdateDataSourceDto`: `name`, `status` (@IsIn), `connectionString` (all optional)

## VERIFY:AE-API-005 -- DataSource Service

CRUD operations with tenant scoping. Pagination via shared `clampPageSize`.

## VERIFY:AE-API-006 -- DataSource Controller

- `POST /data-sources` -- Create data source
- `GET /data-sources?tenantId=` -- List data sources
- `GET /data-sources/:id` -- Get single data source
- `PATCH /data-sources/:id` -- Update data source
- `DELETE /data-sources/:id` -- Delete data source

## VERIFY:AE-API-007 -- Event DTOs

- `CreateEventDto`: `type` (@IsIn(['CLICK','PAGE_VIEW','API_CALL','CUSTOM','ERROR'])),
  `payload` (@IsOptional, @IsObject), `source`, `tenantId`
- `UpdateEventDto`: `status` (@IsIn(['PENDING','PROCESSED','FAILED','ARCHIVED'])),
  `payload` (both optional)

## VERIFY:AE-API-008 -- Event Service

CRUD with pagination. List endpoint returns `{ data, total, page, pageSize }`.
Select clause omits payload for list view (performance).

## VERIFY:AE-API-009 -- Event Controller

- `POST /events` -- Create event
- `GET /events?tenantId=` -- List events
- `GET /events/:id` -- Get single event
- `PATCH /events/:id` -- Update event
- `DELETE /events/:id` -- Delete event

## VERIFY:AE-API-010 -- Pipeline DTOs

- `CreatePipelineDto`: `name`, `schedule` (@IsOptional), `tenantId`, `processingCost` (@IsOptional)
- `UpdatePipelineDto`: `name`, `status` (@IsIn), `schedule`, `processingCost` (all optional)

## VERIFY:AE-API-011 -- Pipeline Service

CRUD operations with tenant scoping and pagination.

## VERIFY:AE-API-012 -- Pipeline Controller

- `POST /pipelines` -- Create pipeline
- `GET /pipelines?tenantId=` -- List pipelines
- `GET /pipelines/:id` -- Get single pipeline
- `PATCH /pipelines/:id` -- Update pipeline
- `DELETE /pipelines/:id` -- Delete pipeline

## Validation

All endpoints use `ValidationPipe` with `whitelist`, `forbidNonWhitelisted`, and
`transform` enabled. String fields include `@MaxLength` constraints. UUIDs are
constrained to `@MaxLength(36)`.

## Pagination

Query parameters `page` (default 1) and `pageSize` (default 20, max 100) are
supported on all list endpoints via shared `clampPageSize` / `calculateSkip`.
