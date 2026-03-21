# Data Model — Escrow Marketplace

## Overview

The data model centers on multi-tenant isolation with Tenant as the root entity.
All domain entities reference a Tenant for data isolation via Row-Level Security.

See also: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [API_CONTRACT.md](API_CONTRACT.md)

## Conventions

- [VERIFY:EM-DM-001] All Prisma models use @@map for SQL table name mapping -> Implementation: apps/api/prisma/schema.prisma:1
- [VERIFY:EM-DM-002] Multi-word columns use @map for snake_case SQL names -> Implementation: apps/api/prisma/schema.prisma:2
- [VERIFY:EM-DM-003] Transaction.amount uses Decimal(20,2) for precision -> Implementation: apps/api/prisma/schema.prisma:3
- [VERIFY:EM-DM-004] Payout.amount uses Decimal(20,2) for precision -> Implementation: apps/api/prisma/schema.prisma:4

## Entity Relationships

### Tenant (root)
- Has many: User, Transaction, Dispute, Payout, Webhook
- Primary isolation boundary for all data

### User
- Belongs to: Tenant
- Fields: id, email (unique), password (hashed), role, tenantId
- Role enum: BUYER, SELLER, ARBITER

### Transaction
- Belongs to: Tenant
- Has many: Dispute, Payout
- Fields: id, amount (Decimal 20,2), currency, status, buyerId, sellerId, description, tenantId
- Default status: PENDING

### Dispute
- Belongs to: Transaction, Tenant
- Fields: id, reason, status (DisputeStatus), resolution, transactionId, filedById, tenantId
- Default status: OPEN

### Payout
- Belongs to: Transaction, Tenant
- Fields: id, amount (Decimal 20,2), currency, recipientId, transactionId, processedAt, tenantId

### Webhook
- Belongs to: Tenant
- Fields: id, url, events (text[]), isActive, tenantId

## Enums

### Role
- BUYER — creates and funds transactions
- SELLER — receives payouts
- ARBITER — resolves disputes

### TransactionStatus
- PENDING -> FUNDED -> RELEASED (success path)
- PENDING -> FUNDED -> DISPUTED -> RELEASED | REFUNDED (dispute paths)
- RELEASED and REFUNDED are terminal states

### DisputeStatus
- OPEN -> UNDER_REVIEW -> RESOLVED | ESCALATED
- ESCALATED -> RESOLVED
- RESOLVED is a terminal state

## Indexes

- users.email: unique index
- All foreign keys are indexed by default via Prisma
