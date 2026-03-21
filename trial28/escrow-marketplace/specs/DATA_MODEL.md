# Data Model — Escrow Marketplace

## Overview
The data model supports escrow transactions between buyers and sellers
with dispute resolution and payout tracking.

## Entities

### User
Platform participant with role-based access.
Fields: id, email (unique), passwordHash, role, createdAt, updatedAt.
Passwords hashed with bcrypt salt rounds of 12.
<!-- VERIFY:EM-USER-MODEL — User model with bcrypt salt 12 -->

### Transaction
Escrow payment between buyer and seller.
Fields: id, amount (Decimal 20,2), status, buyerId, sellerId, createdAt, updatedAt.
Amount uses Decimal precision to avoid floating-point errors.
<!-- VERIFY:EM-TRANSACTION-MODEL — Transaction model with Decimal amount -->

### Dispute
Conflict resolution record for a disputed transaction.
Fields: id, reason, status, transactionId, arbiterId, resolvedAt, createdAt, updatedAt.
<!-- VERIFY:EM-DISPUTE-MODEL — Dispute model with arbiter relation -->

### Payout
Payment record for completed transactions.
Fields: id, amount (Decimal 20,2), transactionId, userId, paidAt, createdAt.
<!-- VERIFY:EM-DECIMAL-FIELDS — Decimal type for monetary fields -->

### Webhook
External event notification configuration.
Fields: id, url, event, secret, active, createdAt, updatedAt.

## Enums
All enums use @@map for PostgreSQL naming:
- UserRole -> user_role
- TransactionStatus -> transaction_status
- DisputeStatus -> dispute_status
<!-- VERIFY:EM-ENUM-MAP — All enums have @@map -->

## Column Mapping
Multi-word columns use @map for snake_case:
- passwordHash -> password_hash
- buyerId -> buyer_id
- sellerId -> seller_id
- transactionId -> transaction_id
- arbiterId -> arbiter_id
- resolvedAt -> resolved_at
- paidAt -> paid_at
- createdAt -> created_at
- updatedAt -> updated_at
<!-- VERIFY:EM-COLUMN-MAP — @map on all multi-word columns -->

## Relationships
- User has many buyerTransactions and sellerTransactions
- User has many arbiterDisputes
- Transaction has many disputes and payouts
- Dispute belongs to Transaction and optionally to User (arbiter)

## Row Level Security
All tables have FORCE ROW LEVEL SECURITY in the migration SQL.
This provides database-level isolation independent of application logic.

## Indexes
- users.email: unique index for authentication lookups
