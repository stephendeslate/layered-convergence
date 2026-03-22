# Escrow Marketplace — Data Model Specification

## Overview

This document defines the Prisma schema, model relationships,
indexing strategy, and data type conventions.

## Models

<!-- VERIFY:EM-DATA-01 Prisma schema with Decimal money fields and snake_case mapping -->
<!-- VERIFY:EM-DATA-02 Prisma service with lifecycle hooks -->

All models use @@map for snake_case table names.
All enums use @@map for snake_case type names and @map on values.

### Tenant
- Multi-tenant root entity
- Fields: id, name, slug (unique), timestamps

### User
- Authentication entity with role-based access
- Fields: id, email (unique), passwordHash, role, tenantId
- Indexed on: tenantId, email

### Listing
- Marketplace item posted by sellers
- Fields: id, title, description, price (Decimal 12,2), status, sellerId, tenantId
- Indexed on: tenantId, status, (sellerId + status)

### Transaction
- Purchase record linking buyer, seller, and listing
- Fields: id, amount (Decimal 12,2), status, buyerId, sellerId, listingId, tenantId
- Indexed on: tenantId, status, (buyerId + status), (sellerId + status)

### Escrow
- Funds held during transaction lifecycle
- Fields: id, amount (Decimal 12,2), balance (Decimal 12,2), status, transactionId (unique), tenantId
- Indexed on: tenantId, status

### Dispute
- Contest filed against a transaction
- Fields: id, reason, resolution, status, transactionId, filerId, respondentId, tenantId
- Indexed on: tenantId, status, transactionId

## Money Fields

ALL money fields use Decimal @db.Decimal(12, 2). Float is never used.
This applies to: price, amount, balance.

## Enums

| Enum | Values | Table Map |
|------|--------|-----------|
| Role | ADMIN, BUYER, SELLER | role |
| ListingStatus | ACTIVE, SOLD, CANCELLED, SUSPENDED | listing_status |
| TransactionStatus | PENDING, IN_ESCROW, COMPLETED, CANCELLED, DISPUTED | transaction_status |
| EscrowStatus | HOLDING, RELEASED, REFUNDED, DISPUTED | escrow_status |
| DisputeStatus | OPEN, REVIEWING, RESOLVED, ESCALATED, CLOSED | dispute_status |

## Indexing Strategy

Indexes are placed on:
- All tenant foreign keys (for RLS and query performance)
- Status fields (for filtering)
- Composite indexes on frequently co-queried fields

## Row Level Security

<!-- VERIFY:EM-SEC-03 Enable Row Level Security on all tables -->

RLS is enabled and forced on all tables via the initial migration.

## Cross-References

- See [api.md](./api.md) for DTO field constraints derived from this schema
- See [performance.md](./performance.md) for query optimization patterns
