# System Architecture — Field Service Dispatch

## Overview

Field Service Dispatch is built as a Turborepo monorepo with pnpm workspaces. The backend
uses NestJS 11 with Prisma 6 ORM and PostgreSQL 16. The frontend uses Next.js 15 with
shadcn/ui components and Tailwind CSS 4.

See also: [PRODUCT_VISION.md](PRODUCT_VISION.md), [SECURITY_MODEL.md](SECURITY_MODEL.md)

## Monorepo Structure

```
field-service-dispatch/
  turbo.json            — Turborepo 2 pipeline configuration
  pnpm-workspace.yaml   — Workspace definitions
  apps/
    api/                — NestJS 11 backend
    web/                — Next.js 15 frontend
  packages/
    shared/             — Shared types, constants, utilities
```

## Backend Architecture

### Module Structure
The NestJS application is organized into feature modules:
- AuthModule — JWT authentication and user registration
- PrismaModule — Database access layer (global)
- WorkOrderModule — Work order CRUD and state machine
- CustomerModule — Customer management
- TechnicianModule — Technician management with availability
- RouteModule — Route planning
- GpsEventModule — GPS event ingestion
- InvoiceModule — Invoice management with payment tracking
- CompanyContextModule — RLS variable management

- [VERIFY:FD-SA-001] NestJS modules defined in app.module.ts -> Implementation: apps/api/src/app.module.ts:1
- [VERIFY:FD-SA-002] PrismaModule is global -> Implementation: apps/api/src/prisma/prisma.module.ts:1
- [VERIFY:FD-SA-003] JwtAuthGuard protects endpoints -> Implementation: apps/api/src/auth/jwt-auth.guard.ts:1

### Shared Package
The shared package (@field-service-dispatch/shared) exports:
- TypeScript enums: Role, WorkOrderStatus, Priority
- DTOs: CompanyDto, UserDto, CustomerDto, TechnicianDto, WorkOrderDto, RouteDto, GpsEventDto, InvoiceDto
- Constants: REGISTERABLE_ROLES, WORK_ORDER_STATUSES, PRIORITIES, WORK_ORDER_TRANSITIONS
- validateTransition() — generic state machine validator
- formatCurrency() — locale-aware currency formatter

- [VERIFY:FD-SA-004] validateTransition used in work-order service -> Implementation: apps/api/src/work-order/work-order.service.ts:3

### Data Access
- Prisma 6 ORM with PostgreSQL 16
- All models use @@map for table names
- Multi-word columns use @map
- [VERIFY:FD-SA-005] @@map on all models -> Implementation: apps/api/prisma/schema.prisma:2
- [VERIFY:FD-SA-006] findFirst justification comments -> Implementation: apps/api/src/work-order/work-order.service.ts:6

## Frontend Architecture

### Stack
- Next.js 15 App Router with server actions
- Tailwind CSS 4 with @import syntax
- 8 shadcn/ui components: button, input, card, label, table, badge, select, dialog
- Dark mode via prefers-color-scheme media query

- [VERIFY:FD-SA-007] Skip-to-content link in layout -> Implementation: apps/web/app/layout.tsx:2
- [VERIFY:FD-SA-008] 8 shadcn/ui components -> Implementation: apps/web/components/ui/button.tsx:1

## Build Pipeline

Turborepo 2 manages the build pipeline with tasks:
- `build` — Compile all packages (dependsOn: ^build)
- `test` — Run tests (dependsOn: ^build)
- `lint` — Run linters
- `typecheck` — Type-check all packages
- `dev` — Development servers (cache: false, persistent: true)
