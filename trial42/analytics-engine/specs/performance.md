# Performance Specification

## Overview
Analytics Engine implements performance optimizations across backend and frontend.
See [monitoring.md](./monitoring.md) for the ResponseTimeInterceptor integration with metrics.

## Response Time Tracking

### VERIFY:AE-PERF-003 — ResponseTimeInterceptor registered as APP_INTERCEPTOR in AppModule
### VERIFY:AE-PERF-004 — ResponseTimeInterceptor uses performance.now() from perf_hooks, sets X-Response-Time header

The interceptor measures request duration using high-resolution timers from perf_hooks.
It sets the X-Response-Time header on all responses and reports to MetricsService.

## Pagination

### VERIFY:AE-PERF-001 — MAX_PAGE_SIZE constant set to 100 in shared
### VERIFY:AE-PERF-002 — clampPageSize clamps requested size to MAX_PAGE_SIZE (not rejection)

All list endpoints use clampPageSize from shared to cap the maximum page size.
If a client requests pageSize > 100, it is silently clamped to 100.
Default page size is 20 when not specified.

## Database Optimization
- Prisma select/include used to limit returned fields on list endpoints
- @@index directives on tenant foreign keys, status fields, and composite indexes
- N+1 prevention via include on related entities
- connection_limit parameter in DATABASE_URL

## Frontend Optimization

### VERIFY:AE-PERF-005 — Homepage uses next/dynamic for lazy loading DashboardOverview component

Bundle splitting via next/dynamic for components not needed on initial render.
Skeleton loading states shown during dynamic imports.

## Caching
- Cache-Control: private, max-age=30 on list endpoints (dashboards, events, data-sources, pipelines)
- No caching on mutation endpoints or health checks

## Performance Testing

### VERIFY:AE-TEST-008 — Performance integration tests verify X-Response-Time, Cache-Control, pagination clamping, health response time

Performance tests use supertest to verify:
- X-Response-Time header presence on all responses
- Cache-Control header on list endpoints
- Page size clamping behavior
- Health endpoint responds within 200ms

## UI Components

### VERIFY:AE-UI-001 — cn() utility uses clsx + tailwind-merge from shared import
### VERIFY:AE-UI-008 — Button component uses cn() with variant/size props

Frontend components use the cn() utility for conditional class merging.
