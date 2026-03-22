# API Contracts Specification

## Base URL
All API endpoints are served from the NestJS application on the configured PORT.

## Authentication Endpoints

### POST /auth/login
Request body: `{ email: string, password: string }`
Response: `{ accessToken: string, user: { id, email, role, tenantId } }`
Rate limit: 5 requests per 60 seconds

### POST /auth/register
Request body: `{ email: string, password: string, tenantId: string, role: string }`
Response: `{ accessToken: string, user: { id, email, role, tenantId } }`
Role must be one of ALLOWED_REGISTRATION_ROLES (excludes ADMIN).

### GET /auth/profile (authenticated)
Response: `{ userId, email, role, tenantId }`

## Dashboard Endpoints (authenticated)

### VERIFY:AE-API-001 — CreateDashboardDto validates name, tenantId with @IsString + @MaxLength
### VERIFY:AE-API-002 — DashboardsService implements full CRUD with pagination clamping
### VERIFY:AE-API-003 — DashboardsController exposes GET/POST/PUT/DELETE with Cache-Control

Endpoints: POST /dashboards, GET /dashboards, GET /dashboards/:id, PUT /dashboards/:id, DELETE /dashboards/:id.
List endpoint returns `{ data, total, page, pageSize }` with Cache-Control header.
See [data-model.md](./data-model.md) for Dashboard schema definition.

## Data Source Endpoints (authenticated)

### VERIFY:AE-API-004 — CreateDataSourceDto validates type with @IsIn, monthlyCost as number
### VERIFY:AE-API-005 — DataSourcesService implements full CRUD with include for pipelines
### VERIFY:AE-API-006 — DataSourcesController exposes GET/POST/PUT/DELETE with Cache-Control

Endpoints: POST /data-sources, GET /data-sources, GET /data-sources/:id, PUT /data-sources/:id, DELETE /data-sources/:id.

## Event Endpoints (authenticated)

### VERIFY:AE-API-007 — CreateEventDto validates type with @IsIn, source with @MaxLength
### VERIFY:AE-API-008 — EventsService implements full CRUD with select optimization
### VERIFY:AE-API-009 — EventsController exposes GET/POST/PUT/DELETE with Cache-Control

Endpoints: POST /events, GET /events, GET /events/:id, PUT /events/:id, DELETE /events/:id.

## Pipeline Endpoints (authenticated)

### VERIFY:AE-API-010 — CreatePipelineDto validates processingCost, dataSourceId, tenantId
### VERIFY:AE-API-011 — PipelinesService implements full CRUD with dataSource include
### VERIFY:AE-API-012 — PipelinesController exposes GET/POST/PUT/DELETE with Cache-Control

Endpoints: POST /pipelines, GET /pipelines, GET /pipelines/:id, PUT /pipelines/:id, DELETE /pipelines/:id.

## Health Endpoints (public, no auth, skip throttle)

### GET /health
Response: `{ status: 'ok', timestamp, uptime, version }`

### GET /health/ready
Response: `{ status: 'ok', database: 'connected', timestamp }`

### GET /metrics
Response: `{ requestCount, errorCount, averageResponseTime, uptime }`

## Common Response Headers
- X-Correlation-ID: UUID on all responses
- X-Response-Time: Response duration in milliseconds
- Cache-Control: private, max-age=30 on list endpoints
