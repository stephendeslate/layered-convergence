# Architecture Specification

## System Overview
Analytics Engine is a Turborepo 2 monorepo with pnpm workspaces consisting of:
- **apps/api**: NestJS 11 backend with Prisma 6 ORM
- **apps/web**: Next.js 15 frontend with Tailwind CSS
- **packages/shared**: Shared constants, utilities, and types

## Module Structure

### Backend Modules
- **AuthModule**: JWT authentication, passport strategy, login/register controllers
- **DashboardsModule**: CRUD operations for dashboard management
- **DataSourcesModule**: CRUD operations for data source configuration
- **EventsModule**: CRUD operations for event ingestion and management
- **PipelinesModule**: CRUD operations for data pipeline configuration
- **MonitoringModule**: Health checks, metrics, logging, correlation IDs

### VERIFY:AE-ARCH-001 — AppModule wires all modules with DI-registered global providers

## Middleware Pipeline
Requests flow through the following middleware chain:
1. Helmet (CSP headers)
2. CORS validation
3. CorrelationIdMiddleware (generates/preserves X-Correlation-ID)
4. RequestLoggingMiddleware (structured request logging)
5. ThrottlerGuard (rate limiting via APP_GUARD)
6. JwtAuthGuard (authentication via APP_GUARD)
7. ValidationPipe (DTO validation)
8. ResponseTimeInterceptor (X-Response-Time via APP_INTERCEPTOR)
9. GlobalExceptionFilter (error handling via APP_FILTER)

See [monitoring.md](./monitoring.md) for details on correlation ID flow and logging.

## Dependency Graph
```
apps/api -> packages/shared
apps/web -> packages/shared
```

Both apps import >= 3 files from @analytics-engine/shared via workspace:* protocol.

## Frontend Architecture
- App Router with route groups for dashboards, data-sources, events, pipelines, login
- Each route has page.tsx, loading.tsx (role="status"), and error.tsx (role="alert")
- Root layout.tsx includes Nav component and global CSS
- Server Actions in actions.ts check response.ok
- Dynamic imports via next/dynamic for bundle optimization

### VERIFY:AE-UI-003 — Nav component renders in root layout with navigation links
### VERIFY:AE-UI-004 — Root layout sets metadata and renders Nav + children

## Build and Deployment
- Multi-stage Dockerfile: deps -> build -> production
- CI pipeline: lint, test, build, typecheck, migration-check, audit
- Docker Compose for local development with PostgreSQL 16
