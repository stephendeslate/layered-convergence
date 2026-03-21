# Software Requirements Specification — Data Model (SRS-2)

## Escrow Marketplace — Conditional Payment Platform

| Field            | Value                          |
|------------------|--------------------------------|
| Version          | 1.0                            |
| Date             | 2026-03-20                     |
| Status           | Draft                          |
| Owner            | Platform Engineering           |
| Classification   | Internal                       |

> **Legal Notice:** This platform uses "payment hold" and "conditional release"
> terminology. Stripe Connect handles all money transmission. This is a demo
> application — no real funds are processed.

---

## 1. Overview

This document defines the complete data model for the Escrow Marketplace
platform. All entities are defined as Prisma 6 schema models targeting
PostgreSQL 16 with Row-Level Security (RLS). Monetary values are stored as
integers representing cents (USD) to avoid floating-point errors per §BR-11.

---

## 2. Enums

### 2.1 UserRole

```prisma
enum UserRole {
  BUYER
  PROVIDER
  ADMIN
}
```

| Value    | Description                                          | Traces To   |
|----------|------------------------------------------------------|-------------|
| BUYER    | Can create payment holds, confirm delivery, dispute  | §PVD 3.1    |
| PROVIDER | Can mark delivery, receive transfers, view payouts   | §PVD 3.2    |
| ADMIN    | Can resolve disputes, view analytics, manage platform| §PVD 3.3    |

### 2.2 TransactionStatus

```prisma
enum TransactionStatus {
  CREATED
  PAYMENT_HELD
  DELIVERED
  RELEASED
  PAID_OUT
  DISPUTED
  REFUNDED
  EXPIRED
  CANCELLED
}
```

| Value        | Description                                        | Traces To   |
|--------------|----------------------------------------------------|-------------|
| CREATED      | Transaction record created, payment pending        | §BR-35      |
| PAYMENT_HELD | PaymentIntent confirmed, funds held                | §BR-01      |
| DELIVERED    | Provider marked delivery complete                  | §BR-14      |
| RELEASED     | Funds transferred to provider (minus fee)          | §BR-17      |
| PAID_OUT     | Provider received bank payout                      | §BR-33      |
| DISPUTED     | Buyer filed dispute, funds frozen                  | §BR-19      |
| REFUNDED     | Funds returned to buyer (dispute resolution)       | §BR-24      |
| EXPIRED      | Payment hold expired (7 day limit)                 | §BR-04      |
| CANCELLED    | Transaction cancelled before payment               | —           |

### 2.3 DisputeStatus

```prisma
enum DisputeStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED_RELEASED
  RESOLVED_REFUNDED
  ESCALATED
  CLOSED
}
```

| Value              | Description                                    | Traces To   |
|--------------------|------------------------------------------------|-------------|
| OPEN               | Dispute filed, awaiting review                 | §BR-19      |
| UNDER_REVIEW       | Admin reviewing evidence                       | §BR-24      |
| RESOLVED_RELEASED  | Admin released funds to provider               | §BR-24      |
| RESOLVED_REFUNDED  | Admin refunded funds to buyer                  | §BR-24      |
| ESCALATED          | Flagged for external manual review             | §BR-26      |
| CLOSED             | Final state after resolution                   | §BR-25      |

### 2.4 DisputeReason

```prisma
enum DisputeReason {
  NOT_DELIVERED
  NOT_AS_DESCRIBED
  QUALITY_ISSUE
  LATE_DELIVERY
  COMMUNICATION_ISSUE
  OTHER
}
```

### 2.5 PayoutStatus

```prisma
enum PayoutStatus {
  PENDING
  IN_TRANSIT
  PAID
  FAILED
  CANCELLED
}
```

| Value      | Description                                        | Traces To   |
|------------|----------------------------------------------------|-------------|
| PENDING    | Payout created, not yet initiated                  | §BR-31      |
| IN_TRANSIT | Payout initiated, in banking system                | §BR-31      |
| PAID       | Payout successfully delivered                      | §BR-33      |
| FAILED     | Payout failed (bank rejection, etc.)               | §BR-34      |
| CANCELLED  | Payout cancelled before initiation                 | —           |

