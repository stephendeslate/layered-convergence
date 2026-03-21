# Data Model — Escrow Marketplace

## Overview

The data model consists of 5 entities for secure escrow transactions. All models use `@@map` for PostgreSQL table names and `@map` for multi-word columns. Monetary fields use Decimal type.

See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for RLS policies and [API_CONTRACT.md](./API_CONTRACT.md) for endpoint mappings.

## Entity Definitions

### User
- Primary key: UUID
- Fields: email (unique), password (bcrypt hash), name, role
- Relations: has many Transactions (as buyer and seller), Disputes, Payouts, Webhooks

### Transaction
- Primary key: UUID
- Fields: buyer_id, seller_id, amount (Decimal), currency, status, description, escrow_fee (Decimal)
- State machine: PENDING → FUNDED → RELEASED → COMPLETED | REFUNDED

### Dispute
- Primary key: UUID
- Fields: transaction_id, filed_by_id, reason, status, resolution
- State machine: OPEN → UNDER_REVIEW → RESOLVED | ESCALATED

### Payout
- Primary key: UUID
- Fields: transaction_id, recipient_id, amount (Decimal), status, processed_at, failure_reason
- State machine: PENDING → PROCESSING → COMPLETED | FAILED

### Webhook
- Primary key: UUID
- Fields: url, secret, events (array), owner_id, is_active

## Verification Tags

[VERIFY:DM-001] All Prisma models use @@map for table names and @map for multi-word columns.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-002] Role enum defines ADMIN, BUYER, SELLER — registration excludes ADMIN via DTO validation.
> Implementation: `backend/prisma/schema.prisma` (enum) + `backend/src/auth/dto/register.dto.ts`

[VERIFY:DM-003] TransactionStatus enum implements PENDING, FUNDED, RELEASED, COMPLETED, REFUNDED states.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-004] DisputeStatus enum implements OPEN, UNDER_REVIEW, RESOLVED, ESCALATED states.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-005] PayoutStatus enum implements PENDING, PROCESSING, COMPLETED, FAILED states.
> Implementation: `backend/prisma/schema.prisma`

[VERIFY:DM-006] Transaction amount and escrow_fee use Decimal type (not Float).
> Implementation: `backend/prisma/schema.prisma` (Transaction model)

[VERIFY:DM-007] Payout amount uses Decimal type (not Float).
> Implementation: `backend/prisma/schema.prisma` (Payout model)

## Cross-References

- See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for state machine enforcement logic
- See [SECURITY_MODEL.md](./SECURITY_MODEL.md) for access control on each entity
