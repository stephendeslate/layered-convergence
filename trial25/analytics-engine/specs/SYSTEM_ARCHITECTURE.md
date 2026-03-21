# System Architecture — Analytics Engine

## Overview

Analytics Engine follows a layered architecture with a NestJS 11 backend API, PostgreSQL database with Prisma 6 ORM, and a Next.js 15 frontend with server-side rendering.

## Component Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js 15    │────▶│   NestJS 11     │────▶│  PostgreSQL     │
│   Frontend      │     │   Backend API   │     │  + Prisma 6     │
│   (shadcn/ui)   │     │   (REST)        │     │  (RLS enabled)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Technology Stack

- **Backend:** NestJS 11, Prisma 6, PostgreSQL, JWT (passport-jwt), bcrypt
- **Frontend:** Next.js 15, React, Tailwind CSS 4, shadcn/ui components
- **Authentication:** JWT bearer tokens with passport strategy
- **Data Layer:** Prisma Client with `$executeRaw` + `Prisma.sql` for RLS context

See [DATA_MODEL.md](./DATA_MODEL.md) for the complete entity model and [SECURITY_MODEL.md](./SECURITY_MODEL.md) for the authentication flow.

## Module Structure

[VERIFY:SA-001] PrismaService extends PrismaClient and implements NestJS lifecycle hooks (OnModuleInit, OnModuleDestroy).
> Implementation: `backend/src/prisma/prisma.service.ts`

[VERIFY:SA-002] Pipeline state machine enforces valid transitions: DRAFT→ACTIVE→PAUSED→ARCHIVED with no backward transitions from ARCHIVED.
> Implementation: `backend/src/pipeline/pipeline.service.ts` (validTransitions map)

[VERIFY:SA-003] SyncRun state machine enforces: PENDING→RUNNING→COMPLETED/FAILED with terminal states.
> Implementation: `backend/src/sync-run/sync-run.service.ts` (validTransitions map)

[VERIFY:SA-004] Application bootstraps with fail-fast validation requiring JWT_SECRET and CORS_ORIGIN environment variables.
> Implementation: `backend/src/main.ts`

[VERIFY:SA-005] ValidationPipe configured with whitelist:true and forbidNonWhitelisted:true to strip/reject unknown properties.
> Implementation: `backend/src/main.ts`

## Deployment Model

The application deploys as two containers: a NestJS API server and a Next.js frontend server, both connecting to a shared PostgreSQL instance with RLS policies applied via migration scripts.

## Cross-References

- See [PRODUCT_VISION.md](./PRODUCT_VISION.md) for feature priorities
- See [API_CONTRACT.md](./API_CONTRACT.md) for REST endpoint specifications
- See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for test architecture
