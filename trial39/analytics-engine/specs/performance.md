# Performance Specification

**Project:** Analytics Engine
**Prefix:** AE-PERF
**Cross-references:** [Database](database.md), [API](api.md)

---

## Overview

Performance optimizations span response time tracking, pagination guards, query optimization,
database indexing, N+1 prevention, bundle optimization, and caching headers.

---

## Requirements

### AE-PERF-01: MAX_PAGE_SIZE Constant
- VERIFY:AE-PERF-01 — MAX_PAGE_SIZE set to 100 in shared package
- All list endpoints clamp pageSize to this value (never reject)

### AE-PERF-02: TimeoutError Class
- VERIFY:AE-PERF-02 — TimeoutError custom class includes timeoutMs property
- Used by withTimeout to provide context about timeout duration

### AE-PERF-03: withTimeout Utility
- VERIFY:AE-PERF-03 — withTimeout wraps async functions with timeout guard
- Throws TimeoutError if operation exceeds specified milliseconds
- Clears timer on both success and failure paths
- See [API](api.md) for usage in auth service

### AE-PERF-04: normalizePageParams Utility
- VERIFY:AE-PERF-04 — normalizePageParams clamps page (min 1) and pageSize (min 1, max MAX_PAGE_SIZE)
- Handles NaN, negative, and fractional inputs gracefully
- Used by all list controllers

### AE-PERF-05: Prisma Pagination Helper
- VERIFY:AE-PERF-05 — paginate converts PageParams to Prisma skip/take
- skip = (page - 1) * pageSize, take = pageSize

### AE-PERF-06: Response Time Interceptor
- VERIFY:AE-PERF-06 — ResponseTimeInterceptor uses performance.now() from perf_hooks
- Sets X-Response-Time header with millisecond precision
- Logs method, URL, status code, and duration
- Registered as APP_INTERCEPTOR in AppModule (not main.ts)
- See [Database](database.md) for query performance expectations

### AE-PERF-07: Auth Service Timeout
- VERIFY:AE-PERF-07 — AuthService wraps bcrypt.hash and bcrypt.compare with withTimeout
- Timeout set to 10 seconds for hashing operations

### AE-PERF-08: Dashboard List Optimization
- VERIFY:AE-PERF-08 — Dashboard list uses normalizePageParams and Cache-Control headers
- Cache-Control: public, max-age=30, stale-while-revalidate=60

### AE-PERF-09: Dashboard Query Efficiency
- VERIFY:AE-PERF-09 — Dashboard list uses select to return only needed columns
- Dashboard detail uses include for eager-loading createdBy and reports

### AE-PERF-10: Pipeline List Optimization
- VERIFY:AE-PERF-10 — Pipeline list uses normalizePageParams and Cache-Control headers
- Cache-Control: public, max-age=15, stale-while-revalidate=30

### AE-PERF-11: Pipeline Query Efficiency
- VERIFY:AE-PERF-11 — Pipeline list uses select; detail uses include for runs and tenant
- N+1 prevention via eager loading of related entities

### AE-PERF-12: Pagination Test Coverage
- VERIFY:AE-PERF-12 — performance.spec.ts validates MAX_PAGE_SIZE clamping and X-Response-Time header
- Tests edge cases: NaN, negative, fractional inputs

### AE-PERF-13: Bundle Optimization
- VERIFY:AE-PERF-13 — DashboardStats component loaded via next/dynamic
- Reduces initial page bundle by deferring heavy component loading

---

**SJD Labs, LLC** — Analytics Engine T39
