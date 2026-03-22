# Architecture Specification — Field Service Dispatch

## System Overview

Field Service Dispatch (FD) is a multi-tenant field service management
platform built as a Turborepo 2 monorepo with pnpm workspaces.

## Workspace Structure

- **apps/api** — NestJS 11 REST API with Prisma 6 ORM
- **apps/web** — Next.js 15 frontend with React 19 and Tailwind CSS 4
- **packages/shared** — Shared utilities, constants, and types

## Backend Architecture

The API follows NestJS modular architecture:

- **AppModule** — Root module registering global providers (APP_FILTER,
  APP_INTERCEPTOR, APP_GUARD) and configuring middleware
- **PrismaModule** — Global database access via PrismaService
- **AuthModule** — JWT authentication with Passport
- **MonitoringModule** — Health checks, metrics, logging, correlation IDs
- **Domain Modules** — WorkOrders, Technicians, Schedules, ServiceAreas

### Global Providers (registered in AppModule)

All global providers use NestJS DI registration pattern:

- `APP_FILTER` → GlobalExceptionFilter
- `APP_INTERCEPTOR` → ResponseTimeInterceptor
- `APP_GUARD` → ThrottlerGuard

### Middleware Pipeline

Middleware is applied via `NestModule.configure()` in AppModule:

1. CorrelationIdMiddleware — assigns/preserves X-Correlation-ID
2. RequestLoggingMiddleware — structured request/response logging

### Request-Scoped Context

RequestContextService (Scope.REQUEST) stores:
- correlationId — unique per request
- userId — from JWT payload (if authenticated)
- tenantId — from JWT payload (if authenticated)

## Frontend Architecture

Next.js 15 App Router with:
- Server Components for data fetching pages
- Client Components for interactive forms (login)
- Server Actions with 'use server' directive
- next/dynamic for bundle optimization
- Error boundaries with role="alert" and focus management
- Loading states with role="status" and aria-busy="true"

## Shared Package

Exports used by both apps (>= 3 imports each):
- createCorrelationId, formatLogEntry, sanitizeLogContext
- BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES
- MAX_PAGE_SIZE, normalizePageParams
- validateEnvVars, APP_VERSION

## Cross-References

- See [data-model.md](./data-model.md) for entity relationships
- See [monitoring.md](./monitoring.md) for observability details
- See [security.md](./security.md) for security architecture
