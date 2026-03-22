# Database Specification

## Overview

The Escrow Marketplace uses PostgreSQL 16 with Prisma 6 ORM. The database schema
defines 6 models with multi-tenant isolation, monetary precision, and Row-Level Security.

## Schema Models

1. **Tenant** — Root entity for multi-tenant isolation (id, name, timestamps)
2. **User** — Authentication entity (email, password, name, role, balance as Decimal(12,2))
3. **Listing** — Marketplace items (title, slug, description, price as Decimal(12,2), status)
4. **Transaction** — Purchase records (amount as Decimal(12,2), status, buyer/seller/listing refs)
5. **EscrowAccount** — Funds held in escrow (amount as Decimal(12,2), 1:1 with Transaction)
6. **Dispute** — Raised against transactions (reason, transaction ref)

## Prisma Service

- VERIFY: EM-DB-001 — PrismaService with OnModuleInit and OnModuleDestroy lifecycle hooks

## Naming Conventions

All models use @@map for snake_case table names. All enums use @@map with @map
on individual values. Column names use @map for snake_case (e.g., createdAt -> created_at).

## Monetary Fields

ALL monetary fields (User.balance, Listing.price, Transaction.amount, EscrowAccount.amount)
use `Decimal @db.Decimal(12, 2)`. Float is never used for money.

## Indexes

Database indexes are defined on all tenant-scoped foreign keys and status columns:
- users: @@index([tenantId])
- listings: @@index([tenantId, status]), @@index([sellerId])
- transactions: @@index([tenantId, buyerId]), @@index([tenantId, sellerId]), @@index([tenantId, status])
- escrow_accounts: @@index([tenantId])
- disputes: @@index([transactionId]), @@index([tenantId])

Composite indexes (tenantId + status, tenantId + buyerId, tenantId + sellerId) optimize
tenant-scoped queries that filter by status or user.

## Row-Level Security

RLS is enabled and forced on all 6 tables via the initial migration SQL.
This provides defense-in-depth beyond application-level tenant filtering.

## Query Optimization

- VERIFY: EM-DB-003 — List queries use Prisma select to avoid over-fetching
- VERIFY: EM-DB-004 — Detail queries use Prisma include for eager loading (N+1 prevention)

## Uniqueness Constraints

Users have a composite unique constraint: @@unique([email, tenantId]).
EscrowAccounts have a unique transactionId for 1:1 relationship enforcement.

## Cross-References

- See auth.md for email uniqueness per tenant
- See infrastructure.md for migration management and Docker PostgreSQL setup
- See performance.md for index strategy and query optimization patterns

- VERIFY: EM-DB-002 — @@map on all models and enums with @map on enum values