### 2.6 OnboardingStatus

```prisma
enum OnboardingStatus {
  NOT_STARTED
  PENDING
  COMPLETE
  RESTRICTED
}
```

| Value        | Description                                        | Traces To   |
|--------------|----------------------------------------------------|-------------|
| NOT_STARTED  | Provider has not begun Stripe onboarding           | §BR-27      |
| PENDING      | Onboarding started but not complete                | §BR-28      |
| COMPLETE     | All requirements met, can receive transfers        | §BR-27      |
| RESTRICTED   | Account restricted, needs additional information   | §BR-29      |

### 2.7 WebhookStatus

```prisma
enum WebhookStatus {
  RECEIVED
  PROCESSING
  PROCESSED
  FAILED
  SKIPPED
}
```

### 2.8 AuditAction

```prisma
enum AuditAction {
  TRANSACTION_CREATED
  PAYMENT_HELD
  DELIVERY_MARKED
  DELIVERY_CONFIRMED
  FUNDS_RELEASED
  FUNDS_REFUNDED
  PAYOUT_INITIATED
  PAYOUT_COMPLETED
  PAYOUT_FAILED
  DISPUTE_OPENED
  DISPUTE_EVIDENCE_ADDED
  DISPUTE_RESOLVED
  DISPUTE_ESCALATED
  HOLD_EXPIRED
  TRANSACTION_CANCELLED
  AUTO_RELEASE_TRIGGERED
  PROVIDER_ONBOARDED
  PROVIDER_RESTRICTED
}
```

---

## 3. Entity Definitions

### 3.1 User

```prisma
model User {
  id                String               @id @default(cuid())
  email             String               @unique
  passwordHash      String
  displayName       String
  role              UserRole
  emailVerified     Boolean              @default(false)
  emailVerifiedAt   DateTime?
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  // Relations
  connectedAccount  StripeConnectedAccount?
  buyerTransactions Transaction[]        @relation("BuyerTransactions")
  providerTransactions Transaction[]     @relation("ProviderTransactions")
  disputesFiled     Dispute[]            @relation("DisputesFiled")
  evidenceSubmitted DisputeEvidence[]
  auditEntries      TransactionStateHistory[] @relation("AuditActor")

  @@map("users")
}
```

**Field Details:**

| Field           | Type     | Constraints          | Description                          |
|-----------------|----------|----------------------|--------------------------------------|
| id              | String   | PK, CUID             | Unique user identifier               |
| email           | String   | Unique, indexed      | Login email                          |
| passwordHash    | String   | Not null             | bcrypt hashed password               |
| displayName     | String   | Not null             | Public display name                  |
| role            | UserRole | Not null             | BUYER, PROVIDER, or ADMIN            |
| emailVerified   | Boolean  | Default false        | Email verification status            |
| emailVerifiedAt | DateTime | Nullable             | When email was verified              |
| createdAt       | DateTime | Auto                 | Record creation timestamp            |
| updatedAt       | DateTime | Auto                 | Last update timestamp                |

**Indexes:**
- Primary: `id`
- Unique: `email`
- Index: `role` (for admin queries)

### 3.2 StripeConnectedAccount

```prisma
model StripeConnectedAccount {
  id                  String             @id @default(cuid())
  userId              String             @unique
  stripeAccountId     String             @unique
  onboardingStatus    OnboardingStatus   @default(NOT_STARTED)
  chargesEnabled      Boolean            @default(false)
  payoutsEnabled      Boolean            @default(false)
  detailsSubmitted    Boolean            @default(false)
  onboardingUrl       String?
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  // Relations
  user                User               @relation(fields: [userId], references: [id])
  payouts             Payout[]

  @@map("stripe_connected_accounts")
}
```

**Field Details:**

