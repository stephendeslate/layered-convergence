# Performance Specification

## Overview

Layer 7 adds performance optimizations to the Escrow Marketplace: response timing,
pagination guards, query optimization, caching headers, dynamic imports, database
indexing, and connection pooling.

## Response Time Interceptor

The ResponseTimeInterceptor is registered as APP_INTERCEPTOR in AppModule providers
(never in main.ts). It uses performance.now() from perf_hooks for high-resolution
timing. The interceptor sets X-Response-Time header and logs method, URL, status, duration.

- VERIFY: EM-PERF-001 — withTimeout utility wrapping async operations with timeout guard
- VERIFY: EM-PERF-002 — normalizePageParams utility clamping page and pageSize

## Response Time Budgets

- Auth endpoints (health): < 50ms
- List endpoints (listings, transactions): < 200ms
- Detail endpoints: < 100ms

## Interceptor Registration

- VERIFY: EM-PERF-003 — ResponseTimeInterceptor registered as APP_INTERCEPTOR in AppModule
- VERIFY: EM-PERF-004 — Response time uses performance.now() from perf_hooks

## Critical Operation Timing

The withTimeout utility wraps async operations (e.g., bcrypt hashing) with a timeout
guard. If the operation exceeds the specified milliseconds, a TimeoutError is thrown.
This prevents indefinite blocking on slow operations.

- VERIFY: EM-PERF-005 — withTimeout wrapping bcrypt hash in AuthService

## Caching Headers

List endpoints set Cache-Control headers for cache-friendly responses:
- Listings: public, max-age=30, stale-while-revalidate=60
- Transactions: private, max-age=10

- VERIFY: EM-PERF-006 — Cache-Control headers on listing list endpoints
- VERIFY: EM-PERF-007 — Cache-Control private for transaction list endpoints

## Query Optimization

List queries use Prisma select to fetch only needed fields (no description in listing lists).
Detail queries use Prisma include for eager loading of related data.
This prevents N+1 query problems and reduces data transfer.

## Database Indexing Strategy

Composite indexes on (tenantId, status) for listings and transactions optimize
the most common query pattern: tenant-scoped filtering by status.
Additional indexes on foreign keys (sellerId, buyerId, transactionId) support joins.

## Bundle Optimization

EscrowStats component uses next/dynamic for code splitting. This reduces the initial
bundle size by deferring load of the statistics component.

## Connection Pooling

DATABASE_URL includes ?connection_limit=10 to configure Prisma's connection pool.
This prevents connection exhaustion under concurrent load.

## Cross-References

- See api.md for pagination endpoint details
- See database.md for index definitions and query patterns
