# Data Model — Escrow Marketplace

## Overview
The data model represents the core domain entities for escrow-based
marketplace transactions with dispute resolution.

See also: [PRODUCT_VISION.md](PRODUCT_VISION.md), [API_CONTRACT.md](API_CONTRACT.md)

## Entities

### User
<!-- VERIFY:EM-USER-MODEL -->
- id: cuid primary key
- email: unique, validated with @IsEmail
- passwordHash: bcrypt with salt 12, @map("password_hash")
- role: UserRole enum (BUYER, SELLER, ARBITER, ADMIN)
- createdAt, updatedAt: timestamps with @map

### Transaction
<!-- VERIFY:EM-TRANSACTION-MODEL -->
- id: cuid primary key
- amount: Decimal(20,2) for monetary precision
- currency: string, default USD
- status: TransactionStatus enum
- description: string
- buyerId, sellerId: foreign keys to User
- createdAt, updatedAt: timestamps

### Dispute
<!-- VERIFY:EM-DISPUTE-MODEL -->
- id: cuid primary key
- reason: string describing the dispute
- status: DisputeStatus enum
- resolution: optional string for resolved disputes
- transactionId: foreign key to Transaction
- arbiterId: optional foreign key to User
- createdAt, updatedAt: timestamps

## Monetary Fields
<!-- VERIFY:EM-DECIMAL-FIELDS -->
All monetary values use Prisma Decimal type with @db.Decimal(20,2).
Never uses Float type for financial calculations.

## Enum Mapping
<!-- VERIFY:EM-ENUM-MAP -->
All enums use @@map for PostgreSQL snake_case type names:
- UserRole -> user_role
- TransactionStatus -> transaction_status
- DisputeStatus -> dispute_status

## Column Mapping
<!-- VERIFY:EM-COLUMN-MAP -->
All multi-word columns use @map for snake_case:
- passwordHash -> password_hash
- buyerId -> buyer_id
- sellerId -> seller_id
- transactionId -> transaction_id
- arbiterId -> arbiter_id
- createdAt -> created_at
- updatedAt -> updated_at
- processedAt -> processed_at
- userId -> user_id