| Field             | Type              | Constraints      | Description                          |
|-------------------|-------------------|------------------|--------------------------------------|
| id                | String            | PK, CUID         | Internal identifier                  |
| userId            | String            | Unique, FK→User  | Owning provider user                 |
| stripeAccountId   | String            | Unique           | Stripe Connect account ID (acct_*)   |
| onboardingStatus  | OnboardingStatus  | Default NOT_STARTED | Current onboarding state          |
| chargesEnabled    | Boolean           | Default false    | Can receive charges (from Stripe)    |
| payoutsEnabled    | Boolean           | Default false    | Can receive payouts (from Stripe)    |
| detailsSubmitted  | Boolean           | Default false    | Has submitted all required details   |
| onboardingUrl     | String            | Nullable         | Last generated Stripe account link   |
| createdAt         | DateTime          | Auto             | Record creation timestamp            |
| updatedAt         | DateTime          | Auto             | Last update timestamp                |

**Indexes:**
- Primary: `id`
- Unique: `userId`
- Unique: `stripeAccountId`

### 3.3 Transaction

```prisma
model Transaction {
  id                    String              @id @default(cuid())
  buyerId               String
  providerId            String
  amount                Int                 // cents USD
  platformFee           Int                 // cents USD
  providerAmount        Int                 // cents USD (amount - platformFee)
  currency              String              @default("usd")
  description           String
  status                TransactionStatus   @default(CREATED)

  // Stripe references
  stripePaymentIntentId String?             @unique
  stripeChargeId        String?
  stripeTransferId      String?
  stripeRefundId        String?

  // Timestamps
  paymentHeldAt         DateTime?
  deliveredAt           DateTime?
  releasedAt            DateTime?
  paidOutAt             DateTime?
  disputedAt            DateTime?
  refundedAt            DateTime?
  expiredAt             DateTime?
  autoReleaseAt         DateTime?           // scheduled auto-release time
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  buyer                 User                @relation("BuyerTransactions", fields: [buyerId], references: [id])
  provider              User                @relation("ProviderTransactions", fields: [providerId], references: [id])
  dispute               Dispute?
  stateHistory          TransactionStateHistory[]
  payout                Payout?

  @@index([buyerId])
  @@index([providerId])
  @@index([status])
  @@index([createdAt])
  @@map("transactions")
}
```

**Field Details:**

| Field                   | Type               | Constraints            | Description                          |
|-------------------------|--------------------|------------------------|--------------------------------------|
| id                      | String             | PK, CUID               | Transaction identifier               |
| buyerId                 | String             | FK→User, indexed       | Buyer who created the hold           |
| providerId              | String             | FK→User, indexed       | Provider receiving payment           |
| amount                  | Int                | Not null               | Total hold amount in cents           |
| platformFee             | Int                | Not null               | Platform fee in cents (§BR-08)       |
| providerAmount          | Int                | Not null               | Provider receives (amount - fee)     |
| currency                | String             | Default "usd"          | Currency code (§BR-07)              |
| description             | String             | Not null               | Service description                  |
| status                  | TransactionStatus  | Default CREATED        | Current state machine position       |
| stripePaymentIntentId   | String             | Unique, nullable       | Stripe PaymentIntent ID              |
| stripeChargeId          | String             | Nullable               | Stripe Charge ID                     |
| stripeTransferId        | String             | Nullable               | Stripe Transfer ID                   |
| stripeRefundId          | String             | Nullable               | Stripe Refund ID (if refunded)       |
| paymentHeldAt           | DateTime           | Nullable               | When payment was held                |
| deliveredAt             | DateTime           | Nullable               | When delivery was marked             |
| releasedAt              | DateTime           | Nullable               | When funds were released             |
| paidOutAt               | DateTime           | Nullable               | When payout was completed            |
| disputedAt              | DateTime           | Nullable               | When dispute was filed               |
| refundedAt              | DateTime           | Nullable               | When refund was issued               |
| expiredAt               | DateTime           | Nullable               | When hold expired                    |
| autoReleaseAt           | DateTime           | Nullable               | Scheduled auto-release timestamp     |
| createdAt               | DateTime           | Auto                   | Record creation                      |
| updatedAt               | DateTime           | Auto                   | Last update                          |

**Indexes:**
- Primary: `id`
- Unique: `stripePaymentIntentId`
- Index: `buyerId`, `providerId`, `status`, `createdAt`

**Cardinality:**
- Transaction belongs to exactly 1 Buyer (User)
- Transaction belongs to exactly 1 Provider (User)
- Transaction has 0 or 1 Dispute
- Transaction has 0 or 1 Payout
- Transaction has many TransactionStateHistory entries

