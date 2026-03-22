# API Specification

## Trial 38 | Analytics Engine

### Overview

RESTful API built with NestJS 11 providing CRUD operations for dashboards
and pipelines, plus authentication endpoints. All domain endpoints require
JWT authentication. Responses follow consistent JSON structure.

### VERIFY: AE-API-01 - Dashboard CRUD Endpoints

Five endpoints for dashboard management:

| Method | Path | Description |
|--------|------|-------------|
| POST | /dashboards | Create dashboard |
| GET | /dashboards | List dashboards (paginated) |
| GET | /dashboards/:id | Get single dashboard |
| PATCH | /dashboards/:id | Update dashboard |
| DELETE | /dashboards/:id | Delete dashboard |

All endpoints require `@UseGuards(JwtAuthGuard)` and filter by `tenantId`.

TRACED in: `apps/api/src/dashboards/dashboards.controller.ts`

### VERIFY: AE-API-02 - Pipeline CRUD Endpoints

Five endpoints for pipeline management:

| Method | Path | Description |
|--------|------|-------------|
| POST | /pipelines | Create pipeline |
| GET | /pipelines | List pipelines (paginated) |
| GET | /pipelines/:id | Get single pipeline |
| PATCH | /pipelines/:id | Update pipeline |
| DELETE | /pipelines/:id | Delete pipeline |

All endpoints require `@UseGuards(JwtAuthGuard)` and filter by `tenantId`.

TRACED in: `apps/api/src/pipelines/pipelines.controller.ts`

### VERIFY: AE-API-03 - Request Validation

All incoming requests are validated via NestJS `ValidationPipe` configured
globally with `whitelist: true`, `forbidNonWhitelisted: true`, and
`transform: true`. DTOs use class-validator decorators.

TRACED in: `apps/api/src/main.ts`

### VERIFY: AE-API-04 - DTO Decorators

Create DTOs use `@IsString()`, `@MaxLength()`, `@IsOptional()`, and
`@IsIn()` decorators. Update DTOs extend create DTOs with all fields
marked `@IsOptional()`. No `@IsEnum()` is used for role validation.

TRACED in: `apps/api/src/dashboards/dto/create-dashboard.dto.ts`,
`apps/api/src/pipelines/dto/create-pipeline.dto.ts`

### VERIFY: AE-API-05 - Pagination Pattern

List endpoints accept `page` (default 1) and `pageSize` (default 20)
query parameters. Page size is clamped using `clampPageSize(requested, 100)`
from the shared package - never rejected, always clamped.

TRACED in: `apps/api/src/dashboards/dashboards.controller.ts`,
`apps/api/src/pipelines/pipelines.controller.ts`

### VERIFY: AE-API-06 - Response Format

List endpoints return `{ data, total, page, pageSize }`. Single-item
endpoints return the entity directly. Delete endpoints return
`{ deleted: true }`.

TRACED in: `apps/api/src/dashboards/dashboards.controller.ts`

### VERIFY: AE-API-07 - Error Handling

Services throw `NotFoundException` when entities are not found.
Controllers rely on NestJS exception filters for error responses.
No raw `console.log` statements in production code.

TRACED in: `apps/api/src/dashboards/dashboards.service.ts`,
`apps/api/src/pipelines/pipelines.service.ts`

### VERIFY: AE-API-08 - Global Prefix

No global API prefix is used. Endpoints are mounted at root level
(`/auth`, `/dashboards`, `/pipelines`). CORS is configured via
`CORS_ORIGIN` environment variable.

TRACED in: `apps/api/src/main.ts`

---

Cross-references: [security.md](security.md), [auth.md](auth.md), [performance.md](performance.md)
