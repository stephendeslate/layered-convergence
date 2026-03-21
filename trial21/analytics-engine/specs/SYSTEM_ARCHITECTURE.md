# System Architecture

## Overview

Analytics Engine follows a two-tier architecture: a Next.js 15 frontend (React Server
Components + Server Actions) communicating with a NestJS 11 REST API backend. PostgreSQL 16
provides persistent storage with Prisma 6 as the ORM and query builder. All inter-service
communication is synchronous HTTP.

## Component Diagram

```
┌─────────────────────────────────┐
│  Frontend (Next.js 15)          │
│  ├── Server Components (RSC)    │
│  ├── Server Actions (mutations) │
│  └── shadcn/ui (8 components)   │
└──────────┬──────────────────────┘
           │ HTTP (Bearer JWT)
           ▼
┌─────────────────────────────────┐
│  Backend (NestJS 11)            │
│  ├── Auth Module (JWT + bcrypt) │
│  ├── Feature Modules (CRUD)     │
│  ├── TenantContext (RLS setup)  │
│  └── Pipeline State Machine     │
└──────────┬──────────────────────┘
           │ Prisma Client
           ▼
┌─────────────────────────────────┐
│  PostgreSQL 16                  │
│  ├── RLS Policies (FORCE)       │
│  ├── Decimal(20,6) columns      │
│  └── @@map table annotations    │
└─────────────────────────────────┘
```

## Technology Choices

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend | Next.js | 15 | App Router, RSC, Server Actions |
| UI Library | shadcn/ui | latest | Accessible, composable components |
| CSS | Tailwind CSS | 4 | Utility-first, CSS custom properties |
| Backend | NestJS | 11 | Modular architecture, decorators, DI |
| ORM | Prisma | 6 | Type-safe queries, migrations |
| Database | PostgreSQL | 16 | RLS, Decimal types, mature ecosystem |
| Auth | JWT | - | Stateless, Bearer token in Authorization header |

## Data Access Layer

[VERIFY:SA-001] Prisma 6 MUST be used as the sole data access layer with typed schema.
> Implementation: `prisma/schema.prisma:1` — Prisma 6 provider configuration

[VERIFY:SA-002] The application MUST perform fail-fast validation of JWT_SECRET and CORS_ORIGIN at startup.
> Implementation: `src/main.ts:1-10` — bootstrap checks env vars before listen()

## Module Structure

[VERIFY:SA-003] The root AppModule MUST import all feature modules for proper dependency injection.
> Implementation: `src/app.module.ts:1` — imports array includes all feature modules

The backend is organized into feature modules following NestJS conventions:

- **AuthModule** — registration, login, JWT strategy, guard
- **DataSourceModule** — CRUD for external data connections
- **DataPointModule** — ingested data records with Decimal values
- **PipelineModule** — data processing pipelines with state machine
- **DashboardModule** — analytics dashboard containers
- **WidgetModule** — visualization widgets within dashboards
- **EmbedModule** — token-based public dashboard sharing
- **SyncRunModule** — data synchronization execution tracking
- **TenantContextModule** — RLS context propagation
- **PrismaModule** — global database client

## Pipeline State Machine

[VERIFY:SA-004] Pipeline transitions MUST follow the state machine: DRAFT->ACTIVE, ACTIVE->PAUSED, ACTIVE->DRAFT, PAUSED->ACTIVE, PAUSED->ARCHIVED, ARCHIVED->DRAFT.
> Implementation: `src/pipeline/pipeline.service.ts:1` — VALID_TRANSITIONS map

The pipeline state machine enforces governance over data processing workflows. Invalid
transitions return HTTP 400 (BadRequestException). The valid transitions are:

- DRAFT -> ACTIVE (pipeline is ready for data processing)
- ACTIVE -> PAUSED (temporarily halt processing)
- ACTIVE -> DRAFT (return to configuration mode)
- PAUSED -> ACTIVE (resume processing)
- PAUSED -> ARCHIVED (permanently archive)
- ARCHIVED -> DRAFT (reactivate archived pipeline)

## Embed System

[VERIFY:SA-005] Embeds MUST use token-based access with expiration date validation.
> Implementation: `src/embed/embed.service.ts:1` — findByToken checks expiresAt

Embeddable dashboard views are accessed via unique tokens without authentication. Each embed
has an `expiresAt` timestamp; requests for expired embeds receive a 404 NotFoundException.

## Deployment Model

The application is designed for container-based deployment:
- Frontend: Node.js container running Next.js in production mode
- Backend: Node.js container running NestJS compiled output
- Database: PostgreSQL 16 container (or managed service)
- Environment variables: `JWT_SECRET`, `CORS_ORIGIN`, `DATABASE_URL`

## Cross-References

- Data model details: [DATA_MODEL.md](./DATA_MODEL.md)
- API contract: [API_CONTRACT.md](./API_CONTRACT.md)
- Security model: [SECURITY_MODEL.md](./SECURITY_MODEL.md)
- Testing strategy: [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