### 3.4 TransactionStateHistory

```prisma
model TransactionStateHistory {
  id              String          @id @default(cuid())
  transactionId   String
  fromStatus      TransactionStatus?
  toStatus        TransactionStatus
  action          AuditAction
  actorId         String?
  metadata        Json?           // { reason, stripeEventId, etc. }
  createdAt       DateTime        @default(now())

  // Relations
  transaction     Transaction     @relation(fields: [transactionId], references: [id])
  actor           User?           @relation("AuditActor", fields: [actorId], references: [id])

  @@index([transactionId])
  @@index([createdAt])
  @@map("transaction_state_history")
}
```

**Field Details:**

| Field           | Type               | Constraints          | Description                          |
|-----------------|--------------------|----------------------|--------------------------------------|
| id              | String             | PK, CUID             | History entry identifier             |
| transactionId   | String             | FK→Transaction       | Parent transaction                   |
| fromStatus      | TransactionStatus  | Nullable             | Previous state (null for CREATED)    |
| toStatus        | TransactionStatus  | Not null             | New state                            |
| action          | AuditAction        | Not null             | What triggered this transition       |
| actorId         | String             | FK→User, nullable    | Who triggered (null for system)      |
| metadata        | Json               | Nullable             | Additional context (Stripe IDs, etc.)|
| createdAt       | DateTime           | Auto                 | When transition occurred             |

**Indexes:**
- Primary: `id`
- Index: `transactionId` (for timeline queries)
- Index: `createdAt` (for chronological ordering)

### 3.5 Dispute

```prisma
model Dispute {
  id              String          @id @default(cuid())
  transactionId   String          @unique
  filedById       String
  reason          DisputeReason
  description     String
  status          DisputeStatus   @default(OPEN)
  resolvedById    String?
  resolutionNote  String?
  resolvedAt      DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  // Relations
  transaction     Transaction     @relation(fields: [transactionId], references: [id])
  filedBy         User            @relation("DisputesFiled", fields: [filedById], references: [id])
  evidence        DisputeEvidence[]

  @@index([status])
  @@index([createdAt])
  @@map("disputes")
}
```

**Field Details:**

| Field           | Type            | Constraints            | Description                          |
|-----------------|-----------------|------------------------|--------------------------------------|
| id              | String          | PK, CUID               | Dispute identifier                   |
| transactionId   | String          | Unique, FK→Transaction | One dispute per transaction          |
| filedById       | String          | FK→User                | Buyer who filed the dispute          |
| reason          | DisputeReason   | Not null               | Category of dispute (§BR-21)         |
| description     | String          | Not null               | Detailed description (§BR-21)        |
| status          | DisputeStatus   | Default OPEN           | Current dispute state                |
| resolvedById    | String          | Nullable               | Admin who resolved                   |
| resolutionNote  | String          | Nullable               | Admin resolution explanation         |
| resolvedAt      | DateTime        | Nullable               | When dispute was resolved            |
| createdAt       | DateTime        | Auto                   | When dispute was filed               |
| updatedAt       | DateTime        | Auto                   | Last update                          |

**Cardinality:**
- Dispute belongs to exactly 1 Transaction (1:1)
- Dispute filed by exactly 1 User (Buyer)
- Dispute has many DisputeEvidence entries

### 3.6 DisputeEvidence

```prisma
model DisputeEvidence {
  id            String    @id @default(cuid())
  disputeId     String
  submittedById String
  content       String    // text evidence
  fileUrl       String?   // optional file attachment URL
  fileName      String?   // original file name
  fileSize      Int?      // file size in bytes
  createdAt     DateTime  @default(now())

  // Relations
  dispute       Dispute   @relation(fields: [disputeId], references: [id])
  submittedBy   User      @relation(fields: [submittedById], references: [id])

  @@index([disputeId])
  @@map("dispute_evidence")
}
```

**Field Details:**

