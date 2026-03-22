# System Architecture Specification

## Overview

The Escrow Marketplace is a multi-tenant platform built as a Turborepo monorepo.
It enables secure buyer-seller transactions through escrow accounts that hold
funds until both parties confirm satisfaction.

## Monorepo Structure

- **apps/api** — NestJS ^11.0.0 REST API with Prisma ^6.0.0 ORM
- **apps/web** — Next.js ^15.0.0 frontend with Server Actions and React ^19.0.0
- **packages/shared** — Shared types, constants, and utility functions

## Multi-Tenancy

All domain models include a `tenantId` foreign key referencing the Tenant model.
Row-Level Security (RLS) is enabled and forced on all tables in the database.
See [database.md](./database.md) for RLS implementation details.

## Data Flow

1. Frontend communicates with API through Server Actions
2. API validates input via DTOs with class-validator decorators
3. Prisma ORM handles database queries with parameterized statements
4. All money fields use Decimal(12,2) precision for financial accuracy

## Shared Package

The shared package exports types, constants, and utilities consumed by both apps.
New T37 utilities: `slugify` for URL-safe listing slugs, `truncateText` for
frontend text truncation. See [api.md](./api.md) for endpoint details.

## Environment Configuration

Required environment variables are validated at startup in main.ts:
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — Secret key for JWT token signing (no fallback)
- CORS_ORIGIN — Allowed CORS origin for frontend

## Security Overview

Security measures span all layers. See [security.md](./security.md) for the
complete threat model and [auth.md](./auth.md) for authentication details.

## Cross-References

- API endpoints: [api.md](./api.md)
- Database schema: [database.md](./database.md)
- Authentication: [auth.md](./auth.md)
- Security controls: [security.md](./security.md)

## Verification Tags

<!-- VERIFY: EM-ARCH-001 — Turborepo monorepo structure -->
<!-- VERIFY: EM-ARCH-002 — Multi-tenant RLS enforcement -->
<!-- VERIFY: EM-ARCH-003 — Fail-fast env validation -->
<!-- VERIFY: EM-ARCH-004 — Decimal(12,2) for all money fields -->
<!-- VERIFY: EM-ARCH-005 — Shared package types and utilities -->
<!-- VERIFY: EM-ARCH-006 — Environment variable fail-fast validation -->
