# Escrow Marketplace — Performance Specification

## Overview

Performance optimizations across backend query execution,
response timing, pagination, caching, and frontend bundling.

## Response Time Tracking

<!-- VERIFY:EM-PERF-03 ResponseTimeInterceptor as APP_INTERCEPTOR -->

ResponseTimeInterceptor registered as APP_INTERCEPTOR in AppModule.
Uses performance.now() from perf_hooks for high-resolution timing.
Sets X-Response-Time header on every response.

## Pagination

<!-- VERIFY:EM-PERF-01 pagination constants -->
<!-- VERIFY:EM-PERF-02 pagination normalization with MAX_PAGE_SIZE clamping -->

- MAX_PAGE_SIZE = 100 (defined in shared package)
- DEFAULT_PAGE_SIZE = 20
- normalizePageParams clamps page size (never rejects)
- Negative page numbers normalized to 1

## Query Optimization

All Prisma queries use select or include to fetch only needed fields.
N+1 queries prevented via include for related entities:
- Listing includes seller
- Transaction includes buyer, seller, listing
- Escrow includes transaction
- Dispute includes filer, respondent, transaction

## Database Indexing

Indexes on:
- All tenant foreign keys (tenantId)
- Status enum fields
- Composite indexes: (sellerId + status), (buyerId + status)
- Unique indexes: email, slug, transactionId (escrow)

## Cache-Control Headers

List endpoints set Cache-Control headers:
- `public, max-age=30, stale-while-revalidate=60`
- Applied to: GET /listings, GET /transactions, GET /escrows, GET /disputes

## Connection Pooling

DATABASE_URL includes connection_limit parameter.
Default: connection_limit=10 in production, connection_limit=5 in test.

## Frontend Bundle Optimization

<!-- VERIFY:EM-UI-07 home page with dynamic import for bundle optimization -->

next/dynamic used for code splitting:
- DashboardStats component loaded dynamically
- Loading state shown during chunk download

## Performance Tests

<!-- VERIFY:EM-PERF-04 performance tests -->

Tests verify:
- X-Response-Time header present and formatted correctly
- MAX_PAGE_SIZE clamping works
- Negative page normalization works
- Default page size applied when not specified

## Cross-References

- See [data-model.md](./data-model.md) for index definitions in schema
- See [api.md](./api.md) for paginated endpoint contracts
