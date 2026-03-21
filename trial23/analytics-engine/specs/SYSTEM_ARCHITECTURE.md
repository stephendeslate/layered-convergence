# System Architecture — Analytics Engine

## Overview

The Analytics Engine follows a layered architecture with a NestJS 11 backend API,
Next.js 15 frontend application, and PostgreSQL 16 database with Prisma 6 ORM.

## Backend Architecture

### NestJS Module Structure
The backend is organized into feature modules, each responsible for a domain entity:
- `AuthModule` — authentication and JWT token management
- `PipelineModule` — pipeline CRUD and state machine
- `DashboardModule` — dashboard management
- `DataSourceModule` — data source configuration
- `DataPointModule` — data point storage and retrieval
- `WidgetModule` — widget CRUD for dashboards
- `EmbedModule` — embed token management
- `SyncRunModule` — sync run tracking with state machine
- `TenantContextModule` — RLS context management
- `PrismaModule` — global database service

[VERIFY:SA-001] NestJS modules defined in app.module.ts -> Implementation: backend/src/app.module.ts:1
[VERIFY:SA-002] PrismaModule is global -> Implementation: backend/src/prisma/prisma.module.ts:4

### API Layer
Controllers handle HTTP requests, extract the tenant context from JWT claims,
and delegate to services. All endpoints (except embed token lookup) require
JWT authentication via `JwtAuthGuard`.

[VERIFY:SA-003] JwtAuthGuard protects authenticated endpoints -> Implementation: backend/src/auth/jwt-auth.guard.ts:4

### Service Layer
Services contain business logic including state machine validation, CRUD operations,
and tenant-scoped queries. Every `findFirst` call includes a justification comment
explaining why `findFirst` is used instead of `findUnique`.

[VERIFY:SA-004] findFirst calls have justification comments -> Implementation: backend/src/pipeline/pipeline.service.ts:38

### Database Layer
Prisma 6 provides type-safe database access. The schema uses `@@map` for table names
and `@map` for multi-word column names. Row-Level Security is applied to all
tenant-scoped tables.

[VERIFY:SA-005] All models use @@map for table names -> Implementation: backend/prisma/schema.prisma:44

## Frontend Architecture

### Next.js 15 App Router
The frontend uses the App Router with the following route segments:
- `/` — home page
- `/login` and `/register` — authentication
- `/dashboard`, `/data-sources`, `/pipelines` — main features
- `/widgets`, `/embeds`, `/sync-runs`, `/data-points` — secondary features

### Component Library
shadcn/ui provides 8 components: button, card, input, label, select, badge, table, dialog.
These are customized with CSS variables for theming support.

[VERIFY:SA-006] 8 shadcn/ui components in components/ui/ -> Implementation: frontend/components/ui/button.tsx:1

### Accessibility
Every route segment includes loading.tsx with role="status" and error.tsx with role="alert".
The root layout includes a skip-to-content link.

[VERIFY:SA-007] Skip-to-content link in root layout -> Implementation: frontend/app/layout.tsx:18

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for business requirements
- See [DATA_MODEL.md](./DATA_MODEL.md) for database schema details
- See [API_CONTRACT.md](./API_CONTRACT.md) for endpoint specifications
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for test organization
