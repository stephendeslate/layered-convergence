# Performance Specification (L7)

## Overview

Layer 7 introduces performance requirements including response time
monitoring, pagination optimization, query efficiency, caching headers,
connection pooling, and bundle optimization.

## Response Time Monitoring

<!-- VERIFY: FD-PERF-003 — Response time interceptor logging method, URL, status, duration -->

A NestJS interceptor logs the HTTP method, URL, status code, and
duration in milliseconds for every request. This data feeds into
monitoring and alerting systems.

Implementation:
- Uses RxJS tap operator in the response pipeline
- Calculates duration via performance.now() for sub-millisecond precision
- Sets X-Response-Time header on every response
- Logs via Logger.log (not console.log)
- Registered as APP_INTERCEPTOR provider in AppModule

## Performance Measurement Utility

<!-- VERIFY: FD-PERF-001 — Performance measurement utility (T38 variation) -->

The `measureDuration` function wraps any async operation and returns
both the result and the elapsed time in milliseconds:

```typescript
const { result, durationMs } = await measureDuration(() => someAsyncOp());
```

This is the T38 variation — it uses performance.now() for sub-millisecond
precision, rounds to 2 decimal places, and returns a structured object
instead of logging directly.

## Pagination Clamping

<!-- VERIFY: FD-PERF-002 — Pagination size clamping utility (T38 variation) -->
<!-- VERIFY: FD-PERF-004 — Pagination clamping via clampPageSize on list endpoint -->
<!-- VERIFY: FD-PERF-006 — Pagination clamping via clampPageSize on technicians list -->

Page size is clamped (not rejected) to prevent abusive queries:

- Values <= 0 default to DEFAULT_PAGE_SIZE (20)
- Values > MAX_PAGE_SIZE are clamped to MAX_PAGE_SIZE (100)
- This is the T38 approach: clamp, not reject with 400

Applied on both work orders and technicians list endpoints.

## Query Optimization

<!-- VERIFY: FD-PERF-005 — Prisma select optimization on list queries -->
<!-- VERIFY: FD-PERF-007 — Prisma select optimization on technician list queries -->

### Select Optimization

List endpoints use Prisma `select` to fetch only the fields needed
for the list view, reducing data transfer and query time:

- Work orders list: id, title, status, priority, tenantId, createdAt
- Technicians list: id, name, email, specialty, status, tenantId

### Include for N+1 Prevention

Detail endpoints use Prisma `include` to eager-load related records
in a single query:

- Work order detail includes schedules with technician data
- Technician detail includes schedules with work order data

## Caching Headers

List endpoints return Cache-Control headers:
- `no-store, max-age=0` — Prevents stale data in real-time dispatch

## Connection Pooling

Database connection pooling is configured via the DATABASE_URL:
- `connection_limit=10` — Maximum concurrent connections
- `pool_timeout=30` — Seconds to wait for available connection

## Bundle Optimization

The ScheduleStats component uses next/dynamic for code splitting,
reducing the initial JavaScript bundle size. A Skeleton component
serves as the loading fallback during the dynamic import.

## Shared Utilities

<!-- VERIFY: FD-SHARED-006 — Format bytes to human-readable string -->
<!-- VERIFY: FD-SHARED-008 — Format GPS coordinates to display string -->

Format utilities are lightweight pure functions in the shared package,
adding zero runtime overhead and enabling tree-shaking.

## Cross-References

- [API Specification](./api.md) — Controller endpoints where performance optimizations are applied
