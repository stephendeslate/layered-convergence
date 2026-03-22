# Performance Specification

## Overview

The FSD platform implements performance optimizations at multiple layers:
response time tracking, pagination clamping, database query optimization,
caching headers, and frontend bundle optimization.

See [architecture.md](./architecture.md) for system structure.
See [data-model.md](./data-model.md) for indexing strategy.

## Response Time Tracking

ResponseTimeInterceptor registered as APP_INTERCEPTOR in AppModule.
Uses performance.now() from perf_hooks for high-resolution timing.
Sets X-Response-Time header on every response.

<!-- VERIFY: FD-RESPONSE-TIME — apps/api/src/common/response-time.interceptor.ts uses perf_hooks -->
<!-- VERIFY: FD-APP-INTERCEPTOR — apps/api/src/app.module.ts registers ResponseTimeInterceptor as APP_INTERCEPTOR -->

## Pagination

MAX_PAGE_SIZE clamping via normalizePageParams utility from shared package.
Client-requested page sizes exceeding 100 are silently clamped (not rejected).

<!-- VERIFY: FD-MAX-PAGE-SIZE — packages/shared/src/pagination.ts defines MAX_PAGE_SIZE = 100 -->
<!-- VERIFY: FD-NORMALIZE-PAGE — packages/shared/src/pagination.ts normalizes page params -->

## Database Optimization

### Prisma Select/Include

All queries use explicit `select` to return only needed fields.
N+1 prevention via `include` for related entity loading (e.g., technician
on work order detail queries).

### Database Indexes

Composite indexes on (tenantId, status) for filtered list queries.
Individual indexes on tenant FKs, status fields, and foreign keys.

### Connection Pooling

DATABASE_URL includes connection_limit parameter to prevent connection
exhaustion under load.

## Cache-Control Headers

List endpoints include Cache-Control headers:
- Work Orders: private, max-age=30
- Technicians: private, max-age=30
- Schedules: private, max-age=30
- Service Areas: private, max-age=60

## Frontend Bundle Optimization

Next.js dynamic imports via next/dynamic for code splitting.
Nav component loaded with dynamic import in layout.tsx.

## Performance Tests

<!-- VERIFY: FD-PERFORMANCE-TEST — apps/api/test/performance.spec.ts has response time and pagination tests -->
