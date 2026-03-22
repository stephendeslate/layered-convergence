# Performance Specification

## Overview

Performance optimizations span the backend (timeouts, pagination, select optimization)
and frontend (dynamic imports, skeleton loading states).

## Async Timeout Wrapper

- VERIFY: FD-PERF-001 — withTimeout() wraps async operations with configurable millisecond timeout
- TimeoutError thrown when operation exceeds limit
- Used on bcrypt hash operations (5000ms) to prevent DoS

## Pagination

- VERIFY: FD-PERF-002 — normalizePageParams() sanitizes page/pageSize, caps at MAX_PAGE_SIZE (100)
- Negative and zero page numbers default to 1
- NaN values handled gracefully
- All list endpoints use consistent paginate() response format

## Response Time Tracking

- VERIFY: FD-PERF-003 — ResponseTimeInterceptor uses performance.now() for sub-ms accuracy
- X-Response-Time header added to all responses
- Response times recorded in MetricsService for monitoring

## Prisma Select Optimization

- VERIFY: FD-PERF-004 — ResponseTimeInterceptor records elapsed time to MetricsService
- VERIFY: FD-PERF-005 — Work order list queries use select instead of include to reduce payload
- VERIFY: FD-PERF-006 — Pagination test validates MAX_PAGE_SIZE capping
- VERIFY: FD-PERF-007 — Technician list queries use select optimization

## N+1 Prevention

Single-record queries use `include` for eager loading of related data:
- WorkOrder findOne includes schedules
- Technician findOne includes schedules
- Schedule queries include workOrder and technician

List queries use `select` to exclude relations, preventing N+1 issues.

## Bundle Optimization

- VERIFY: FD-PERF-008 — ScheduleStats component loaded via next/dynamic with ssr: false

## Database Performance

- Composite indexes on (tenant_id, status) for filtered queries
- Composite index on (work_order_id, technician_id) for schedule lookups
- Individual indexes on all foreign key columns
- Status enum indexes for filtered queries

## Concurrent Operations

- findMany and count run in parallel via Promise.all for list endpoints
- This reduces total response time compared to sequential queries

## Memory Efficiency

- MetricsService uses primitive counters (no array accumulation)
- No in-memory caching of database records
- Pagination prevents loading entire datasets