| Field         | Type     | Constraints        | Description                          |
|---------------|----------|--------------------|--------------------------------------|
| id            | String   | PK, CUID           | Evidence entry identifier            |
| disputeId     | String   | FK→Dispute         | Parent dispute                       |
| submittedById | String   | FK→User            | User who submitted evidence          |
| content       | String   | Not null           | Text evidence / description          |
| fileUrl       | String   | Nullable           | URL to uploaded file                 |
| fileName      | String   | Nullable           | Original file name                   |
| fileSize      | Int      | Nullable           | File size in bytes (max 10MB)        |
| createdAt     | DateTime | Auto               | Submission timestamp                 |

### 3.7 Payout

```prisma
model Payout {
  id                    String          @id @default(cuid())
  transactionId         String          @unique
  connectedAccountId    String
  stripePayoutId        String?         @unique
  amount                Int             // cents USD
  status                PayoutStatus    @default(PENDING)
  failureReason         String?
  paidAt                DateTime?
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  // Relations
  transaction           Transaction     @relation(fields: [transactionId], references: [id])
  connectedAccount      StripeConnectedAccount @relation(fields: [connectedAccountId], references: [id])

  @@index([connectedAccountId])
  @@index([status])
  @@map("payouts")
}
```

**Field Details:**

| Field                | Type          | Constraints              | Description                          |
|----------------------|---------------|--------------------------|--------------------------------------|
| id                   | String        | PK, CUID                 | Payout identifier                    |
| transactionId        | String        | Unique, FK→Transaction   | Associated transaction               |
| connectedAccountId   | String        | FK→StripeConnectedAccount| Provider's Stripe account            |
| stripePayoutId       | String        | Unique, nullable         | Stripe Payout ID                     |
| amount               | Int           | Not null                 | Payout amount in cents               |
| status               | PayoutStatus  | Default PENDING          | Current payout state                 |
| failureReason        | String        | Nullable                 | Reason if payout failed              |
| paidAt               | DateTime      | Nullable                 | When payout was confirmed paid       |
| createdAt            | DateTime      | Auto                     | Record creation                      |
| updatedAt            | DateTime      | Auto                     | Last update                          |

### 3.8 WebhookLog

```prisma
model WebhookLog {
  id              String          @id @default(cuid())
  stripeEventId   String          @unique
  eventType       String
  status          WebhookStatus   @default(RECEIVED)
  payload         Json
  errorMessage    String?
  processedAt     DateTime?
  createdAt       DateTime        @default(now())

  @@index([stripeEventId])
  @@index([eventType])
  @@index([status])
  @@map("webhook_logs")
}
```

**Field Details:**

| Field          | Type           | Constraints        | Description                          |
|----------------|----------------|--------------------|--------------------------------------|
| id             | String         | PK, CUID           | Log entry identifier                 |
| stripeEventId  | String         | Unique             | Stripe event ID for dedup (§SRS-3)   |
| eventType      | String         | Not null, indexed  | Stripe event type string             |
| status         | WebhookStatus  | Default RECEIVED   | Processing status                    |
| payload        | Json           | Not null           | Raw Stripe event payload             |
| errorMessage   | String         | Nullable           | Error details if processing failed   |
| processedAt    | DateTime       | Nullable           | When processing completed            |
| createdAt      | DateTime       | Auto               | When webhook was received            |

**Indexes:**
- Primary: `id`
- Unique: `stripeEventId` (idempotency key)
- Index: `eventType`, `status`

---

## 4. Entity Relationship Diagram

```
+----------+       1:N        +-------------+      1:1       +---------+
|   User   |---------------->| Transaction |<-------------->| Dispute |
| (BUYER)  |  buyerTxns      |             |                |         |
+----------+                  |             |      1:N       +---------+
                              |             |<-------------->|  Dispute|
+----------+       1:N       |             |                | Evidence|
|   User   |---------------->|             |                +---------+
| (PROVIDER)|  providerTxns  |             |
+----------+                  |             |      1:N       +----------+
     |                        |             |<-------------->| TxnState |
     | 1:1                    |             |                | History  |
     v                        |             |                +----------+
+--------------------+        |             |      1:1       +---------+
| StripeConnected    |        |             |<-------------->| Payout  |
| Account            |        +-------------+                +---------+
+--------------------+             ^                              |
     |                             |                              |
     | 1:N                         |                              |
     +-----------------------------+------------------------------+
       (payouts via connectedAccountId)
```

