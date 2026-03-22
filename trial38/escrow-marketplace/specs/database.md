# Database Specification

## Overview

PostgreSQL 16 with Prisma 6 ORM. All monetary fields use Decimal(12,2) -- never Float. Row-Level Security (RLS) is enabled and forced on all tables via migration SQL.

## Models

### Tenant
- `id` (UUID, PK, default uuid)
- `name` (String, VarChar(100))
- `createdAt`, `updatedAt` (DateTime)
- Maps to: `tenants` via @@map

### User
- `id` (UUID, PK, default uuid)
- `email` (String, VarChar(255))
- `name` (String, VarChar(100))
- `password` (String, hashed with bcrypt)
- `role` (UserRole enum)
- `balance` (Decimal @db.Decimal(12,2))
- `tenantId` (FK -> Tenant, mapped to tenant_id)
- Unique constraint: `@@unique([email, tenantId])`
- Index: `@@index([tenantId])`
- Maps to: `users` via @@map

### Listing
- `id` (UUID, PK, default uuid)
- `title` (String, VarChar(100)), `slug` (String, VarChar(120)), `description` (String, VarChar(1000))
- `price` (Decimal @db.Decimal(12,2))
- `status` (ListingStatus enum, default ACTIVE)
- `sellerId` (FK -> User, mapped to seller_id)
- `tenantId` (FK -> Tenant, mapped to tenant_id)
- Index: `@@index([tenantId, status])`, `@@index([sellerId])`
- Maps to: `listings` via @@map

### Transaction
- `id` (UUID, PK, default uuid)
- `amount` (Decimal @db.Decimal(12,2))
- `status` (TransactionStatus enum, default PENDING)
- `buyerId` (FK -> User, mapped to buyer_id)
- `sellerId` (FK -> User, mapped to seller_id)
- `listingId` (FK -> Listing, mapped to listing_id)
- `tenantId` (FK -> Tenant, mapped to tenant_id)
- Index: `@@index([tenantId, buyerId])`, `@@index([tenantId, sellerId])`
- Maps to: `transactions` via @@map

### EscrowAccount
- `id` (UUID, PK, default uuid)
- `amount` (Decimal @db.Decimal(12,2))
- `transactionId` (FK -> Transaction, @unique, mapped to transaction_id)
- `tenantId` (FK -> Tenant, mapped to tenant_id)
- Maps to: `escrow_accounts` via @@map

### Dispute
- `id` (UUID, PK, default uuid)
- `reason` (String, VarChar(1000))
- `transactionId` (FK -> Transaction, mapped to transaction_id)
- `tenantId` (FK -> Tenant, mapped to tenant_id)
- Index: `@@index([transactionId])`
- Maps to: `disputes` via @@map

## Enum Mappings

All enums use @@map for PostgreSQL-level naming and @map on individual values:

- UserRole: ADMIN->admin, MANAGER->manager, SELLER->seller, BUYER->buyer (@@map: user_role)
- ListingStatus: ACTIVE->active, SOLD->sold, CANCELLED->cancelled, SUSPENDED->suspended (@@map: listing_status)
- TransactionStatus: PENDING->pending, COMPLETED->completed, DISPUTED->disputed, REFUNDED->refunded, FAILED->failed (@@map: transaction_status)

## Verification Tags

<!-- VERIFY: EM-DB-001 — All money fields Decimal(12,2) in Prisma schema -->
<!-- VERIFY: EM-DB-002 — RLS enabled and forced on all tables via migration -->
<!-- VERIFY: EM-DB-003 — All models use @@map for snake_case table names -->
<!-- VERIFY: EM-DB-004 — All enums use @@map with individual @map on values -->
<!-- VERIFY: EM-DB-005 — UUID primary keys on all models -->
<!-- VERIFY: EM-DB-006 — Tenant FK on all domain models -->
<!-- VERIFY: EM-DB-007 — Email unique per tenant constraint -->
<!-- VERIFY: EM-DB-008 — EscrowAccount unique transactionId -->

## Row-Level Security

All tables have RLS enabled and forced via migration SQL:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_name FORCE ROW LEVEL SECURITY;
```

PrismaService provides `setTenantContext(tenantId)` for RLS policy enforcement.

## Cross-References

- See [auth.md](auth.md) for email uniqueness within tenant and role definitions
- See [infrastructure.md](infrastructure.md) for database connection and migration config
