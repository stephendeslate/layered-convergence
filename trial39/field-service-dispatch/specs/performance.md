# Performance Specification

## Overview

Layer 7 performance optimizations cover response time measurement,
pagination guards, query optimization, database indexing, N+1
prevention, bundle optimization, and caching headers.

## Response Time Interceptor

<!-- VERIFY: FD-PERF-003 — ResponseTimeInterceptor registered as APP_INTERCEPTOR -->
<!-- VERIFY: FD-PERF-004 — Response time interceptor using performance.now() -->

The ResponseTimeInterceptor is registered as APP_INTERCEPTOR in AppModule
(never via main.ts useGlobalInterceptors). It uses performance.now() from
perf_hooks (not Date.now()) for high-resolution timing. Sets X-Response-Time
header and logs method, URL, status code, and duration.

## Timeout Guard (T39 Variation)

<!-- VERIFY: FD-PERF-001 — Async timeout wrapper utility (T39 variation) -->

The withTimeout<T> utility wraps async operations with a timeout guard.
If the operation exceeds the specified milliseconds, a TimeoutError is
thrown. Used in the auth service to guard bcrypt hashing operations.

## Pagination Guards (T39 Variation)

<!-- VERIFY: FD-PERF-002 — Pagination parameter sanitization (T39 variation) -->
<!-- VERIFY: FD-PERF-006 — normalizePageParams used for pagination safety in list endpoint -->
<!-- VERIFY: FD-PERF-008 — normalizePageParams used for technician list pagination -->

The normalizePageParams utility sanitizes page (min 1) and pageSize
(min 1, max MAX_PAGE_SIZE). Used in both work orders and technicians
controllers to prevent invalid pagination parameters.

## Query Optimization

<!-- VERIFY: FD-PERF-005 — Prisma select optimization on list queries -->
<!-- VERIFY: FD-PERF-007 — Prisma select on technician list queries -->

All list queries use Prisma select to fetch only the columns needed
for list views. This avoids over-fetching and reduces payload sizes.
Detail queries use include for related data (eager loading).

## Database Indexing Strategy

Indexes are defined on:
- All tenant-scoped foreign keys (tenantId on users, work_orders,
  technicians, service_areas)
- Status columns (work_orders.status, technicians.status)
- Priority column (work_orders.priority)
- Composite indexes: (tenantId, status) on work_orders and technicians,
  (workOrderId, technicianId) on schedules

## Response Time Budgets

| Endpoint Category | Target | Max |
|-------------------|--------|-----|
| Auth validation | < 100ms | 500ms |
| List endpoints | < 200ms | 500ms |
| Detail endpoints | < 150ms | 500ms |
| Create/Update | < 300ms | 1000ms |

## Bundle Optimization

The schedule page uses next/dynamic to lazy-load the ScheduleStats
component, reducing the initial JavaScript bundle size.

## Caching Headers

Domain list endpoints set Cache-Control headers:
`private, max-age=30, stale-while-revalidate=60`

This allows browsers to cache responses for 30 seconds while
serving stale content for up to 60 seconds during revalidation.

## Connection Pooling

Prisma connection pool is configured via the connection_limit parameter
in DATABASE_URL. Default is 10 connections with a 30-second pool timeout.

## Cross-References

- See [API](./api.md) for endpoint details
- See [Database](./database.md) for index definitions
- See [Testing](./testing.md) for performance test specifications
