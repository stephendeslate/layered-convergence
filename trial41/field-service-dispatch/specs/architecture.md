# Architecture Specification

## Overview

Field Service Dispatch (FSD) is a multi-tenant field service management platform
built as a Turborepo monorepo with three packages: API (NestJS 11), Web (Next.js 15),
and Shared (pure TypeScript utilities).

## Monorepo Structure

The project uses pnpm workspaces with Turborepo 2 for build orchestration.

- `apps/api/` — NestJS 11 backend with Prisma 6 ORM
- `apps/web/` — Next.js 15 frontend with React 19 and Tailwind CSS 4
- `packages/shared/` — Constants, pagination utilities, env validation

Both apps import at least 3 files from shared via workspace:* protocol.

<!-- VERIFY: FD-SHARED-EXPORTS — packages/shared/src/index.ts exports constants, pagination, env validation -->
<!-- VERIFY: FD-APP-MODULE — apps/api/src/app.module.ts registers all modules and providers -->

## Domain Model

The system manages four core entities for field service operations:

- **WorkOrder** — Service requests with GPS coordinates and priority
- **Technician** — Field workers with specialties and real-time location
- **Schedule** — Time-slot assignments linking technicians to work orders
- **ServiceArea** — Geographic coverage zones with zip codes and radius

See [data-model.md](./data-model.md) for schema details.
See [security.md](./security.md) for access control.

## Backend Architecture

NestJS modules follow a domain-driven structure. Each entity has its own module
with controller, service, and DTOs. The PrismaModule is global and provides
database access to all modules.

<!-- VERIFY: FD-PRISMA-SERVICE — apps/api/src/prisma/prisma.service.ts extends PrismaClient -->

## Frontend Architecture

Next.js 15 App Router with server components by default. Client components
are used only for interactive elements. shadcn/ui provides 8+ UI primitives.

The cn() utility uses clsx + tailwind-merge for className composition.

<!-- VERIFY: FD-CN-UTILITY — apps/web/lib/utils.ts uses clsx + twMerge -->
<!-- VERIFY: FD-LAYOUT-NAV — apps/web/src/app/layout.tsx renders Nav component -->
<!-- VERIFY: FD-NEXT-DYNAMIC — apps/web/src/app/layout.tsx uses next/dynamic for bundle optimization -->

## Key Design Decisions

1. Multi-tenant isolation via tenantId on all domain entities
2. GPS coordinates stored as Decimal(10,7) — never Float
3. Row Level Security enabled on all tables in migrations
4. Request-scoped context service for correlation ID propagation (T41)

## Integration Points

See [monitoring.md](./monitoring.md) for observability architecture.
See [performance.md](./performance.md) for optimization strategies.
