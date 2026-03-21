# Software Requirements Specification — Part 2: Database Schema
# Escrow Marketplace

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  BUYER
  PROVIDER
  ADMIN
}

enum TransactionStatus {
  CREATED
  PAYMENT_PENDING
  HELD
  RELEASED
  DISPUTED
  EXPIRED
  TRANSFER_PENDING
  TRANSFERRED
  PAYOUT_PENDING
  PAID
  RESOLVED_BUYER
  RESOLVED_PROVIDER
  REFUND_PENDING
  REFUNDED
}

enum DisputeStatus {
  OPEN
  EVIDENCE_SUBMITTED
  UNDER_REVIEW
  RESOLVED_BUYER
  RESOLVED_PROVIDER
  ESCALATED
}

enum OnboardingStatus {
  PENDING
  IN_PROGRESS
  ACTIVE
  RESTRICTED
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          UserRole
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  buyerTransactions    Transaction[]  @relation("BuyerTransactions")
  providerTransactions Transaction[]  @relation("ProviderTransactions")
  connectedAccount     StripeConnectedAccount?
  disputesRaised       Dispute[]
  payouts              Payout[]

  @@map("users")
}

model Transaction {
  id              String            @id @default(uuid())
  buyerId         String
  providerId      String
  amount          Int               // cents
  currency        String            @default("usd")
  description     String
  status          TransactionStatus @default(CREATED)
  platformFee     Int               @default(0) // cents
  holdUntil       DateTime?
  stripePaymentIntentId String?     @unique
  stripeTransferId      String?     @unique
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  buyer           User              @relation("BuyerTransactions", fields: [buyerId], references: [id])
  provider        User              @relation("ProviderTransactions", fields: [providerId], references: [id])
  stateHistory    TransactionStateHistory[]
  disputes        Dispute[]

  @@map("transactions")
}

model TransactionStateHistory {
  id            String   @id @default(uuid())
  transactionId String
  fromState     String
  toState       String
  reason        String?
  timestamp     DateTime @default(now())

  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  @@index([transactionId, timestamp])
  @@map("transaction_state_history")
}

model Dispute {
  id              String        @id @default(uuid())
  transactionId   String
  raisedBy        String
  reason          String
  description     String?
  evidence        Json          @default("[]") // array of evidence entries
  status          DisputeStatus @default(OPEN)
  resolution      String?
  resolvedAt      DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  transaction     Transaction   @relation(fields: [transactionId], references: [id])
  raisedByUser    User          @relation(fields: [raisedBy], references: [id])

  @@map("disputes")
}

model StripeConnectedAccount {
  id                String           @id @default(uuid())
  userId            String           @unique
  stripeAccountId   String           @unique
  onboardingStatus  OnboardingStatus @default(PENDING)
  chargesEnabled    Boolean          @default(false)
  payoutsEnabled    Boolean          @default(false)
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  user              User             @relation(fields: [userId], references: [id])

  @@map("stripe_connected_accounts")
}

model Payout {
  id                String   @id @default(uuid())
  providerId        String
  amount            Int      // cents
  currency          String   @default("usd")
  stripeTransferId  String?
  status            String   @default("pending") // pending, paid, failed
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  provider          User     @relation(fields: [providerId], references: [id])

  @@map("payouts")
}

model WebhookLog {
  id              String   @id @default(uuid())
  provider        String   @default("stripe")
  eventType       String
  eventId         String   @unique // Stripe event ID for idempotency
  payload         Json
  processedAt     DateTime?
  error           String?
  createdAt       DateTime @default(now())

  @@index([eventId])
  @@map("webhook_logs")
}
```

## 2. RLS Policies [VERIFY:RLS]

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_state_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- User can only see own data
CREATE POLICY user_isolation ON users
  USING (id = current_setting('app.current_user_id')::uuid);

-- Transactions visible to buyer or provider
CREATE POLICY transaction_isolation ON transactions
  USING (buyer_id = current_setting('app.current_user_id')::uuid
    OR provider_id = current_setting('app.current_user_id')::uuid);

-- State history visible through transaction
CREATE POLICY state_history_isolation ON transaction_state_history
  USING (transaction_id IN (
    SELECT id FROM transactions
    WHERE buyer_id = current_setting('app.current_user_id')::uuid
      OR provider_id = current_setting('app.current_user_id')::uuid
  ));

-- Disputes visible to involved parties
CREATE POLICY dispute_isolation ON disputes
  USING (transaction_id IN (
    SELECT id FROM transactions
    WHERE buyer_id = current_setting('app.current_user_id')::uuid
      OR provider_id = current_setting('app.current_user_id')::uuid
  ));

-- Connected accounts are provider-only
CREATE POLICY connected_account_isolation ON stripe_connected_accounts
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Payouts are provider-only
CREATE POLICY payout_isolation ON payouts
  USING (provider_id = current_setting('app.current_user_id')::uuid);

-- Webhook logs: admin only (no user-level access)
CREATE POLICY webhook_admin_only ON webhook_logs
  USING (current_setting('app.current_role') = 'ADMIN');
```

**Note:** Prisma connects as DB owner, bypassing RLS. RLS is defense-in-depth. Primary isolation is application-level WHERE clauses.

## 3. State Machine Definition (packages/shared) [VERIFY:STATE_MACHINE]

```typescript
// packages/shared/src/transaction-states.ts
export const TRANSACTION_STATES = {
  CREATED: 'CREATED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  HELD: 'HELD',
  RELEASED: 'RELEASED',
  DISPUTED: 'DISPUTED',
  EXPIRED: 'EXPIRED',
  TRANSFER_PENDING: 'TRANSFER_PENDING',
  TRANSFERRED: 'TRANSFERRED',
  PAYOUT_PENDING: 'PAYOUT_PENDING',
  PAID: 'PAID',
  RESOLVED_BUYER: 'RESOLVED_BUYER',
  RESOLVED_PROVIDER: 'RESOLVED_PROVIDER',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED',
} as const;

export const VALID_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['PAYMENT_PENDING'],
  PAYMENT_PENDING: ['HELD'],
  HELD: ['RELEASED', 'DISPUTED', 'EXPIRED'],
  EXPIRED: ['RELEASED'],
  RELEASED: ['TRANSFER_PENDING'],
  TRANSFER_PENDING: ['TRANSFERRED'],
  TRANSFERRED: ['PAYOUT_PENDING'],
  PAYOUT_PENDING: ['PAID'],
  DISPUTED: ['RESOLVED_BUYER', 'RESOLVED_PROVIDER'],
  RESOLVED_BUYER: ['REFUND_PENDING'],
  RESOLVED_PROVIDER: ['RELEASED'],
  REFUND_PENDING: ['REFUNDED'],
};
```

## 4. Prisma Query Convention [VERIFY:QUERY_CONVENTION]

| Method | Usage |
|--------|-------|
| `findFirstOrThrow` | Default for user-scoped lookups by ID |
| `findUniqueOrThrow` | When querying by unique constraint (email, stripeAccountId) |
| `findFirst` | Only when null is valid (e.g., check if dispute exists before creating) — requires `// findFirst justified:` comment |
| `findMany` | List operations — always scope by userId/role |
