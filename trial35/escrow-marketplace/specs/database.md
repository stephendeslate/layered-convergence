# Database Schema

**Project:** escrow-marketplace
**Layer:** 5 — Monorepo
**Version:** 1.0.0
**Cross-references:** api.md, auth.md

---

## Overview

The database uses PostgreSQL 16 with Prisma 6 as the ORM. All models
use @@map for snake_case table names and @map for multi-word column names.
Row Level Security is enabled and forced on every table.

## Schema Design

The schema follows a multi-tenant architecture with tenant_id as a
foreign key on all domain entities. All models and enums include @@map
annotations to maintain consistent snake_case naming in the database.

Money fields (price, amount, balance) use Decimal @db.Decimal(12, 2)
to ensure precision. Float is never used for monetary values.

- VERIFY: EM-DB-001 — Schema defines generator and datasource
- VERIFY: EM-DB-002 — Tenant model with @@map("tenants")
- VERIFY: EM-DB-003 — User model with @@map("users") and Decimal balance
- VERIFY: EM-DB-005 — Listing model with @@map("listings") and Decimal price
- VERIFY: EM-DB-006 — Transaction model with @@map("transactions") and Decimal amount
- VERIFY: EM-DB-008 — Dispute model with @@map("disputes")

## Migration Strategy

Migrations are stored in prisma/migrations/ with SQL files that create
tables, indexes, foreign keys, and enable Row Level Security.

- VERIFY: EM-MIG-001 — Initial migration creates all tables with DECIMAL(12, 2)
- VERIFY: EM-MIG-002 — RLS enabled and forced on all tables

## Seed Data

The seed script creates a complete tenant with users, listings,
transactions in various statuses (including DISPUTED state),
and disputes (including resolved state) for development and testing.

- VERIFY: EM-SEED-001 — Seed creates tenant, users, entities with error states

## Model Relationships

- Tenant -> Users (1:N)
- Tenant -> Listings (1:N)
- Tenant -> Transactions (1:N)
- Tenant -> Disputes (1:N)
- User -> Listings (1:N, seller)
- User -> Transactions (1:N, buyer)
- User -> Disputes (1:N, filed_by)
- Listing -> Transactions (1:N)
- Transaction -> Disputes (1:N)

## Column Naming Convention

All multi-word columns use @map for snake_case:
- passwordHash -> password_hash
- tenantId -> tenant_id
- sellerId -> seller_id
- buyerId -> buyer_id
- listingId -> listing_id
- transactionId -> transaction_id
- filedById -> filed_by_id
- createdAt -> created_at
- updatedAt -> updated_at
- resolvedAt -> resolved_at

## Enum Mapping

All enums use @@map for snake_case type names in PostgreSQL:
- UserRole -> user_role
- ListingStatus -> listing_status
- TransactionStatus -> transaction_status
- DisputeStatus -> dispute_status
