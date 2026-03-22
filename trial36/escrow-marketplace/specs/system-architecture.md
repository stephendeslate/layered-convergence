# System Architecture Specification

## Overview

The Escrow Marketplace is a multi-tenant platform enabling secure transactions between
buyers and sellers through an escrow mechanism. The system holds funds in escrow until
both parties confirm satisfaction, reducing fraud risk.

## Architecture Pattern

Turborepo monorepo with three packages:
- **apps/api** — NestJS REST API with Prisma ORM and PostgreSQL
- **apps/web** — Next.js 15 frontend with Server Actions
- **packages/shared** — Shared types, constants, and utilities

## Multi-Tenancy

Row-level security (RLS) enforced at the database layer. All tables include a `tenant_id`
foreign key. PostgreSQL RLS policies ensure tenants cannot access each other's data.

## Data Flow

1. User authenticates via JWT (bcrypt password hashing, 12 salt rounds)
2. Frontend issues Server Actions that call the API
3. API validates input via class-validator DTOs with strict length limits
4. Prisma executes parameterized queries (no raw SQL)
5. RLS policies filter results by tenant context

## Security Layers

See [security.md](./security.md) for the full threat model and controls.

- Helmet.js with CSP headers
- Rate limiting via @nestjs/throttler
- CORS restricted to configured origins
- Input sanitization via shared sanitizeInput utility
- All money fields use Decimal(12,2) to prevent floating-point errors

## Cross-References

- API endpoints: [api.md](./api.md)
- Database schema: [database.md](./database.md)
- Authentication: [auth.md](./auth.md)
- Security controls: [security.md](./security.md)

## Verification Tags

<!-- VERIFY: EM-ARCH-001 — Turborepo monorepo structure -->
<!-- VERIFY: EM-ARCH-002 — Multi-tenant RLS enforcement -->
<!-- VERIFY: EM-ARCH-003 — Server Actions for frontend-to-API communication -->
<!-- VERIFY: EM-ARCH-004 — Decimal(12,2) for all money fields -->
<!-- VERIFY: EM-ARCH-005 — Shared package types and utilities -->
<!-- VERIFY: EM-ARCH-006 — Environment variable fail-fast validation -->
