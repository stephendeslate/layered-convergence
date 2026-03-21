# Data Model: Escrow Marketplace

## Overview

The Escrow Marketplace data model consists of 5 entities managing
financial transactions with dispute resolution.

## Entity Definitions

### User
[VERIFY:EM-014] Users have BUYER or SELLER roles. ADMIN is assigned only
by database administrators. Passwords hashed with bcrypt salt 12.

### Transaction
[VERIFY:EM-015] Transactions track escrow flow: PENDING -> FUNDED -> RELEASED
-> COMPLETED/REFUNDED. Amount stored as Decimal(12,2).

[VERIFY:EM-016] Each transaction links a buyer and seller via separate
foreign key relationships for clear party identification.

### Dispute
[VERIFY:EM-017] Disputes follow workflow: OPEN -> UNDER_REVIEW -> RESOLVED
/ESCALATED. Filed by a user against a specific transaction.

### Payout
[VERIFY:EM-018] Payouts track payment processing: PENDING -> PROCESSING ->
COMPLETED/FAILED. Amount stored as Decimal(12,2) for precision.

### Webhook
[VERIFY:EM-019] Webhooks store endpoint URLs, event subscriptions, and
shared secrets for payload verification.

## Relationships

- User 1:N Transaction (as buyer), 1:N Transaction (as seller)
- User 1:N Dispute (as filer)
- Transaction 1:N Dispute, 1:N Payout

## Mapping Conventions

[VERIFY:EM-020] All models use @@map for snake_case table names.
Multi-word columns use @map (e.g., buyer_id, seller_id, filed_by).

## Constraints and Validation

- Transaction amounts must be positive decimals
- Dispute can only be filed against funded or released transactions
- Payout amount must not exceed transaction amount
- Webhook URLs must be valid HTTPS endpoints
- User email must be unique across the platform

## Migration Strategy

Database schema is managed via Prisma migrations:
- Initial migration creates all 5 tables with indexes
- Foreign key constraints enforce referential integrity
- Enum types are stored as PostgreSQL native enums

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for ORM setup
- See [API_CONTRACT.md](./API_CONTRACT.md) for CRUD operations
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for data access policies
