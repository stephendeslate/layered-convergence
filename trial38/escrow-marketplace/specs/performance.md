# Performance Specification (Layer 7)

## Overview

Layer 7 introduces performance optimizations across the stack: response timing, pagination guards, query optimization, caching headers, dynamic imports, and connection pooling. The T38 variation adds measureDuration and clampPageSize utilities.

## ResponseTimeInterceptor

Located at `apps/api/src/interceptors/response-time.interceptor.ts`:

- Registered globally via APP_INTERCEPTOR in AppModule
- Measures request-to-response duration using `performance.now()`
- Logs: `${method} ${url} ${statusCode} ${durationMs}ms` via NestJS Logger
- Timing is rounded to 2 decimal places for clean output

## Pagination Safety (clampPageSize)

Located in `packages/shared/src/index.ts`:

- `clampPageSize(requested, max)` -- Clamps page size to MAX_PAGE_SIZE (100)
- Returns DEFAULT_PAGE_SIZE (20) for zero or negative values
- Used in both ListingsController and TransactionsController before forwarding to services
- Prevents clients from requesting unbounded result sets that could degrade performance

## Prisma Query Optimization

### Select (List Queries)
- `findAll` methods use Prisma `select` to fetch only needed fields
- Reduces data transfer from database and memory usage on the server
- Applied to both listings and transactions list endpoints
- Fields explicitly enumerated rather than using findMany without select

### Include (Detail Queries)
- Transaction `findOne` uses `include` for eager loading of listing and escrowAccount
- Prevents N+1 queries by fetching related data in a single database round-trip
- Applied to transaction detail endpoint where related data is always needed

### Database Indexes
- `@@index([tenantId, status])` on listings -- optimizes filtered list queries
- `@@index([tenantId, buyerId])` on transactions -- optimizes buyer transaction lookups
- `@@index([tenantId, sellerId])` on transactions -- optimizes seller transaction lookups
- `@@index([sellerId])` on listings -- optimizes seller listing lookups
- `@@index([transactionId])` on disputes -- optimizes dispute lookups by transaction

## Cache-Control Headers

Set in controllers via `res.setHeader()`:

- Listings list: `public, max-age=30, stale-while-revalidate=60` -- Listings are semi-public and change infrequently
- Transactions list: `private, max-age=15, stale-while-revalidate=30` -- Transactions are user-specific and sensitive

## Dynamic Imports (next/dynamic)

- `ListingsTable` component loaded via `next/dynamic` with a loading fallback
- Loading fallback includes `role="status"` and `aria-busy="true"` for accessibility
- Reduces initial JavaScript bundle size on the listings page
- Applied to data-heavy table components not needed for initial server render

## measureDuration Utility (T38 Variation)

Located in `packages/shared/src/index.ts`:

- `measureDuration<T>(fn: () => Promise<T>)` -- Wraps async operations with timing
- Returns `{ result: T, durationMs: number }`
- Used in AuthService for timing bcrypt hash operations
- Rounds duration to 2 decimal places via `Math.round(x * 100) / 100`
- Referenced by ResponseTimeInterceptor (via void import for tree-shaking awareness)

## Verification Tags

<!-- VERIFY: EM-PERF-001 — measureDuration utility for timing critical operations -->
<!-- VERIFY: EM-PERF-002 — clampPageSize utility for pagination safety -->
<!-- VERIFY: EM-PERF-003 — Response time interceptor logging method, URL, status, duration -->
<!-- VERIFY: EM-PERF-004 — Cache-Control headers on list endpoints -->
<!-- VERIFY: EM-PERF-005 — Prisma query optimization: list queries use select -->
<!-- VERIFY: EM-PERF-006 — N+1 prevention: include for eager loading related data -->
<!-- VERIFY: EM-PERF-007 — next/dynamic import for bundle optimization -->

## Cross-References

- See [api.md](api.md) for pagination query parameters and endpoint details
- See [database.md](database.md) for index definitions and Prisma schema
