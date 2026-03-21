# System Architecture — Escrow Marketplace

## Overview

The Escrow Marketplace uses a three-tier architecture: Next.js 15 frontend, NestJS 11 backend API,
and PostgreSQL 16 database with Prisma 6 ORM. Each tier is independently deployable and
communicates via REST API with JWT authentication.

**Cross-references:** [DATA_MODEL.md](DATA_MODEL.md), [SECURITY_MODEL.md](SECURITY_MODEL.md), [TESTING_STRATEGY.md](TESTING_STRATEGY.md)

## Component Topology

```
[Next.js 15 Frontend] --> [NestJS 11 API] --> [PostgreSQL 16]
        |                       |                    |
   App Router              Modules              Prisma 6 ORM
   Server Actions         Services               RLS Policies
   shadcn/ui             Controllers
```

[VERIFY:SA-001] The backend MUST use NestJS modular architecture with domain-separated modules.
> Implementation: `backend/src/app.module.ts:13`

[VERIFY:SA-002] PrismaService MUST wrap PrismaClient for dependency injection across all modules.
> Implementation: `backend/src/prisma/prisma.service.ts:5`

## State Machine Pattern

All stateful entities use explicit state machine patterns with validated transitions.
Invalid state transitions are rejected at the service layer before reaching the database.

[VERIFY:SA-003] State machine patterns MUST enforce business rules at the service layer.
> Implementation: `backend/src/transaction/transaction.service.ts:15`

## Module Dependency Graph

The application is organized into the following NestJS modules:

- **AuthModule** — Registration, login, JWT issuance
- **TransactionModule** — Escrow transaction lifecycle management
- **DisputeModule** — Dispute creation and resolution
- **PayoutModule** — Seller payout processing
- **WebhookModule** — Event subscription management
- **TenantContextModule** — RLS user context management
- **PrismaModule** — Database connection (global)

[VERIFY:SA-004] The module dependency graph MUST include Auth, Transaction, Dispute, Payout, and Webhook modules.
> Implementation: `backend/src/app.module.ts:13`

## Tenant Isolation

Multi-tenant isolation is achieved through PostgreSQL Row Level Security (RLS). The
TenantContextService sets the current user context before each database operation using
`$executeRaw` with `Prisma.sql` tagged templates.

[VERIFY:SA-005] The TenantContextService MUST use `$executeRaw` with `Prisma.sql` tagged templates in production code.
> Implementation: `backend/src/tenant-context/tenant-context.service.ts:7`

[VERIFY:SA-006] TenantContextModule MUST provide RLS integration across all domain modules.
> Implementation: `backend/src/app.module.ts:13`

## Deployment Model

- Frontend: Static export or Node.js server (Vercel, Docker)
- Backend: Node.js container with environment-based configuration
- Database: Managed PostgreSQL 16 with RLS enabled
- All environments require JWT_SECRET and CORS_ORIGIN environment variables

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 15.x |
| UI Components | shadcn/ui + Radix | Latest |
| Styling | Tailwind CSS | 4.x |
| Backend | NestJS | 11.x |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 16 |
| Auth | JWT + bcrypt | - |