### 4.1 Cardinality Summary

| Relationship                          | Cardinality | Description                          |
|---------------------------------------|-------------|--------------------------------------|
| User (Buyer) → Transaction            | 1:N         | Buyer creates many transactions      |
| User (Provider) → Transaction         | 1:N         | Provider receives many transactions  |
| User (Provider) → StripeConnectedAccount | 1:1      | Each provider has one Stripe account |
| Transaction → TransactionStateHistory | 1:N         | Full audit trail                     |
| Transaction → Dispute                 | 1:0..1      | At most one dispute per transaction  |
| Transaction → Payout                  | 1:0..1      | At most one payout per transaction   |
| Dispute → DisputeEvidence             | 1:N         | Multiple evidence submissions        |
| StripeConnectedAccount → Payout       | 1:N         | Provider receives multiple payouts   |
| User → TransactionStateHistory (actor)| 1:N         | User triggers multiple state changes |
| User → DisputeEvidence                | 1:N         | User submits multiple evidence items |

---

## 5. Row-Level Security (RLS)

### 5.1 Policy Design

RLS is implemented via PostgreSQL policies applied after Prisma migrations.
The application passes the current user ID via a session variable
(`app.current_user_id`) set at the beginning of each request.

### 5.2 RLS Policies

#### transactions table

```sql
-- Buyers can see their own transactions
CREATE POLICY "buyer_transactions_select" ON transactions
  FOR SELECT
  USING (
    "buyerId" = current_setting('app.current_user_id')
    OR "providerId" = current_setting('app.current_user_id')
    OR current_setting('app.current_user_role') = 'ADMIN'
  );

-- Only buyers can insert transactions
CREATE POLICY "buyer_transactions_insert" ON transactions
  FOR INSERT
  WITH CHECK (
    "buyerId" = current_setting('app.current_user_id')
    AND current_setting('app.current_user_role') = 'BUYER'
  );

-- Updates restricted to status transitions via API (no direct RLS update)
CREATE POLICY "transactions_update" ON transactions
  FOR UPDATE
  USING (
    "buyerId" = current_setting('app.current_user_id')
    OR "providerId" = current_setting('app.current_user_id')
    OR current_setting('app.current_user_role') = 'ADMIN'
  );
```

#### disputes table

```sql
-- Parties to the transaction + admin can view disputes
CREATE POLICY "disputes_select" ON disputes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = disputes."transactionId"
      AND (
        t."buyerId" = current_setting('app.current_user_id')
        OR t."providerId" = current_setting('app.current_user_id')
        OR current_setting('app.current_user_role') = 'ADMIN'
      )
    )
  );

-- Only buyers can create disputes
CREATE POLICY "disputes_insert" ON disputes
  FOR INSERT
  WITH CHECK (
    "filedById" = current_setting('app.current_user_id')
    AND current_setting('app.current_user_role') = 'BUYER'
  );
```

#### dispute_evidence table

```sql
-- Parties to the dispute + admin can view evidence
CREATE POLICY "evidence_select" ON dispute_evidence
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN transactions t ON t.id = d."transactionId"
      WHERE d.id = dispute_evidence."disputeId"
      AND (
        t."buyerId" = current_setting('app.current_user_id')
        OR t."providerId" = current_setting('app.current_user_id')
        OR current_setting('app.current_user_role') = 'ADMIN'
      )
    )
  );

-- Parties can submit evidence
CREATE POLICY "evidence_insert" ON dispute_evidence
  FOR INSERT
  WITH CHECK (
    "submittedById" = current_setting('app.current_user_id')
  );
```

#### payouts table

```sql
-- Provider and admin can view payouts
CREATE POLICY "payouts_select" ON payouts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stripe_connected_accounts sca
      WHERE sca.id = payouts."connectedAccountId"
      AND (
        sca."userId" = current_setting('app.current_user_id')
        OR current_setting('app.current_user_role') = 'ADMIN'
      )
    )
  );
```

### 5.3 RLS Session Variable Setup

Set at the beginning of each authenticated request via Prisma middleware:

