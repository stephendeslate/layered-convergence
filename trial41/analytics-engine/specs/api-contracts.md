# API Contracts Specification

## Overview

The Analytics Engine exposes a RESTful API via NestJS controllers. All domain
endpoints require JWT authentication. Health and metrics endpoints are public.
All responses include X-Correlation-ID and X-Response-Time headers.

## Authentication Endpoints

### POST /auth/register
Creates a new user account. Rate limited to 5 requests per 60 seconds.

<!-- VERIFY:AE-AUTH-REGISTER-DTO — RegisterDto validates email, password, name, role, tenantId with @IsString + @MaxLength -->
<!-- VERIFY:AE-AUTH-LOGIN-DTO — LoginDto validates email and password with @IsString + @MaxLength -->
<!-- VERIFY:AE-AUTH-CONTROLLER — AuthController exposes register, login, and profile endpoints -->
<!-- VERIFY:AE-AUTH-SERVICE — AuthService handles registration, login, and profile retrieval -->

### POST /auth/login
Authenticates and returns JWT access token.

### GET /auth/profile
Returns current user profile. Requires JWT.

## Domain Endpoints

All domain endpoints follow the same CRUD pattern. They require JWT auth and scope
data to the authenticated user's tenant.

### Events (See [data-model.md](./data-model.md) for entity definition)

<!-- VERIFY:AE-EVENTS-CONTROLLER — EventsController has Create, Read, ReadAll, Update, Delete -->
<!-- VERIFY:AE-EVENTS-SERVICE — EventsService implements tenant-scoped CRUD with pagination -->
<!-- VERIFY:AE-EVENT-CREATE-DTO — CreateEventDto validates all string fields with @IsString + @MaxLength -->
<!-- VERIFY:AE-EVENT-UPDATE-DTO — UpdateEventDto validates all string fields with @IsString + @MaxLength -->

### Dashboards

<!-- VERIFY:AE-DASHBOARDS-CONTROLLER — DashboardsController has full CRUD operations -->
<!-- VERIFY:AE-DASHBOARDS-SERVICE — DashboardsService implements tenant-scoped CRUD with owner tracking -->
<!-- VERIFY:AE-DASHBOARD-CREATE-DTO — CreateDashboardDto validates name and description -->
<!-- VERIFY:AE-DASHBOARD-UPDATE-DTO — UpdateDashboardDto validates name and description -->

### Data Sources

<!-- VERIFY:AE-DATASOURCES-CONTROLLER — DataSourcesController has full CRUD operations -->
<!-- VERIFY:AE-DATASOURCES-SERVICE — DataSourcesService implements tenant-scoped CRUD -->
<!-- VERIFY:AE-DATASOURCE-CREATE-DTO — CreateDataSourceDto validates all string fields -->
<!-- VERIFY:AE-DATASOURCE-UPDATE-DTO — UpdateDataSourceDto validates all string fields -->

### Pipelines

<!-- VERIFY:AE-PIPELINES-CONTROLLER — PipelinesController has full CRUD operations -->
<!-- VERIFY:AE-PIPELINES-SERVICE — PipelinesService implements tenant-scoped CRUD -->
<!-- VERIFY:AE-PIPELINE-CREATE-DTO — CreatePipelineDto validates all string fields -->
<!-- VERIFY:AE-PIPELINE-UPDATE-DTO — UpdatePipelineDto validates all string fields -->

## Pagination

All list endpoints support `page` and `pageSize` query parameters.
Page size is clamped to MAX_PAGE_SIZE (100), never rejected.
Response format: { data: T[], total: number, page: number, pageSize: number }

## Cache-Control

List endpoints return Cache-Control: public, max-age=60, s-maxage=120.

## Validation

All DTOs enforce:
- @IsString() + @MaxLength() on ALL string fields
- @MaxLength(36) on UUID fields
- @IsIn(ALLOWED_REGISTRATION_ROLES) excluding ADMIN on registration
- ValidationPipe with whitelist + forbidNonWhitelisted + transform
