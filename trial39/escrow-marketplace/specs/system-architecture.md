# System Architecture

## Overview

The Escrow Marketplace is built as a Turborepo 2 monorepo with pnpm workspaces.
The system comprises three packages: a NestJS API backend, a Next.js frontend,
and a shared TypeScript utility package.

## Monorepo Structure

The project uses Turborepo for orchestrating builds, tests, and type checks.
Root package.json declares `packageManager: pnpm@9.15.4` and turbo as a devDependency.

- VERIFY: EM-ARCH-001 — Shared package is part of the Turborepo monorepo under packages/shared

## Package Dependencies

Both apps/api and apps/web depend on `@escrow-marketplace/shared` via `workspace:*`.
The shared package exports types, constants, and utilities consumed by both apps.

## Data Flow

1. Frontend pages use Server Actions to fetch data from the API
2. API controllers validate requests via DTOs with class-validator
3. Services interact with Prisma to query the PostgreSQL database
4. Responses flow back through the controller to the frontend

## Module Architecture

The API is structured in NestJS modules: AuthModule, ListingsModule, TransactionsModule.
PrismaModule is globally scoped via @Global() decorator.

- VERIFY: EM-ARCH-005 — Shared package exports types, constants, and utilities

## Shared Package Contents

The shared package exports: types (Tenant, User, Listing, Transaction, EscrowAccount,
Dispute, PaginatedResult), enums (UserRole, ListingStatus, TransactionStatus),
constants (ALLOWED_REGISTRATION_ROLES, pagination constants, BCRYPT_SALT_ROUNDS,
TRANSACTION_STATUS_TRANSITIONS), and utilities (paginate, slugify, formatCurrency,
sanitizeInput, maskSensitive, truncateText, formatBytes, generateId, withTimeout,
normalizePageParams).

## Cross-References

- See database.md for Prisma schema and RLS configuration
- See auth.md for JWT authentication and role management
- See performance.md for response time and caching strategy

## Multi-Tenancy

Every domain entity includes a tenantId field. All queries are scoped by tenant.
Row-Level Security is enabled on all database tables for defense-in-depth.

- VERIFY: EM-ARCH-002 — Multi-tenant data isolation via tenantId on all entities
- VERIFY: EM-ARCH-003 — NestJS module architecture with global PrismaModule
- VERIFY: EM-ARCH-004 — Data flow from frontend Server Actions through API to database
- VERIFY: EM-ARCH-006 — Shared utility validation in page-level tests
