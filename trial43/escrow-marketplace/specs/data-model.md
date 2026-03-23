# Data Model

## Overview

The Escrow Marketplace uses Prisma 6 with PostgreSQL 16 for data
persistence. All models use @@map for table names and all enums
use @@map with @map on values.

## Models

### Tenant
- id (UUID), name, slug (unique), timestamps
- Has many: users, listings, transactions, escrows, disputes
- @@map("tenants")

### User
- id (UUID), email (unique), passwordHash, name, role, tenantId
- Belongs to: tenant
- Has many: listings, buyerTransactions, sellerTransactions, disputes
- @@index on tenantId, role, and composite [tenantId, role]
- @@map("users")

### Listing
- id (UUID), title, description, price (Decimal 12,2), status, sellerId, tenantId
- VERIFY: EM-LDTO-001 — Listing DTO validates all string fields
- Belongs to: seller (User), tenant
- Has many: transactions
- @@index on tenantId, status, composite, sellerId
- @@map("listings")

### Transaction
- id (UUID), amount (Decimal 12,2), status, buyerId, sellerId, listingId, tenantId
- VERIFY: EM-TDTO-001 — Transaction DTO validates all string fields
- Belongs to: buyer, seller, listing, tenant
- Has many: escrows, disputes
- @@index on tenantId, status, composite, buyerId, sellerId
- @@map("transactions")

### Escrow
- id (UUID), amount (Decimal 12,2), balance (Decimal 12,2), status, transactionId, tenantId
- VERIFY: EM-EDTO-001 — Escrow DTO validates all string fields
- Belongs to: transaction, tenant
- @@index on tenantId, status, composite, transactionId
- @@map("escrows")

### Dispute
- id (UUID), reason, resolution (nullable), status, transactionId, raisedById, resolvedById (nullable), tenantId
- VERIFY: EM-DDTO-001 — Dispute DTO validates all string fields
- Belongs to: transaction, raisedBy (User), resolvedBy (User, optional), tenant
- @@index on tenantId, status, composite, transactionId
- @@map("disputes")

## Enums

All enums use @@map with @map on individual values:
- UserRole: ADMIN, BUYER, SELLER — @@map("user_role")
- ListingStatus: DRAFT, ACTIVE, SOLD, CANCELLED — @@map("listing_status")
- TransactionStatus: PENDING, COMPLETED, CANCELLED, DISPUTED — @@map("transaction_status")
- EscrowStatus: HELD, RELEASED, REFUNDED, DISPUTED — @@map("escrow_status")
- DisputeStatus: OPEN, REVIEWING, RESOLVED, ESCALATED — @@map("dispute_status")

## Money Fields

All monetary amounts use Decimal @db.Decimal(12, 2):
- Listing.price, Transaction.amount, Escrow.amount, Escrow.balance

## Row-Level Security

All tables have ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY

## VERIFY:EM-RAW-001 -- Raw SQL Operations

`TransactionsService.archiveCancelledByTenant` uses `$executeRaw(Prisma.sql\`...\`)`
for bulk archival of stale pending transactions. All raw SQL uses parameterized
queries via `Prisma.sql` tagged template literals to prevent SQL injection.
applied in the migration.

## Unit Test Coverage

- VERIFY: EM-TLST-001 — Listing service unit tests
- VERIFY: EM-TESC-001 — Escrow service unit tests

## Indexing Strategy

- VERIFY: EM-PRIS-001 — PrismaService handles connection lifecycle
- @@index on all tenant foreign keys for multi-tenant queries
- @@index on status fields for filtering
- Composite @@index on [tenantId, status] for common query patterns
- See [performance.md](./performance.md) for query optimization