```typescript
// In Prisma middleware or NestJS interceptor
await prisma.$executeRawUnsafe(
  `SET LOCAL app.current_user_id = '${userId}'`
);
await prisma.$executeRawUnsafe(
  `SET LOCAL app.current_user_role = '${userRole}'`
);
```

The `SET LOCAL` ensures variables are scoped to the current transaction only.

---

## 6. Database Constraints

### 6.1 Check Constraints

```sql
-- Transaction amount must be between $5.00 and $10,000.00 (in cents)
ALTER TABLE transactions
  ADD CONSTRAINT chk_amount_range
  CHECK (amount >= 500 AND amount <= 1000000);

-- Platform fee must be non-negative
ALTER TABLE transactions
  ADD CONSTRAINT chk_platform_fee_positive
  CHECK ("platformFee" >= 0);

-- Provider amount must equal amount minus platform fee
ALTER TABLE transactions
  ADD CONSTRAINT chk_provider_amount
  CHECK ("providerAmount" = amount - "platformFee");

-- Currency must be USD
ALTER TABLE transactions
  ADD CONSTRAINT chk_currency_usd
  CHECK (currency = 'usd');

-- Dispute evidence file size max 10MB
ALTER TABLE dispute_evidence
  ADD CONSTRAINT chk_file_size
  CHECK ("fileSize" IS NULL OR "fileSize" <= 10485760);
```

### 6.2 Unique Constraints

| Table                      | Column(s)              | Purpose                           |
|----------------------------|------------------------|-----------------------------------|
| users                      | email                  | One account per email             |
| stripe_connected_accounts  | userId                 | One Stripe account per provider   |
| stripe_connected_accounts  | stripeAccountId        | No duplicate Stripe accounts      |
| transactions               | stripePaymentIntentId  | One transaction per PaymentIntent |
| disputes                   | transactionId          | One dispute per transaction       |
| payouts                    | transactionId          | One payout per transaction        |
| payouts                    | stripePayoutId         | No duplicate Stripe payouts       |
| webhook_logs               | stripeEventId          | Idempotency dedup key             |

---

## 7. Seed Data

### 7.1 Test Users

```typescript
const seedUsers = [
  {
    email: 'buyer@test.com',
    displayName: 'Test Buyer',
    role: 'BUYER',
    password: 'TestBuyer123',
    emailVerified: true,
  },
  {
    email: 'provider@test.com',
    displayName: 'Test Provider',
    role: 'PROVIDER',
    password: 'TestProvider123',
    emailVerified: true,
  },
  {
    email: 'admin@test.com',
    displayName: 'Test Admin',
    role: 'ADMIN',
    password: 'TestAdmin123',
    emailVerified: true,
  },
];
```

### 7.2 Test Transactions

Seed data includes transactions in various states to support UI development:
- 2 transactions in PAYMENT_HELD state
- 1 transaction in DELIVERED state
- 1 transaction in RELEASED state
- 1 transaction in DISPUTED state (with evidence)
- 1 transaction in PAID_OUT state
- 1 transaction in REFUNDED state

---

## 8. API Endpoint Summary

### 8.1 Authentication

| Method | Path                        | Description              | Auth     |
|--------|-----------------------------|--------------------------|----------|
| POST   | `/api/v1/auth/register`     | Register new user        | Public   |
| POST   | `/api/v1/auth/login`        | Login, receive JWT       | Public   |
| POST   | `/api/v1/auth/refresh`      | Refresh JWT token        | Bearer   |
| POST   | `/api/v1/auth/forgot-password` | Request password reset | Public   |
| POST   | `/api/v1/auth/reset-password`  | Reset password with token | Public |
| GET    | `/api/v1/auth/verify-email/:token` | Verify email       | Public   |

### 8.2 Users

| Method | Path                        | Description              | Auth     |
|--------|-----------------------------|--------------------------|----------|
| GET    | `/api/v1/users/me`          | Get current user profile | Bearer   |
| PATCH  | `/api/v1/users/me`          | Update profile           | Bearer   |
| GET    | `/api/v1/users/providers`   | List available providers | Bearer   |

### 8.3 Provider Onboarding

