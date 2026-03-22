# System Architecture

## Overview

The Escrow Marketplace is a multi-tenant SaaS platform built as a Turborepo monorepo with three packages:

- `apps/api` -- NestJS 11 REST API with Prisma 6 ORM
- `apps/web` -- Next.js 15 frontend with shadcn/ui components
- `packages/shared` -- Shared types, constants, and utilities

## Monorepo Structure

```
escrow-marketplace/
├── apps/
│   ├── api/          # NestJS 11 backend
│   └── web/          # Next.js 15 frontend
├── packages/
│   └── shared/       # Shared package
├── turbo.json        # Turborepo task config
├── pnpm-workspace.yaml
├── Dockerfile        # 3-stage production build
├── docker-compose.yml
└── specs/            # Specification documents
```

## Key Design Decisions

1. **Multi-tenancy via tenantId** -- Every entity includes a `tenantId` field; all queries filter by tenant for row-level isolation.
2. **Shared package** -- Types, constants (BCRYPT_SALT_ROUNDS, MAX_PAGE_SIZE), and utilities (paginate, clampPageSize, measureDuration) are centralized.
3. **State machine** -- Transaction status transitions are governed by TRANSACTION_STATUS_TRANSITIONS map, validated in the service layer.
4. **Escrow pattern** -- Each transaction creates an associated EscrowAccount to hold funds during the escrow period.
5. **Decimal for money** -- All monetary fields use Prisma Decimal(12,2), never Float.

## Verification Tags

<!-- VERIFY: EM-ARCH-001 — Shared package in Turborepo monorepo -->
<!-- VERIFY: EM-ARCH-002 — Multi-tenant RLS enforcement via Prisma -->
<!-- VERIFY: EM-ARCH-003 — Fail-fast env validation in main.ts -->
<!-- VERIFY: EM-ARCH-004 — Decimal(12,2) for all money fields -->
<!-- VERIFY: EM-ARCH-005 — Shared package types and utilities -->
<!-- VERIFY: EM-ARCH-006 — Environment variable fail-fast validation -->

## Module Dependency Graph

```
AppModule
├── AuthModule (JwtModule, PrismaModule)
├── ListingsModule (PrismaModule)
├── TransactionsModule (PrismaModule)
└── PrismaModule (global)
```

## Data Flow

1. Client sends request with JWT Bearer token
2. JwtAuthGuard validates token and extracts user (sub, role, tenantId)
3. Controller clamps pagination params, sets Cache-Control headers
4. Service applies tenant isolation (tenantId filter) on all queries
5. Prisma executes optimized queries (select/include for performance)
6. ResponseTimeInterceptor logs and sets X-Response-Time header

## Cross-References

- See [database.md](database.md) for Prisma schema and RLS details
- See [security.md](security.md) for Helmet, CORS, and rate limiting config
- See [frontend.md](frontend.md) for Next.js 15 integration with shared package
