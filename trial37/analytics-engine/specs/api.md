# API Specification

## Overview

The API layer is a NestJS application that exposes RESTful endpoints for
managing tenants, users, dashboards, pipelines, pipeline runs, and reports.
All endpoints require JWT authentication except for auth routes.

## Endpoint Groups

### Authentication
- POST /auth/register — Register a new user with tenant assignment
- POST /auth/login — Authenticate and receive a JWT token

### Dashboards
- POST /dashboards — Create a new dashboard
- GET /dashboards — List dashboards for the current tenant (paginated)
- GET /dashboards/:id — Get a single dashboard by ID
- PATCH /dashboards/:id — Update a dashboard
- DELETE /dashboards/:id — Soft-delete a dashboard

### Pipelines
- POST /pipelines — Create a new pipeline
- GET /pipelines — List pipelines for the current tenant (paginated)
- GET /pipelines/:id — Get a single pipeline by ID
- PATCH /pipelines/:id — Update a pipeline
- DELETE /pipelines/:id — Delete a pipeline

## Request Validation

[VERIFY: AE-API-01] All controller methods accept DTO classes annotated with
class-validator decorators, never inline body types.

[VERIFY: AE-API-02] Every string field in DTOs has @IsString() and @MaxLength()
decorators applied.

## Response Format

All list endpoints return paginated responses using the paginate utility
from the shared package.

[VERIFY: AE-API-03] The dashboards controller uses paginate from shared for
list responses.

[VERIFY: AE-API-04] The pipelines controller uses paginate from shared for
list responses.

## Tenant Isolation

All domain queries filter by tenantId extracted from the authenticated user's
JWT payload. No cross-tenant data access is possible at the application layer.

[VERIFY: AE-API-05] Dashboard queries filter by tenantId from the request user.

[VERIFY: AE-API-06] Pipeline queries filter by tenantId from the request user.

## Slug Generation

[VERIFY: AE-API-07] The dashboards service uses slugify from the shared
package when creating dashboards.

## Error Handling

[VERIFY: AE-API-08] Controllers use NestJS built-in exceptions
(NotFoundException, ForbiddenException) for error cases.

See also: [database.md](database.md) for schema design and data types.
