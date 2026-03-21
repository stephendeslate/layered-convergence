# System Architecture -- Field Service Dispatch

## Overview

Field Service Dispatch follows a layered architecture with a NestJS 11 backend API, PostgreSQL database with Prisma 6 ORM, and a Next.js 15 frontend with server-side rendering.

## Component Diagram

```
+-------------------+     +-------------------+     +-------------------+
|   Next.js 15      |---->|   NestJS 11       |---->|  PostgreSQL       |
|   Frontend        |     |   Backend API     |     |  + Prisma 6       |
|   (shadcn/ui)     |     |   (REST)          |     |  (RLS enabled)    |
+-------------------+     +-------------------+     +-------------------+
```

## Technology Stack

- **Backend:** NestJS 11, Prisma 6, PostgreSQL, JWT (passport-jwt), bcrypt
- **Frontend:** Next.js 15, React, Tailwind CSS 4, shadcn/ui components
- **Authentication:** JWT bearer tokens with passport strategy
- **Data Layer:** Prisma Client with `$executeRaw` + `Prisma.sql` for RLS context

See [DATA_MODEL.md](./DATA_MODEL.md) for the entity model and [SECURITY_MODEL.md](./SECURITY_MODEL.md) for authentication.

## Module Structure

[VERIFY:SA-001] PrismaService extends PrismaClient and implements NestJS lifecycle hooks (OnModuleInit, OnModuleDestroy).
> Implementation: `backend/src/prisma/prisma.service.ts`

[VERIFY:SA-002] WorkOrder state machine enforces: CREATED->ASSIGNED->IN_PROGRESS->COMPLETED/CANCELLED with terminal states.
> Implementation: `backend/src/work-order/work-order.service.ts` (validTransitions map)

[VERIFY:SA-003] Invoice state machine enforces: DRAFT->SENT->PAID/OVERDUE with terminal states.
> Implementation: `backend/src/invoice/invoice.service.ts` (validTransitions map)

[VERIFY:SA-004] Route state machine enforces: PLANNED->IN_PROGRESS->COMPLETED with terminal states.
> Implementation: `backend/src/route/route.service.ts` (validTransitions map)

[VERIFY:SA-005] Application bootstraps with fail-fast validation requiring JWT_SECRET and CORS_ORIGIN.
> Implementation: `backend/src/main.ts`

[VERIFY:SA-006] ValidationPipe configured with whitelist:true and forbidNonWhitelisted:true.
> Implementation: `backend/src/main.ts`

## Deployment Model

Two containers: NestJS API server and Next.js frontend, connected to shared PostgreSQL with RLS.

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature priorities
- See [API_CONTRACT.md](./API_CONTRACT.md) for REST endpoint specifications
