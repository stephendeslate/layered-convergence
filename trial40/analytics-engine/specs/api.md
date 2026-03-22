# API Specification

## Overview
RESTful API built with NestJS 11 serving the Analytics Engine platform.
All endpoints return JSON. Authentication via JWT Bearer tokens.

## Base URL
- Development: http://localhost:3000
- Production: Configured via environment variables

## Authentication Endpoints

### POST /auth/register
Creates a new user account. Rate-limited to 5 requests per 60 seconds.
- VERIFY:AE-AUTH-02 — Register DTO validates role against ALLOWED_REGISTRATION_ROLES
- VERIFY:AE-AUTH-04 — Auth service hashes passwords with bcrypt

### POST /auth/login
Authenticates user and returns JWT token. Rate-limited to 5/60s.
- VERIFY:AE-AUTH-05 — Auth controller exposes login, register, profile

### GET /auth/profile
Returns authenticated user profile. Requires JWT Bearer token.

## Domain Endpoints

### Events (CRUD)
- POST /events — Create event (type, name, payload, tenantId)
- GET /events — List events with pagination (tenantId, page, pageSize)
- GET /events/:id — Get event detail with tenant info
- PUT /events/:id — Update event fields
- DELETE /events/:id — Delete event
- VERIFY:AE-API-01 — Events CRUD service with Prisma select/include
- VERIFY:AE-API-02 — Events controller with full CRUD and Cache-Control

### Dashboards (CRUD)
- POST /dashboards — Create dashboard
- GET /dashboards — List dashboards with pagination
- GET /dashboards/:id — Get dashboard with user and tenant
- PUT /dashboards/:id — Update dashboard
- DELETE /dashboards/:id — Delete dashboard
- VERIFY:AE-API-03 — Dashboards CRUD service
- VERIFY:AE-API-04 — Dashboards controller with full CRUD

### Data Sources (CRUD)
- POST /data-sources — Create data source
- GET /data-sources — List data sources with pagination
- GET /data-sources/:id — Get data source with pipelines
- PUT /data-sources/:id — Update data source
- DELETE /data-sources/:id — Delete data source
- VERIFY:AE-API-05 — DataSources CRUD service
- VERIFY:AE-API-06 — DataSources controller with full CRUD

### Pipelines (CRUD)
- POST /pipelines — Create pipeline
- GET /pipelines — List pipelines with pagination
- GET /pipelines/:id — Get pipeline with data source
- PUT /pipelines/:id — Update pipeline
- DELETE /pipelines/:id — Delete pipeline
- VERIFY:AE-API-07 — Pipelines CRUD service
- VERIFY:AE-API-08 — Paginated response format with data and meta envelope

## Pagination
All list endpoints support page and pageSize query parameters.
Page size is clamped to MAX_PAGE_SIZE (100) via normalizePageParams.
Response envelope: { data: T[], meta: { page, pageSize, total, totalPages } }
- VERIFY:AE-PERF-01 — MAX_PAGE_SIZE constant for pagination clamping
- VERIFY:AE-PERF-04 — normalizePageParams clamps page and pageSize
- VERIFY:AE-PERF-05 — paginate builds Prisma skip/take
- VERIFY:AE-TEST-04 — Auth integration tests with supertest
- VERIFY:AE-TEST-05 — Domain integration tests with supertest

## Error Responses
Standard error format: { statusCode, message, timestamp, correlationId }
No stack traces exposed in production responses.
Cross-reference: monitoring.md for error tracking details.
