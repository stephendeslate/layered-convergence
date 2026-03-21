# Data Model — Escrow Marketplace

## Overview

The data model consists of five core entities supporting the escrow marketplace:
User, Transaction, Dispute, Payout, and Webhook. All models use Prisma 6 with
PostgreSQL 16, enforcing `@@map` on models and `@map` on columns.

See: [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for how the data layer fits into the overall system.
See: [SECURITY_MODEL.md](SECURITY_MODEL.md) for Row-Level Security policies on these tables.

<!-- VERIFY:DM-001 — All models use @@map for table names -->
<!-- VERIFY:DM-002 — All columns use @map for column names -->
<!-- VERIFY:DM-003 — Monetary values use Decimal(12,2) -->
<!-- VERIFY:DM-004 — Role enum contains only BUYER and SELLER -->
<!-- VERIFY:DM-005 — TransactionStatus enum matches state machine -->
<!-- VERIFY:DM-006 — RLS migration exists for user-scoped tables -->

## Entity Relationship Diagram

```
┌──────────┐       ┌──────────────┐       ┌──────────┐
│  User    │──1:N──│ Transaction  │──1:N──│ Dispute  │
│          │       │              │──1:1──│ Payout   │
└──────────┘       └──────────────┘       └──────────┘
                          │
                          1:N
                          │
                   ┌──────────────┐
                   │  Webhook     │
                   └──────────────┘
```

## Enums

### Role
```prisma
enum Role {
  BUYER
  SELLER
}
```
No ADMIN role exists. See [PRODUCT_VISION.md](PRODUCT_VISION.md) for rationale.

### TransactionStatus
```prisma
enum TransactionStatus {
  PENDING
  FUNDED
  SHIPPED
  DELIVERED
  COMPLETED
  DISPUTE
  REFUNDED
}
```
See [API_CONTRACT.md](API_CONTRACT.md) for which endpoints trigger each transition.

### DisputeStatus
```prisma
enum DisputeStatus {
  OPEN
  RESOLVED
}
```

## Models

### User
```prisma
model User {
  id        String   @id @default(uuid()) @map("id")
  email     String   @unique @map("email")
  password  String   @map("password")
  role      Role     @map("role")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  buyerTransactions  Transaction[] @relation("BuyerTransactions")
  sellerTransactions Transaction[] @relation("SellerTransactions")

  @@map("users")
}
```
- Password hashed with bcrypt, salt rounds = 12
- Role restricted to BUYER or SELLER via DTO validation

### Transaction
```prisma
model Transaction {
  id          String            @id @default(uuid()) @map("id")
  buyerId     String            @map("buyer_id")
  sellerId    String            @map("seller_id")
  amount      Decimal           @db.Decimal(12, 2) @map("amount")
  description String            @map("description")
  status      TransactionStatus @default(PENDING) @map("status")
  createdAt   DateTime          @default(now()) @map("created_at")
  updatedAt   DateTime          @updatedAt @map("updated_at")

  buyer    User      @relation("BuyerTransactions", fields: [buyerId], references: [id])
  seller   User      @relation("SellerTransactions", fields: [sellerId], references: [id])
  disputes Dispute[]
  payout   Payout?
  webhooks Webhook[]

  @@map("transactions")
}
```
- Amount uses Decimal(12,2) for precision. See [TESTING_STRATEGY.md](TESTING_STRATEGY.md) for decimal edge case tests.
- Status defaults to PENDING, transitions enforced in service layer

### Dispute
```prisma
model Dispute {
  id            String        @id @default(uuid()) @map("id")
  transactionId String        @map("transaction_id")
  filedBy       String        @map("filed_by")
  reason        String        @map("reason")
  status        DisputeStatus @default(OPEN) @map("status")
  resolution    String?       @map("resolution")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  transaction Transaction @relation(fields: [transactionId], references: [id])

  @@map("disputes")
}
```

### Payout
```prisma
model Payout {
  id            String   @id @default(uuid()) @map("id")
  transactionId String   @unique @map("transaction_id")
  recipientId   String   @map("recipient_id")
  amount        Decimal  @db.Decimal(12, 2) @map("amount")
  paidAt        DateTime @default(now()) @map("paid_at")
  createdAt     DateTime @default(now()) @map("created_at")

  transaction Transaction @relation(fields: [transactionId], references: [id])

  @@map("payouts")
}
```

### Webhook
```prisma
model Webhook {
  id            String   @id @default(uuid()) @map("id")
  transactionId String   @map("transaction_id")
  event         String   @map("event")
  payload       Json     @map("payload")
  deliveredAt   DateTime? @map("delivered_at")
  createdAt     DateTime @default(now()) @map("created_at")

  transaction Transaction @relation(fields: [transactionId], references: [id])

  @@map("webhooks")
}
```

## Row-Level Security

RLS policies are applied via migration to user-scoped tables (transactions,
disputes, payouts). See [SECURITY_MODEL.md](SECURITY_MODEL.md) for policy definitions.

```sql
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes FORCE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts FORCE ROW LEVEL SECURITY;
```
