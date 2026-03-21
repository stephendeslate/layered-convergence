# Data Model Specification — Escrow Marketplace

## Overview

The data model consists of 8 entities with 3 enums, all using @@map for snake_case
database naming. Multi-tenancy is enforced via Row Level Security (RLS) on all tables.
See REQUIREMENTS.md for functional context and STATE_MACHINES.md for status transitions.

## Entities

### Tenant
Root entity for multi-tenancy. Has slug for URL-safe identification.
Related: User (1:N), Listing (1:N), Transaction (1:N), Dispute (1:N), AuditLog (1:N).

### User
Authenticated user. Roles: OWNER, ADMIN, BUYER, SELLER.
passwordHash stored with bcrypt salt 12. See AUTH_SPEC.md for details.

### Listing
Marketplace listing with title, slug, description, price, and status.
Belongs to a seller (User) and tenant. Has many Transactions.

### Transaction
Escrow transaction linking buyer to listing. Has amount and status.
State machine controls flow. See STATE_MACHINES.md.

### Dispute, EscrowAccount, PaymentMethod, AuditLog
Supporting entities for dispute resolution, escrow funds, payment methods, and audit trails.

## Schema Conventions

- VERIFY: EM-DA-MAP-001 — @@map on ALL models AND enums in schema.prisma
- VERIFY: EM-DA-TENANT-001 — TenantContext type exported from shared package
- VERIFY: EM-DA-STATE-001 — TransactionStatus type in shared package

## Prisma Service

- VERIFY: EM-DA-PRISMA-001 — PrismaService with RLS context in prisma.service.ts
- VERIFY: EM-DA-RLS-001 — $executeRaw with Prisma.sql for tenant context

## Row Level Security

The migration enables and forces RLS on all 8 tables for tenant isolation.
- VERIFY: EM-DA-RLS-002 — RLS ENABLE + FORCE on all tables in migration

## Seed Data

Seed creates tenant, users (seller + buyer), listings (active + sold), transactions
(completed + disputed), dispute with reason, and audit log entries.
- VERIFY: EM-SV-SEED-001 — Seed with tenant, users, entities, error/failure states
- VERIFY: EM-SV-SEED-002 — Error/failure state seed data (disputed transaction)

## Cross-References
- See AUTH_SPEC.md for user authentication and role validation
- See STATE_MACHINES.md for transaction status transitions
- See SECURITY.md for RLS and data isolation details
