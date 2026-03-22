# Performance Specification

## Trial 38 | Analytics Engine - L7 Requirements

### Overview

L7 introduces performance requirements including response time tracking,
pagination guards, query optimization, bundle optimization, caching,
and connection pooling. This is the primary T38 variation layer.

### VERIFY: AE-PERF-01 - ResponseTimeInterceptor

Global NestJS interceptor that measures and logs request duration.
Sets `X-Response-Time` header on every response. Uses `tap` operator
from RxJS to execute after response is sent. Logs method, URL,
status code, and duration in milliseconds.

TRACED in: `apps/api/src/common/interceptors/response-time.interceptor.ts`

### VERIFY: AE-PERF-02 - measureDuration Utility

T38 variation utility in shared package:
```typescript
async function measureDuration<T>(fn: () => Promise<T>):
  Promise<{ result: T; durationMs: number }>
```
Uses `performance.now()` for high-resolution timing. Duration is
rounded to 2 decimal places.

TRACED in: `packages/shared/src/index.ts`

### VERIFY: AE-PERF-03 - clampPageSize Utility

T38 variation utility in shared package:
```typescript
function clampPageSize(requested: number, max: number): number
```
Returns `Math.min(max, Math.max(1, requested))`. Ensures page size
is always between 1 and max, never rejecting invalid values.

TRACED in: `packages/shared/src/index.ts`

### VERIFY: AE-PERF-04 - Pagination Guard (Clamping)

Dashboard and pipeline controllers use `clampPageSize(pageSize, 100)`
to enforce maximum page size. Values above 100 are silently clamped
to 100. Values below 1 are clamped to 1. This is NOT rejection -
the request always succeeds with a valid page size.

TRACED in: `apps/api/src/dashboards/dashboards.controller.ts`

### VERIFY: AE-PERF-05 - Prisma Select Optimization

List queries use explicit `select` to fetch only needed columns,
avoiding loading full entity graphs. This prevents over-fetching
and reduces database I/O.

TRACED in: `apps/api/src/dashboards/dashboards.service.ts`

### VERIFY: AE-PERF-06 - Prisma Include for Detail

Single-entity queries use `include` to eagerly load related data
in a single query, preventing N+1 query problems. Dashboards include
tenant info. Pipelines include runs and reports.

TRACED in: `apps/api/src/pipelines/pipelines.service.ts`

### VERIFY: AE-PERF-07 - N+1 Prevention

All relation loading is done via Prisma `include` at query time,
never via lazy loading or subsequent queries. Service methods document
their query strategy with comments.

TRACED in: `apps/api/src/dashboards/dashboards.service.ts`

### VERIFY: AE-PERF-08 - Bundle Optimization

Next.js frontend uses `next/dynamic` with `{ ssr: false }` for
heavy client-side components. This splits the bundle and reduces
initial page load time.

TRACED in: `apps/web/app/dashboards/page.tsx`

### VERIFY: AE-PERF-09 - Cache-Control Headers

List endpoints set `Cache-Control: private, max-age=30, stale-while-revalidate=60`
via `@Header('Cache-Control', 'private, max-age=30, stale-while-revalidate=60')`
decorator. This allows short-lived caching of list views while ensuring
revalidation for freshness.

TRACED in: `apps/api/src/dashboards/dashboards.controller.ts`

### VERIFY: AE-PERF-10 - Connection Pooling

DATABASE_URL includes `connection_limit` parameter for Prisma
connection pool sizing. Documented in `.env.example`. Default
pool size is appropriate for single-instance deployment.

TRACED in: `.env.example`

### VERIFY: AE-PERF-11 - Performance Test Coverage

`performance.spec.ts` validates:
- X-Response-Time header presence and numeric value
- Pagination clamping behavior (oversized requests)
- Cache-Control header values
- Response time thresholds for list and detail endpoints

TRACED in: `apps/api/test/performance.spec.ts`

### VERIFY: AE-PERF-12 - Database Indexes

Performance-critical queries are supported by indexes:
- Tenant filtering: indexes on `tenant_id` columns
- User lookup: index on `email`
- Run/report lookup: indexes on `pipeline_id`

TRACED in: `apps/api/prisma/migrations/00000000000000_init/migration.sql`

### VERIFY: AE-PERF-13 - Interceptor Registration

ResponseTimeInterceptor is registered as `APP_INTERCEPTOR` in
`AppModule` providers, ensuring it applies to all routes globally
without per-controller decoration.

TRACED in: `apps/api/src/app.module.ts`
