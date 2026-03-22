# Database Specification

## Overview

PostgreSQL database with Prisma ORM. Row-level security (RLS) enabled on all tables.
All money fields use DECIMAL(12,2) to prevent floating-point precision errors.

## Models

### Tenant
- id: UUID (PK)
- name: String (max 100)
- createdAt, updatedAt: DateTime
- @@map("tenants")

### User
- id: UUID (PK)
- email: String (max 255, unique per tenant)
- password: String (hashed)
- name: String (max 100)
- role: UserRole enum
- balance: Decimal @db.Decimal(12, 2)
- tenantId: UUID (FK)
- createdAt, updatedAt: DateTime
- @@map("users")

### Listing
- id: UUID (PK)
- title: String (max 100)
- description: String (max 1000)
- price: Decimal @db.Decimal(12, 2)
- status: ListingStatus enum
- sellerId: UUID (FK to User)
- tenantId: UUID (FK)
- createdAt, updatedAt: DateTime
- @@map("listings")

### Transaction
- id: UUID (PK)
- amount: Decimal @db.Decimal(12, 2)
- status: TransactionStatus enum
- buyerId: UUID (FK to User)
- sellerId: UUID (FK to User)
- listingId: UUID (FK to Listing)
- tenantId: UUID (FK)
- createdAt, updatedAt: DateTime
- @@map("transactions")

### EscrowAccount
- id: UUID (PK)
- amount: Decimal @db.Decimal(12, 2)
- transactionId: UUID (FK, unique)
- tenantId: UUID (FK)
- createdAt, updatedAt: DateTime
- @@map("escrow_accounts")

## Enums

- UserRole: ADMIN, MANAGER, SELLER, BUYER → @@map("user_role")
- ListingStatus: ACTIVE, SOLD, CANCELLED, SUSPENDED → @@map("listing_status")
- TransactionStatus: PENDING, COMPLETED, DISPUTED, REFUNDED, FAILED → @@map("transaction_status")

## Row-Level Security

All tables have RLS ENABLE + FORCE. Policies restrict access by tenant_id.

## Verification Tags

<!-- VERIFY: EM-DB-001 — All money fields Decimal(12,2) -->
<!-- VERIFY: EM-DB-002 — RLS enabled and forced on all tables -->
<!-- VERIFY: EM-DB-003 — All models use @@map -->
<!-- VERIFY: EM-DB-004 — All enums use @@map -->
<!-- VERIFY: EM-DB-005 — UUID primary keys on all models -->
<!-- VERIFY: EM-DB-006 — Tenant FK on all domain models -->
<!-- VERIFY: EM-DB-007 — Email unique per tenant constraint -->
<!-- VERIFY: EM-DB-008 — EscrowAccount unique transactionId -->
