# Performance Specification

## Overview

Performance optimizations are applied across API response handling, database
queries, and frontend rendering.

## VERIFY:AE-PERF-001 -- Page Size Clamping

`MAX_PAGE_SIZE` (100) is defined in the shared package. The `clampPageSize`
utility ensures no query exceeds this limit. Default page size is 20.

## VERIFY:AE-PERF-002 -- Select Clause Optimization

List endpoints use explicit `select` clauses to avoid fetching unnecessary data.
For example, the events list endpoint excludes `payload` (potentially large JSON)
from the response, only including it in the detail endpoint.

## VERIFY:AE-PERF-003 -- Rate Limiting

ThrottlerModule with named configurations prevents API abuse:
- Default: 100 requests per 60-second window
- Auth endpoints: 5 requests per 60-second window

## VERIFY:AE-PERF-004 -- Response Time Header

`ResponseTimeInterceptor` (registered as `APP_INTERCEPTOR`) measures request
duration and sets the `X-Response-Time` header (e.g., `42ms`).

## VERIFY:AE-PERF-005 -- Dynamic Imports

The home page uses `next/dynamic` to lazy-load the dashboard overview component.
A `Skeleton` loading state is shown during component loading to prevent layout
shift and improve perceived performance.

## Database Performance

- Composite indexes on `(tenantId, status)` for filtered queries
- Simple indexes on `tenantId` foreign keys
- `@db.Decimal(12,2)` for precise monetary calculations without floating point
- Pagination with `skip`/`take` to limit result sets

## Frontend Performance

- Code splitting via dynamic imports
- Route-level loading states with Skeleton components
- Server actions for API calls (no client-side API key exposure)
- CSS variables for theming (no runtime style computation)
- Tailwind CSS for minimal CSS bundle size

## Docker Optimization

Multi-stage build produces a minimal production image:
- `node:20-alpine` base for small image size
- Only production `node_modules` included
- Build artifacts cached between stages
