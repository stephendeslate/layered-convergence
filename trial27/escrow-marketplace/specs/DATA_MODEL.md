# Data Model: Escrow Marketplace

## Overview

The Escrow Marketplace data model consists of 5 entities designed for
secure financial transaction processing with dispute resolution.

## Entity Definitions

### All Entities
[VERIFY:EM-014] The Prisma schema defines all 5 entities: User, Transaction,
Dispute, Payout, and Webhook. Each entity has appropriate relationships
and uses UUID primary keys.

### Role Enum
[VERIFY:EM-015] The Role enum defines ADMIN, BUYER, SELLER, and ARBITER.
ADMIN is excluded from self-registration but available for administrative
user creation.

### User
[VERIFY:EM-016] Users have role-based access with four roles. Passwords are
stored as bcrypt hashes. Users can be buyers in some transactions and
sellers in others.

### Transaction State Machine
[VERIFY:EM-017] TransactionStatus enum defines the state machine:
PENDING, FUNDED, DELIVERED, RELEASED, DISPUTED, REFUNDED. Transitions
are validated at the service layer.

### Transaction Entity
[VERIFY:EM-018] Transaction entity uses Decimal(20,2) for escrow amounts
to prevent floating-point precision errors in financial calculations.
Each transaction links a buyer and seller.

### Dispute State Machine
[VERIFY:EM-019] DisputeStatus enum defines: OPEN, UNDER_REVIEW,
RESOLVED_BUYER, RESOLVED_SELLER. Disputes reference a transaction
and the user who filed them.

## Mapping Conventions

[VERIFY:EM-020] All models use @@map for snake_case table names and @map
for multi-word column names (buyer_id, seller_id, created_at, etc.).

## Relationships

- User 1:N Transaction (as buyer), Transaction (as seller), Dispute (as filer)
- Transaction 1:N Dispute, Payout
- Webhook is standalone for event notifications

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for ORM setup
- See [API_CONTRACT.md](./API_CONTRACT.md) for CRUD operations
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies
