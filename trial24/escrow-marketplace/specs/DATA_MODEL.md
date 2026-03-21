# Data Model — Escrow Marketplace

## Overview

The data model consists of 5 entities: User, Transaction, Dispute, Payout, and Webhook.
All models use PostgreSQL-native naming conventions via Prisma's `@@map` and `@map` directives.
Monetary fields use `Decimal(12,2)` for financial precision.

**Cross-references:** [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md), [API_CONTRACT.md](API_CONTRACT.md), [SECURITY_MODEL.md](SECURITY_MODEL.md)

## Naming Conventions

[VERIFY:DM-001] All Prisma models MUST use `@@map` for snake_case table names.
> Implementation: `backend/prisma/schema.prisma:41`

[VERIFY:DM-002] All multi-word columns MUST use `@map` for snake_case column names.
> Implementation: `backend/prisma/schema.prisma:47`

## Monetary Precision

[VERIFY:DM-003] All monetary fields (Transaction.amount, Payout.amount) MUST use `Decimal(12,2)`.
> Implementation: `backend/prisma/schema.prisma:60`

## Entity Definitions

### User
- `id` (UUID, primary key)
- `email` (unique)
- `password` (bcrypt hash)
- `name` (string)
- `role` (enum: BUYER | SELLER)
- `createdAt`, `updatedAt` (timestamps)

### Transaction
- `id` (UUID, primary key)
- `amount` (Decimal 12,2)
- `description` (string)
- `status` (enum: PENDING | FUNDED | SHIPPED | DELIVERED | COMPLETED | DISPUTE | REFUNDED)
- `buyerId`, `sellerId` (foreign keys to User)
- `createdAt`, `updatedAt` (timestamps)

### Dispute
- `id` (UUID, primary key)
- `reason` (string)
- `status` (enum: OPEN | RESOLVED)
- `transactionId` (foreign key to Transaction)
- `filedById` (foreign key to User)
- `resolvedAt` (nullable timestamp)
- `createdAt`, `updatedAt` (timestamps)

### Payout
- `id` (UUID, primary key)
- `amount` (Decimal 12,2)
- `status` (enum: PENDING | PROCESSING | COMPLETED | FAILED)
- `sellerId` (foreign key to User)
- `transactionId` (foreign key to Transaction)
- `processedAt` (nullable timestamp)
- `createdAt`, `updatedAt` (timestamps)

### Webhook
- `id` (UUID, primary key)
- `url` (string)
- `event` (string)
- `secret` (string)
- `active` (boolean, default true)
- `userId` (foreign key to User)
- `createdAt` (timestamp)

## Enums

[VERIFY:DM-004] The Role enum MUST contain only BUYER and SELLER (no ADMIN at database level).
> Implementation: `backend/prisma/schema.prisma:12`

[VERIFY:DM-005] The TransactionStatus enum MUST model the complete state machine including DISPUTE and REFUNDED branches.
> Implementation: `backend/prisma/schema.prisma:18`

[VERIFY:DM-006] The DisputeStatus enum MUST define the OPEN and RESOLVED states.
> Implementation: `backend/prisma/schema.prisma:28`

[VERIFY:DM-007] The PayoutStatus enum MUST define PENDING, PROCESSING, COMPLETED, and FAILED states.
> Implementation: `backend/prisma/schema.prisma:33`

## Relationships

- User has many Transactions (as buyer and seller via named relations)
- User has many Disputes (as filer)
- User has many Payouts (as seller)
- User has many Webhooks
- Transaction has many Disputes
- Transaction has many Payouts
- Dispute belongs to Transaction and User
- Payout belongs to Transaction and User

## Data Architecture

[VERIFY:DA-001] FORCE ROW LEVEL SECURITY MUST be applied to all tables in `prisma/rls.sql`.
> Implementation: `backend/prisma/rls.sql:12`

[VERIFY:DA-002] Transaction.amount and Payout.amount MUST both use Decimal(12,2) precision for financial accuracy.
> Implementation: `backend/prisma/schema.prisma:60`

## Migration Strategy

Initial migration creates all tables, enums, and constraints. RLS policies are applied
separately via `prisma/rls.sql` after migration execution.
