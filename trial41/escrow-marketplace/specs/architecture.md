# Escrow Marketplace — Architecture Specification

## Overview

The Escrow Marketplace is a multi-tenant platform for secure
buyer-seller transactions with escrow fund protection and
dispute resolution capabilities.

## Monorepo Structure

<!-- VERIFY:EM-ARCH-01 Turborepo monorepo with pnpm workspaces -->

The project uses Turborepo 2 with pnpm workspaces:
- `apps/api/` — NestJS 11 backend with Prisma 6
- `apps/web/` — Next.js 15 frontend with React 19
- `packages/shared/` — Pure TypeScript utilities

## Shared Package

<!-- VERIFY:EM-SHARED-01 shared constants and utilities -->
<!-- VERIFY:EM-SHARED-02 currency formatting utility -->
<!-- VERIFY:EM-SHARED-03 shared API response type -->

The shared package provides:
- Constants (BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES)
- Pagination utilities (normalizePageParams, MAX_PAGE_SIZE)
- Currency formatting (formatCurrency)
- Correlation ID generation
- Type definitions (ApiResponse, PaginatedResponse)

Both apps import >= 3 files from the shared package using
the workspace:* protocol.

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | NestJS | ^11.0.0 |
| ORM | Prisma | ^6.0.0 |
| Database | PostgreSQL | 16+ |
| Frontend | Next.js | ^15.0.0 |
| UI | React | ^19.0.0 |
| Styling | Tailwind CSS | ^4.0.0 |
| Components | shadcn/ui | Custom |
| Monorepo | Turborepo | ^2.3.0 |

## Domain Model

The platform centers on four domain entities:
1. **Listing** — Items posted by sellers
2. **Transaction** — Purchase agreements between buyer and seller
3. **Escrow** — Funds held during transaction
4. **Dispute** — Resolution process for contested transactions

## Multi-Tenancy

All entities are scoped by tenantId. Database queries use
findFirst with tenant scoping for data isolation.

## Deployment

<!-- VERIFY:EM-INFRA-01 Multi-stage Dockerfile -->

Multi-stage Docker build with node:20-alpine base.
PostgreSQL 16 via docker-compose with named volumes.
CI/CD via GitHub Actions with lint, test, build, typecheck,
migration-check, and audit jobs.

## Application Bootstrap

<!-- VERIFY:EM-APP-01 AppModule with all global providers registered via DI -->

The AppModule registers all global providers via NestJS DI:
- APP_GUARD: ThrottlerGuard, JwtAuthGuard
- APP_INTERCEPTOR: ResponseTimeInterceptor
- APP_FILTER: GlobalExceptionFilter
- APP_PIPE: ValidationPipe

## Frontend Components

<!-- VERIFY:EM-UI-01 cn utility with clsx + tailwind-merge -->
<!-- VERIFY:EM-UI-02 API client with error boundary logging -->
<!-- VERIFY:EM-UI-03 Server Actions with response.ok checking -->
<!-- VERIFY:EM-UI-04 shadcn/ui Button component -->
<!-- VERIFY:EM-UI-05 navigation component in layout -->
<!-- VERIFY:EM-UI-06 root layout with Nav -->
<!-- VERIFY:EM-UI-08 dynamic dashboard stats component -->

8+ shadcn/ui components with cn() using clsx + tailwind-merge.
Dark mode via @media prefers-color-scheme in globals.css.

## Cross-References

- See [data-model.md](./data-model.md) for entity definitions
- See [security.md](./security.md) for auth and access control
- See [monitoring.md](./monitoring.md) for observability
