# Performance Specification

## Overview

The Analytics Engine implements performance optimizations at the API, database, and
frontend layers. Key features include response time instrumentation, pagination
clamping, query optimization, and bundle splitting.

## Response Time Instrumentation

<!-- VERIFY:AE-RESPONSE-TIME-INTERCEPTOR — ResponseTimeInterceptor uses performance.now() from perf_hooks -->

The ResponseTimeInterceptor is registered as APP_INTERCEPTOR in AppModule (never in
main.ts). It measures request duration using performance.now() from the perf_hooks
module and sets the X-Response-Time header on every response.

Format: `X-Response-Time: 12.34ms`

See [monitoring.md](./monitoring.md) for how response times feed into the metrics system.

## Pagination

<!-- VERIFY:AE-SHARED-CACHE — Shared package exports CACHE_CONTROL_LIST constant -->

All list endpoints support pagination via page and pageSize query parameters.
The normalizePageParams function from shared clamps page size to MAX_PAGE_SIZE (100)
instead of rejecting oversized requests. This prevents client errors while
maintaining server resource limits.

Defaults:
- page: 1
- pageSize: 20 (DEFAULT_PAGE_SIZE)

Clamping behavior:
- pageSize > 100 becomes 100
- pageSize < 1 becomes 1
- page < 1 becomes 1

## Cache-Control Headers

List endpoints include Cache-Control headers to enable client and CDN caching:
`Cache-Control: public, max-age=60, s-maxage=120`

This is applied via @Header decorator on controller list methods.

## Database Query Optimization

### Prisma Select

All queries use explicit `select` to limit returned fields. This reduces
data transfer and prevents accidental exposure of sensitive fields (e.g., passwords).

### N+1 Prevention

Related entity data is fetched using Prisma `include` within the same query
rather than making separate queries. For example, DataSource.findOne includes
related events and pipelines.

### Connection Pooling

DATABASE_URL includes `connection_limit` parameter to control the Prisma
connection pool size, preventing database connection exhaustion.

### Indexes

Performance-critical indexes:
- Tenant FK indexes on all domain tables
- Status field indexes for filtered queries
- Composite indexes: (tenantId, status), (tenantId, isPublic), (tenantId, isActive)

## Frontend Optimization

### Bundle Splitting

The Next.js frontend uses `next/dynamic` for code splitting non-critical components.
The StatsSection on the home page is loaded dynamically with SSR disabled.

<!-- VERIFY:AE-HOME-PAGE — Home page uses next/dynamic for bundle optimization -->

## Test Coverage

<!-- VERIFY:AE-PERFORMANCE-TEST — Performance tests verify X-Response-Time header and pagination clamping -->

Performance integration tests validate:
- X-Response-Time header presence and format
- Pagination clamping to MAX_PAGE_SIZE
- Default pagination values
- Edge cases (negative pages, zero page size)
