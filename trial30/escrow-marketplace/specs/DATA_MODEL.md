# Data Model — Escrow Marketplace

## Overview
The Escrow Marketplace data model consists of 5 entities supporting
secure escrow transactions. See SYSTEM_ARCHITECTURE.md for how these
entities are used and PRODUCT_VISION.md for business context.

## User Model
<!-- VERIFY:EM-USER-MODEL — User model with bcrypt salt 12 -->
The User entity stores authentication credentials with bcrypt-hashed
passwords (salt rounds: 12). Users have one of four roles (BUYER,
SELLER, ARBITER, ADMIN) and are uniquely identified by email.

Fields: id (cuid), email (unique), passwordHash, role, createdAt, updatedAt.

## Transaction Model
<!-- VERIFY:EM-TRANSACTION-MODEL — Transaction model with TransactionStatus -->
Transactions represent escrow agreements between a buyer and seller.
Each transaction tracks amount, currency, status, and description.

Fields: id (cuid), amount (Decimal 20,2), currency (default USD),
status (TransactionStatus), description, buyerId, sellerId, createdAt, updatedAt.

## Dispute Model
Disputes are filed against transactions when buyers are dissatisfied.
Each dispute has a reason, status, optional resolution, and reference
to the filing user and transaction.

Fields: id (cuid), reason, status (DisputeStatus), resolution (optional),
transactionId, filedById, createdAt, updatedAt.

## Payout Model
Payouts record fund disbursements from completed transactions.
Each payout tracks amount, method, reference, and recipient.

<!-- VERIFY:EM-DECIMAL-FIELDS — Decimal type for amount fields -->
All monetary fields use Prisma Decimal type (20,2 precision) to
avoid floating-point rounding errors in financial calculations.

Fields: id (cuid), amount (Decimal 20,2), method, reference (optional),
transactionId, recipientId, createdAt.

## Webhook Model
Webhooks notify external systems of transaction state changes.
Each webhook records the target URL, event type, JSON payload,
and optional delivery timestamp.

Fields: id (cuid), url, event, payload, deliveredAt (optional),
transactionId, createdAt.

## Enum Definitions
<!-- VERIFY:EM-ENUM-MAP — All enums have @@map -->
All enums use @@map for snake_case PostgreSQL type names:
- UserRole (user_role): BUYER, SELLER, ARBITER, ADMIN
- TransactionStatus (transaction_status): PENDING, FUNDED, RELEASED, DISPUTED, REFUNDED
- DisputeStatus (dispute_status): OPEN, UNDER_REVIEW, RESOLVED, ESCALATED

## Column Mapping
<!-- VERIFY:EM-COLUMN-MAP — @map on multi-word columns -->
Multi-word columns use @map for snake_case naming:
- passwordHash -> password_hash
- buyerId -> buyer_id
- sellerId -> seller_id
- transactionId -> transaction_id
- filedById -> filed_by_id
- recipientId -> recipient_id
- deliveredAt -> delivered_at
- createdAt -> created_at
- updatedAt -> updated_at

## Relationships
- User 1:N Transaction (as buyer, via buyer_transactions relation)
- User 1:N Transaction (as seller, via seller_transactions relation)
- User 1:N Dispute (as filedBy)
- User 1:N Payout (as recipient)
- Transaction 1:N Dispute
- Transaction 1:N Payout
- Transaction 1:N Webhook
