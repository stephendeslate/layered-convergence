# Data Model — Escrow Marketplace

## Overview
The Escrow Marketplace data model captures users, transactions, disputes,
payouts, and webhooks. See SECURITY_MODEL.md for access control policies
and API_CONTRACT.md for endpoint mappings.

## User Model
<!-- VERIFY:EM-USER-MODEL — User model with bcrypt salt 12 -->
Users have email (unique), passwordHash (bcrypt salt 12), and role. The password
is never stored in plain text.

## Transaction Model
<!-- VERIFY:EM-DECIMAL-FIELDS — Decimal type for monetary amounts -->
Transaction amounts use Decimal(12,2) for precise monetary calculations.
Float types are never used for financial data.

<!-- VERIFY:EM-TRANSACTION-MODEL — Transaction model with TransactionStatus -->
Transactions track buyer_id and seller_id foreign keys, amount, currency,
status, and description.

## Dispute Model
<!-- VERIFY:EM-DISPUTE-MODEL — Dispute model with DisputeStatus -->
Disputes link to a transaction and optionally to an arbiter user. The resolution
field is populated when the dispute is resolved.

## Enum Mappings
<!-- VERIFY:EM-ENUM-MAP — All enums have @@map -->
All Prisma enums use @@map for snake_case PostgreSQL type names:
user_role, transaction_status, dispute_status.

## Column Mappings
<!-- VERIFY:EM-COLUMN-MAP — @map on multi-word columns -->
Multi-word column names use @map for snake_case: password_hash, buyer_id,
seller_id, transaction_id, arbiter_id, paid_at, delivered_at, created_at,
updated_at.

## Relationships
- User -> Transaction (buyer and seller relations)
- User -> Dispute (arbiter relation)
- User -> Payout (recipient)
- Transaction -> Dispute (one-to-many)
- Transaction -> Payout (one-to-many)
- Transaction -> Webhook (one-to-many)

## Seed Data
See SYSTEM_ARCHITECTURE.md for infrastructure and TESTING_STRATEGY.md for
test data requirements.
