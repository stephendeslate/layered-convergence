# Performance

## Overview

The Escrow Marketplace implements response time tracking, pagination
clamping, query optimization, caching headers, and bundle optimization
to ensure consistent performance across all endpoints.

## Response Time Tracking

- VERIFY: EM-PERF-001 — ResponseTimeInterceptor registered as APP_INTERCEPTOR
- VERIFY: EM-PERF-002 — ResponseTimeInterceptor uses performance.now()
- X-Response-Time header added to every response
- Measured in milliseconds with two decimal precision
- Registered in AppModule providers (not main.ts)

## Pagination

- VERIFY: EM-PAGE-001 — Pagination utilities in shared package
- VERIFY: EM-PAGE-002 — clampPageSize clamps to MAX_PAGE_SIZE (not rejects)
- VERIFY: EM-PAGE-003 — Services use clampPageSize for page size validation
- MAX_PAGE_SIZE = 100, DEFAULT_PAGE_SIZE = 20
- Page size is clamped, never rejected (soft limit)
- Pagination helper converts page/pageSize to skip/take

## Query Optimization

- Prisma select/include for field optimization (no SELECT *)
- N+1 prevention via include on related entities
- findOne queries use include for buyer/seller/transaction relations
- findAll queries use select for minimal data transfer

## Database Indexing

- @@index on all tenant foreign keys for multi-tenant query performance
- @@index on status fields for common filtering operations
- Composite @@index on [tenantId, status] for combined filters
- @@index on relational FKs (sellerId, buyerId, transactionId)
- See [data-model.md](./data-model.md) for complete index definitions

## Caching

- VERIFY: EM-CONST-002 — MAX_PAGE_SIZE and DEFAULT_PAGE_SIZE from shared
- Cache-Control headers on list endpoints: public, max-age=30, stale-while-revalidate=60
- Applied via @Header decorator on GET list endpoints
- No cache on mutation endpoints (POST, PUT, DELETE)

## Connection Management

- DATABASE_URL includes connection_limit parameter
- Default connection_limit=10 in .env.example
- PrismaService manages connection lifecycle via OnModuleInit/OnModuleDestroy

## Frontend Bundle Optimization

- VERIFY: EM-HOME-001 — Home page uses next/dynamic for lazy loading
- VERIFY: EM-NEXT-001 — Next.js config transpiles shared package
- Dynamic imports reduce initial bundle size
- Dashboard component loaded lazily on home page

## Test Coverage

- VERIFY: EM-TPERF-001 — Performance integration tests
- Tests verify X-Response-Time header presence and format
- Tests verify health endpoint responds under 200ms
- Tests verify pagination clamping behavior

## Cross-References

See [api-contracts.md](./api-contracts.md) for endpoint pagination details.
See [data-model.md](./data-model.md) for database indexing strategy.
