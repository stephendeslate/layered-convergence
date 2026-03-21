# System Architecture — Escrow Marketplace

## Overview

The Escrow Marketplace is built as a Turborepo monorepo with pnpm workspaces, containing
a NestJS backend API, a Next.js frontend, and a shared TypeScript package.

See also: [PRODUCT_VISION.md](PRODUCT_VISION.md), [API_CONTRACT.md](API_CONTRACT.md), [SECURITY_MODEL.md](SECURITY_MODEL.md)

## Monorepo Structure

```
escrow-marketplace/
├── turbo.json              — Turborepo 2 pipeline configuration
├── pnpm-workspace.yaml     — Workspace definitions (apps/*, packages/*)
├── apps/
│   ├── api/                — NestJS 11 backend with Prisma 6
│   └── web/                — Next.js 15 frontend with shadcn/ui
└── packages/
    └── shared/             — Shared types, constants, utilities
```

## Backend Architecture

- [VERIFY:EM-SA-001] NestJS modules defined in app.module.ts -> Implementation: apps/api/src/app.module.ts:1
- [VERIFY:EM-SA-002] PrismaModule is global -> Implementation: apps/api/src/prisma/prisma.module.ts:4
- [VERIFY:EM-SA-003] JwtAuthGuard protects endpoints -> Implementation: apps/api/src/auth/jwt-auth.guard.ts:2

### Module Organization

| Module | Purpose |
|--------|---------|
| AuthModule | Registration, login, JWT issuance |
| TransactionModule | Escrow transaction CRUD + state machine |
| DisputeModule | Dispute filing and resolution |
| PayoutModule | Payout tracking and processing |
| WebhookModule | Webhook configuration management |
| TenantContextModule | RLS variable management |
| PrismaModule | Database client (global) |

## Frontend Architecture

- Next.js 15 App Router with server actions
- 8 shadcn/ui components (button, input, card, label, table, badge, select, dialog)
- [VERIFY:EM-SA-006] 8 shadcn/ui components in web app -> Implementation: apps/web/components/ui/button.tsx:1
- [VERIFY:EM-SA-007] Skip-to-content link in root layout -> Implementation: apps/web/app/layout.tsx:2

## Shared Package

- validateTransition() — generic state machine validator
- formatCurrency() — locale-aware currency formatter
- TypeScript enums and DTOs shared between apps
- No circular dependencies (shared never imports from apps)

## Code Conventions

- [VERIFY:EM-SA-004] findFirst calls have justification comments -> Implementation: apps/api/src/transaction/transaction.service.ts:4
- [VERIFY:EM-SA-005] @@map on all Prisma models -> Implementation: apps/api/prisma/schema.prisma:8
- Zero `as any` casts in production code
- Zero `console.log` in production code
- All raw queries use `Prisma.sql` tagged template (never `$executeRawUnsafe`)
