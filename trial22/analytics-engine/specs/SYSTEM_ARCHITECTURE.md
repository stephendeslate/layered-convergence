# System Architecture

## Overview

The Analytics Engine follows a layered architecture with clear separation between
the API layer (NestJS 11), the data layer (Prisma 6 + PostgreSQL 16), and the
presentation layer (Next.js 15 App Router).

## Backend Architecture

The backend is built on NestJS 11 with a modular structure. Each domain entity
has its own module containing a controller, service, and (where applicable) DTOs.

[VERIFY:SA-001] PostgreSQL 16 as primary data store -> Implementation: prisma/schema.prisma:6

[VERIFY:SA-002] NestJS 11 application bootstrap with validation pipeline -> Implementation: src/main.ts:2

[VERIFY:SA-003] Root AppModule wires all feature modules -> Implementation: src/app.module.ts:1

### Module Graph

```
AppModule
├── PrismaModule (global)
├── AuthModule
│   ├── JwtStrategy
│   ├── JwtAuthGuard
│   └── AuthService
├── TenantContextModule
├── DashboardModule
├── DataSourceModule
├── DataPointModule
├── PipelineModule
├── WidgetModule
├── EmbedModule
└── SyncRunModule
```

[VERIFY:SA-004] PrismaModule exported globally for dependency injection -> Implementation: src/prisma/prisma.module.ts:1

## Database Layer

The PrismaService extends PrismaClient and provides tenant context setting via
`$executeRaw` with `Prisma.sql` tagged templates. This is critical for RLS enforcement.

[VERIFY:SA-005] PrismaService sets tenant context via $executeRaw with Prisma.sql -> Implementation: src/prisma/prisma.service.ts:1

## Tenant Context Flow

1. User authenticates via JWT (see SECURITY_MODEL.md)
2. JWT payload contains `tenantId`
3. TenantContextMiddleware extracts tenantId from request
4. PrismaService.setTenantContext() sets PostgreSQL session variable
5. RLS policies filter all queries by tenant

[VERIFY:SA-006] TenantContextModule provides middleware for multi-tenant isolation -> Implementation: src/tenant-context/tenant-context.module.ts:1

## Feature Modules

Each feature module follows the same pattern:
- Module: wires controller and service
- Controller: HTTP endpoints with JWT guard
- Service: business logic with Prisma queries

[VERIFY:SA-007] AuthModule with JWT strategy and Passport integration -> Implementation: src/auth/auth.module.ts:1

[VERIFY:SA-008] DashboardModule for dashboard CRUD operations -> Implementation: src/dashboard/dashboard.module.ts:1

[VERIFY:SA-009] DataSourceModule for data source management -> Implementation: src/data-source/data-source.module.ts:1

[VERIFY:SA-010] DataPointModule for data point ingestion -> Implementation: src/data-point/data-point.module.ts:1

[VERIFY:SA-011] PipelineModule with state machine support -> Implementation: src/pipeline/pipeline.module.ts:1

[VERIFY:SA-012] WidgetModule for dashboard widget management -> Implementation: src/widget/widget.module.ts:1

[VERIFY:SA-013] EmbedModule for shareable dashboard tokens -> Implementation: src/embed/embed.module.ts:1

[VERIFY:SA-014] SyncRunModule with state machine transitions -> Implementation: src/sync-run/sync-run.module.ts:1

## Frontend Architecture

The frontend uses Next.js 15 App Router with server components by default.
All mutations go through Server Actions defined in `frontend/app/actions.ts`.
Every route segment has a `loading.tsx` (with `role="status"` and `aria-busy="true"`)
and an `error.tsx` (with `role="alert"`).

## Cross-References

- Data model details: see DATA_MODEL.md
- API endpoints: see API_CONTRACT.md
- Security architecture: see SECURITY_MODEL.md
- UI component catalog: see UI_SPECIFICATION.md
- Testing approach: see TESTING_STRATEGY.md