| Method | Path                              | Description              | Auth     |
|--------|-----------------------------------|--------------------------|----------|
| POST   | `/api/v1/onboarding/start`        | Start Stripe onboarding  | Provider |
| GET    | `/api/v1/onboarding/status`       | Get onboarding status    | Provider |
| POST   | `/api/v1/onboarding/refresh-link` | Get new onboarding link  | Provider |

### 8.4 Transactions

| Method | Path                                    | Description              | Auth     |
|--------|-----------------------------------------|--------------------------|----------|
| POST   | `/api/v1/transactions`                  | Create payment hold      | Buyer    |
| GET    | `/api/v1/transactions`                  | List user's transactions | Bearer   |
| GET    | `/api/v1/transactions/:id`              | Get transaction detail   | Bearer   |
| POST   | `/api/v1/transactions/:id/deliver`      | Mark delivery            | Provider |
| POST   | `/api/v1/transactions/:id/confirm`      | Confirm delivery         | Buyer    |
| POST   | `/api/v1/transactions/:id/release`      | Manual fund release      | Admin    |
| GET    | `/api/v1/transactions/:id/history`      | Get state history        | Bearer   |

### 8.5 Disputes

| Method | Path                                    | Description              | Auth     |
|--------|-----------------------------------------|--------------------------|----------|
| POST   | `/api/v1/disputes`                      | Create dispute           | Buyer    |
| GET    | `/api/v1/disputes`                      | List disputes            | Bearer   |
| GET    | `/api/v1/disputes/:id`                  | Get dispute detail       | Bearer   |
| POST   | `/api/v1/disputes/:id/evidence`         | Submit evidence          | Bearer   |
| POST   | `/api/v1/disputes/:id/resolve`          | Resolve dispute          | Admin    |

### 8.6 Payouts

| Method | Path                                    | Description              | Auth     |
|--------|-----------------------------------------|--------------------------|----------|
| GET    | `/api/v1/payouts`                       | List provider payouts    | Provider |
| GET    | `/api/v1/payouts/:id`                   | Get payout detail        | Provider |
| POST   | `/api/v1/payouts/:id/manual`            | Trigger manual payout    | Admin    |

### 8.7 Admin

| Method | Path                                    | Description              | Auth     |
|--------|-----------------------------------------|--------------------------|----------|
| GET    | `/api/v1/admin/transactions`            | All transactions         | Admin    |
| GET    | `/api/v1/admin/disputes`                | Dispute queue            | Admin    |
| GET    | `/api/v1/admin/analytics`               | Platform analytics       | Admin    |
| GET    | `/api/v1/admin/providers`               | Provider list + status   | Admin    |
| GET    | `/api/v1/admin/webhooks`                | Webhook logs             | Admin    |

### 8.8 Webhooks

| Method | Path                                    | Description              | Auth          |
|--------|-----------------------------------------|--------------------------|---------------|
| POST   | `/api/v1/webhooks/stripe`               | Stripe webhook receiver  | Stripe Sig    |

---

## 9. Migration Strategy

### 9.1 Prisma Migrations

- All schema changes via `prisma migrate dev` (development) and `prisma migrate deploy` (production)
- RLS policies applied via raw SQL migrations after Prisma schema migrations
- Check constraints applied via raw SQL migrations
- Seed data via `prisma db seed`

### 9.2 Migration Order

1. Create enums
2. Create tables (User, StripeConnectedAccount, Transaction, TransactionStateHistory, Dispute, DisputeEvidence, Payout, WebhookLog)
3. Apply check constraints
4. Enable RLS on tables
5. Apply RLS policies
6. Seed test data

---

## 10. Document References

| Document   | Section  | Relationship                                     |
|------------|----------|--------------------------------------------------|
| §BRD       | 2        | Business rules enforced by data constraints      |
| §PRD       | 2        | Functional requirements mapped to entities       |
| §SRS-1     | 1, 2     | Architecture hosting this data model             |
| §SRS-3     | All      | Domain logic operating on these entities         |
| §SRS-4     | 2, 4     | Security policies protecting this data           |

---

*End of SRS-2 — Escrow Marketplace v1.0*
