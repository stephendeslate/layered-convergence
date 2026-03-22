# Data Model Specification

## Overview

The Escrow Marketplace uses PostgreSQL 16 with Prisma 6 ORM.
All models use UUID primary keys and snake_case table names via @@map.
Row-Level Security is enabled and forced on all tables.

## Models

### Tenant
Root entity for multi-tenant isolation. All other models reference tenantId.

### User
- email: String (unique per tenant via @@unique)
- password: String (bcrypt hashed)
- role: UserRole enum
- balance: Decimal(12,2) — NEVER Float

### Listing
- title, slug, description: String
- price: Decimal(12,2) — NEVER Float
- status: ListingStatus enum
- Relations: seller (User), tenant (Tenant), transactions (Transaction[])

### Transaction
- amount: Decimal(12,2) — NEVER Float
- status: TransactionStatus enum
- Relations: buyer, seller, listing, escrowAccount, disputes

### EscrowAccount
- amount: Decimal(12,2) — NEVER Float
- 1:1 with Transaction (unique transactionId)

### Dispute
- reason: String
- status: DisputeStatus enum
- Relations: transaction, tenant

## Enums

All enums use @@map for snake_case type names and @map on each value:
- UserRole: admin, manager, seller, buyer
- ListingStatus: active, sold, cancelled, suspended
- TransactionStatus: pending, completed, disputed, refunded, failed
- DisputeStatus: open, under_review, resolved, dismissed

## Indexes

- VERIFY: EM-DB-001 — Prisma service with lifecycle hooks
- VERIFY: EM-DB-002 — @@map on all models and enums with @map on enum values
- VERIFY: EM-DB-003 — Prisma select for optimized list queries
- VERIFY: EM-DB-004 — Prisma include for eager loading (N+1 prevention)

@@index directives on:
- All tenantId foreign keys
- Composite: [tenantId, status] on listings and transactions
- buyerId, sellerId on transactions
- transactionId on disputes

## Row-Level Security

All tables have ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY.
See [security.md](./security.md) for security policy details.

## Money Fields

CRITICAL: All monetary amounts use Decimal @db.Decimal(12, 2).
Using Float for money is a zero-tolerance violation.

## Migrations

Initial migration creates all tables, indexes, foreign keys, and RLS.
Located at `prisma/migrations/20240101000000_init/migration.sql`.

## Seed Data

Seed includes: tenant, admin, seller, buyer, listings (active + cancelled),
transactions (completed, failed, disputed), escrow accounts, disputes.
Error states are seeded for integration testing.
BCRYPT_SALT_ROUNDS imported from shared package (never hardcoded).
