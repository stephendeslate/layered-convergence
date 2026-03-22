# Architecture

## Overview

The Escrow Marketplace is a Turborepo 2 monorepo with pnpm workspaces
containing a NestJS 11 backend API, Next.js 15 frontend, and a shared
package for cross-cutting utilities.

## Monorepo Structure

- VERIFY: EM-SHRD-001 — Shared package exports constants, pagination, correlation, logging
- apps/api: NestJS 11 backend with Prisma ORM
- apps/web: Next.js 15 frontend with Tailwind CSS
- packages/shared: Common utilities and constants

## Backend Module Architecture

### AppModule (Root)
- VERIFY: EM-APP-001 — AppModule registers all providers via DI
- Imports: AuthModule, ListingsModule, TransactionsModule, EscrowsModule, DisputesModule, MonitoringModule
- Registers APP_GUARD (ThrottlerGuard), APP_FILTER (GlobalExceptionFilter), APP_INTERCEPTOR (ResponseTimeInterceptor)

### AuthModule
- VERIFY: EM-AUTH-001 — AuthModule configures JWT and passport

### MonitoringModule
- VERIFY: EM-MMOD-001 — MonitoringModule configures middleware pipeline
- Provides: MetricsService, LoggerService, RequestContextService
- Exports: RequestContextService for use by domain modules
- Configures: CorrelationIdMiddleware, RequestLoggingMiddleware

### Domain Modules
- VERIFY: EM-LMOD-001 — ListingsModule with full CRUD
- VERIFY: EM-TMOD-001 — TransactionsModule with full CRUD
- VERIFY: EM-EMOD-001 — EscrowsModule with full CRUD
- VERIFY: EM-DMOD-001 — DisputesModule with full CRUD

### Domain Services
- VERIFY: EM-LSVC-001 — ListingsService implements CRUD operations
- VERIFY: EM-TSVC-001 — TransactionsService implements CRUD operations
- VERIFY: EM-ESVC-001 — EscrowsService implements CRUD operations
- VERIFY: EM-DSVC-001 — DisputesService implements CRUD operations

### Main Bootstrap
- VERIFY: EM-MAIN-001 — Main.ts configures Helmet, CORS, ValidationPipe

## Middleware Pipeline

Request flow:
1. Helmet (security headers)
2. CORS (origin validation)
3. CorrelationIdMiddleware (assigns/preserves correlation ID)
4. RequestLoggingMiddleware (logs request with correlation ID)
5. ThrottlerGuard (rate limiting)
6. ValidationPipe (DTO validation)
7. JwtAuthGuard (authentication on domain routes)
8. ResponseTimeInterceptor (timing)
9. GlobalExceptionFilter (error handling)

## Frontend Architecture

- VERIFY: EM-LAYO-001 — Layout with Nav component
- VERIFY: EM-NAV-001 — Navigation links to all domain routes
- VERIFY: EM-ACT-001 — Server actions check response.ok
- Server Actions for form submissions (response.ok checks)
- Error boundaries with useRef focus management
- Loading states with role="status" and aria-busy

### Frontend Pages
- VERIFY: EM-WLST-001 — Listings page with table display
- VERIFY: EM-WLSTL-001 — Listings loading state with skeleton
- VERIFY: EM-WLSTE-001 — Listings error boundary with focus
- VERIFY: EM-WTRX-001 — Transactions page with table display
- VERIFY: EM-WTRXL-001 — Transactions loading state with skeleton
- VERIFY: EM-WTRXE-001 — Transactions error boundary with focus
- VERIFY: EM-WESC-001 — Escrows page with table display
- VERIFY: EM-WESCL-001 — Escrows loading state with skeleton
- VERIFY: EM-WESCE-001 — Escrows error boundary with focus
- VERIFY: EM-WDSP-001 — Disputes page with table display
- VERIFY: EM-WDSPL-001 — Disputes loading state with skeleton
- VERIFY: EM-WDSPE-001 — Disputes error boundary with focus
- VERIFY: EM-WLOG-001 — Login page with form
- VERIFY: EM-WLOGL-001 — Login loading state with skeleton
- VERIFY: EM-WLOGE-001 — Login error boundary with focus

### Frontend API Layer
- VERIFY: EM-API-001 — API helpers import from shared package

## Deployment

- Multi-stage Dockerfile (deps, build, production)
- Docker Compose with PostgreSQL 16
- CI/CD via GitHub Actions

## Cross-References

See [monitoring.md](./monitoring.md) for middleware details.
See [data-model.md](./data-model.md) for entity relationships.
