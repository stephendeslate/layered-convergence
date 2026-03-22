# Database Specification

## Overview

PostgreSQL database with Prisma ^6.0.0 ORM. All tables have Row-Level Security
enabled and forced. All models use @@map for snake_case table names and @map
for snake_case column names.

## Models

### Tenant
- Primary key: UUID
- Fields: name (VarChar 100), timestamps
- One-to-many with: User, Listing, Transaction, EscrowAccount

### User
- Primary key: UUID
- Fields: email (VarChar 255), password, name (VarChar 100), role (UserRole enum),
  balance (Decimal 12,2), tenantId
- Composite unique: [email, tenantId]
- Relations: tenant, listings, buyerTransactions, sellerTransactions

### Listing
- Primary key: UUID
- Fields: title (VarChar 100), slug (VarChar 120), description (VarChar 1000),
  price (Decimal 12,2), status (ListingStatus enum), sellerId, tenantId
- Relations: seller, tenant, transactions

### Transaction
- Primary key: UUID
- Fields: amount (Decimal 12,2), status (TransactionStatus enum),
  buyerId, sellerId, listingId, tenantId
- Relations: buyer, seller, listing, tenant, escrowAccount

### EscrowAccount
- Primary key: UUID
- Fields: amount (Decimal 12,2), transactionId (unique), tenantId
- Relations: transaction, tenant

## Enums

All enums use @@map for snake_case type names and individual @map on each value
for lowercase database representation.

- UserRole: ADMIN, MANAGER, SELLER, BUYER
- ListingStatus: ACTIVE, SOLD, CANCELLED, SUSPENDED
- TransactionStatus: PENDING, COMPLETED, DISPUTED, REFUNDED, FAILED

## Row-Level Security

RLS is enabled and forced on all five tables via migration SQL:
- ALTER TABLE ... ENABLE ROW LEVEL SECURITY
- ALTER TABLE ... FORCE ROW LEVEL SECURITY

## Money Fields

All monetary values use Decimal @db.Decimal(12, 2) in the Prisma schema
and DECIMAL(12,2) in the migration SQL. This ensures precise financial
calculations without floating-point errors.

## Cross-References

- API usage: [api.md](./api.md)
- Security: [security.md](./security.md)
- Auth constraints: [auth.md](./auth.md)

## Verification Tags

<!-- VERIFY: EM-DB-001 — All money fields Decimal(12,2) -->
<!-- VERIFY: EM-DB-002 — RLS enabled and forced on all tables -->
<!-- VERIFY: EM-DB-003 — All models use @@map -->
<!-- VERIFY: EM-DB-004 — All enums use @@map with individual @map on values -->
<!-- VERIFY: EM-DB-005 — UUID primary keys on all models -->
<!-- VERIFY: EM-DB-006 — Tenant FK on all domain models -->
<!-- VERIFY: EM-DB-007 — Email unique per tenant constraint -->
<!-- VERIFY: EM-DB-008 — EscrowAccount unique transactionId -->
