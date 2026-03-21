# System Requirements Specification — Database Schema & API (SRS-2)
# Marketplace Payment Hold & Conditional Release Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Database Schema (Prisma)

### 1.1 Complete Prisma Schema

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
  HELD
  RELEASED
  DISPUTED
  REFUNDED
  EXPIRED
}

enum DisputeStatus {
  OPEN
  EVIDENCE_SUBMITTED
  UNDER_REVIEW
  RESOLVED_BUYER
  RESOLVED_PROVIDER
  CLOSED
}

enum DisputeReason {
  SERVICE_NOT_DELIVERED
  SERVICE_NOT_AS_DESCRIBED
  UNAUTHORIZED_CHARGE
  DUPLICATE_CHARGE
  OTHER
}

enum OnboardingStatus {
  NOT_STARTED
  PENDING
  ACTIVE
  RESTRICTED
  DISABLED
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum WebhookStatus {
  RECEIVED
  PROCESSING
  PROCESSED
  FAILED
  DUPLICATE
}

model User {
  id                    String                 @id @default(uuid())
  email                 String                 @unique
  passwordHash          String
  name                  String
  role                  UserRole
  stripeCustomerId      String?
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt

  // Relations
  buyerTransactions     Transaction[]          @relation("BuyerTransactions")
  providerTransactions  Transaction[]          @relation("ProviderTransactions")
  connectedAccount      StripeConnectedAccount?
  disputes              Dispute[]
  payouts               Payout[]

  @@map("users")
}

model Transaction {
  id                    String                 @id @default(uuid())
  buyerId               String
  providerId            String
  amount                Int                    // Amount in cents
  currency              String                 @default("usd")
  status                TransactionStatus      @default(CREATED)
  description           String
  platformFeeAmount     Int                    // Fee in cents
  platformFeePercent    Float
  stripePaymentIntentId String?                @unique
  stripeTransferId      String?                @unique
  holdExpiresAt         DateTime?
  releasedAt            DateTime?
  refundedAt            DateTime?
  metadata              Json?
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt

  // Relations
  buyer                 User                   @relation("BuyerTransactions", fields: [buyerId], references: [id])
  provider              User                   @relation("ProviderTransactions", fields: [providerId], references: [id])
  stateHistory          TransactionStateHistory[]
  disputes              Dispute[]
  payout                Payout?

  @@index([buyerId])
  @@index([providerId])
  @@index([status])
  @@index([createdAt])
  @@map("transactions")
}

model TransactionStateHistory {
  id                    String                 @id @default(uuid())
  transactionId         String
  fromState             TransactionStatus
  toState               TransactionStatus
  reason                String?
  performedBy           String?                // User ID or 'system'
  metadata              Json?
  createdAt             DateTime               @default(now())

  // Relations
  transaction           Transaction            @relation(fields: [transactionId], references: [id])

  @@index([transactionId])
  @@index([createdAt])
  @@map("transaction_state_history")
}

model Dispute {
  id                    String                 @id @default(uuid())
  transactionId         String
  raisedById            String
  reason                DisputeReason
  description           String
  status                DisputeStatus          @default(OPEN)
  buyerEvidence         String?
  providerEvidence      String?
  adminNotes            String?
  resolution            String?
  resolvedAt            DateTime?
  resolvedById          String?
  stripeDisputeId       String?                @unique
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt

  // Relations
  transaction           Transaction            @relation(fields: [transactionId], references: [id])
  raisedBy              User                   @relation(fields: [raisedById], references: [id])

  @@index([transactionId])
  @@index([raisedById])
  @@index([status])
  @@map("disputes")
}

model StripeConnectedAccount {
  id                    String                 @id @default(uuid())
  userId                String                 @unique
  stripeAccountId       String                 @unique
  onboardingStatus      OnboardingStatus       @default(NOT_STARTED)
  chargesEnabled        Boolean                @default(false)
  payoutsEnabled        Boolean                @default(false)
  detailsSubmitted      Boolean                @default(false)
  country               String                 @default("US")
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt

  // Relations
  user                  User                   @relation(fields: [userId], references: [id])

  @@map("stripe_connected_accounts")
}

model Payout {
  id                    String                 @id @default(uuid())
  transactionId         String                 @unique
  providerId            String
  amount                Int                    // Amount in cents (after fee deduction)
  currency              String                 @default("usd")
  status                PayoutStatus           @default(PENDING)
  stripeTransferId      String?                @unique
  stripePayoutId        String?
  failureReason         String?
  completedAt           DateTime?
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt

  // Relations
  transaction           Transaction            @relation(fields: [transactionId], references: [id])
  provider              User                   @relation(fields: [providerId], references: [id])

  @@index([providerId])
  @@index([status])
  @@map("payouts")
}

model WebhookLog {
  id                    String                 @id @default(uuid())
  provider              String                 @default("stripe")
  eventId               String                 @unique  // Stripe event ID for idempotency
  eventType             String
  payload               Json
  status                WebhookStatus          @default(RECEIVED)
  error                 String?
  processedAt           DateTime?
  createdAt             DateTime               @default(now())

  @@index([eventId])
  @@index([eventType])
  @@index([createdAt])
  @@map("webhook_logs")
}
```

### 1.2 Schema Notes

- All monetary amounts stored as integers (cents) to avoid floating-point errors
- UUIDs used for all primary keys
- `@@map` directives for snake_case table names
- Indexes on foreign keys and frequently queried columns
- `@unique` constraints on Stripe IDs to prevent duplicates
- `Json` type for flexible metadata and webhook payloads

---

## 2. Row-Level Security Policies

### 2.1 Policy Design

RLS policies ensure that users can only access their own data at the database
level. This provides defense-in-depth beyond application-level authorization.

The application sets `app.current_user_id` and `app.current_user_role` on each
database connection before executing queries.

### 2.2 Policy SQL (Migration)

```sql
-- Enable RLS on tenant-scoped tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_state_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_connected_accounts ENABLE ROW LEVEL SECURITY;

-- Transactions: buyers see their purchases, providers see their sales, admins see all
CREATE POLICY transactions_buyer_policy ON transactions
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR buyer_id = current_setting('app.current_user_id', true)::uuid
    OR provider_id = current_setting('app.current_user_id', true)::uuid
  );

-- Disputes: raised by user or related transaction party, admins see all
CREATE POLICY disputes_policy ON disputes
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR raised_by_id = current_setting('app.current_user_id', true)::uuid
    OR transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.current_user_id', true)::uuid
         OR provider_id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Payouts: providers see their own, admins see all
CREATE POLICY payouts_policy ON payouts
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR provider_id = current_setting('app.current_user_id', true)::uuid
  );

-- Transaction State History: accessible if parent transaction is accessible
CREATE POLICY state_history_policy ON transaction_state_history
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR transaction_id IN (
      SELECT id FROM transactions
      WHERE buyer_id = current_setting('app.current_user_id', true)::uuid
         OR provider_id = current_setting('app.current_user_id', true)::uuid
    )
  );

-- Connected Accounts: providers see their own, admins see all
CREATE POLICY connected_accounts_policy ON stripe_connected_accounts
  FOR ALL
  USING (
    current_setting('app.current_user_role', true) = 'ADMIN'
    OR user_id = current_setting('app.current_user_id', true)::uuid
  );
```

---

## 3. REST API Specification

### 3.1 Authentication Endpoints

#### POST /auth/register
Create a new user account.

**Request:**
```typescript
{
  email: string;      // Valid email
  password: string;   // Min 8 characters
  name: string;       // Min 2 characters
  role: 'BUYER' | 'PROVIDER';  // Admin created via seed only
}
```

**Response 201:**
```typescript
{
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}
```

**Errors:**
- 400: Validation error (missing fields, invalid email)
- 409: Email already registered

#### POST /auth/login
Authenticate and receive tokens.

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response 200:**
```typescript
{
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}
```

**Errors:**
- 401: Invalid credentials

#### POST /auth/refresh
Refresh an expired access token.

**Request:**
```typescript
{
  refreshToken: string;
}
```

**Response 200:**
```typescript
{
  accessToken: string;
  refreshToken: string;
}
```

**Errors:**
- 401: Invalid or expired refresh token

#### GET /auth/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```typescript
{
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}
```

---

### 3.2 Transaction Endpoints

#### POST /transactions
Create a new transaction with payment intent.

**Auth:** BUYER only

**Request:**
```typescript
{
  providerId: string;          // UUID of provider
  amount: number;              // Amount in cents (min 100)
  description: string;         // Min 3 characters
  holdPeriodDays?: number;     // Optional, default 14
}
```

**Response 201:**
```typescript
{
  id: string;
  buyerId: string;
  providerId: string;
  amount: number;
  currency: string;
  status: 'CREATED';
  description: string;
  platformFeeAmount: number;
  platformFeePercent: number;
  stripePaymentIntentId: string;
  clientSecret: string;         // For Stripe.js confirmation
  holdExpiresAt: string | null;
  createdAt: string;
}
```

**Errors:**
- 400: Validation error
- 404: Provider not found
- 403: Not a buyer

#### GET /transactions
List transactions for the authenticated user.

**Auth:** BUYER, PROVIDER, ADMIN

**Query Parameters:**
```typescript
{
  status?: TransactionStatus;
  page?: number;              // Default 1
  limit?: number;             // Default 20, max 100
  sortBy?: 'createdAt' | 'amount';  // Default 'createdAt'
  sortOrder?: 'asc' | 'desc';      // Default 'desc'
}
```

**Response 200:**
```typescript
{
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### GET /transactions/:id
Get transaction detail with state history.

**Auth:** BUYER (own), PROVIDER (own), ADMIN (all)

**Response 200:**
```typescript
{
  id: string;
  buyerId: string;
  providerId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  description: string;
  platformFeeAmount: number;
  platformFeePercent: number;
  stripePaymentIntentId: string | null;
  stripeTransferId: string | null;
  holdExpiresAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  buyer: { id: string; name: string; email: string };
  provider: { id: string; name: string; email: string };
  stateHistory: TransactionStateHistory[];
  disputes: Dispute[];
}
```

**Errors:**
- 404: Transaction not found
- 403: Not authorized to view

#### POST /transactions/:id/release
Release held funds to provider.

**Auth:** BUYER (own), ADMIN (all)

**Response 200:**
```typescript
{
  id: string;
  status: 'RELEASED';
  releasedAt: string;
  stripeTransferId: string;
  payout: {
    id: string;
    amount: number;
    status: string;
  };
}
```

**Errors:**
- 400: Transaction not in HELD state
- 404: Transaction not found
- 403: Not authorized

#### POST /transactions/:id/refund
Refund a held transaction.

**Auth:** ADMIN only

**Response 200:**
```typescript
{
  id: string;
  status: 'REFUNDED';
  refundedAt: string;
}
```

**Errors:**
- 400: Transaction not in HELD state
- 404: Transaction not found
- 403: Not admin

---

### 3.3 Dispute Endpoints

#### POST /disputes
Create a new dispute.

**Auth:** BUYER only

**Request:**
```typescript
{
  transactionId: string;       // UUID
  reason: DisputeReason;
  description: string;         // Min 10 characters
}
```

**Response 201:**
```typescript
{
  id: string;
  transactionId: string;
  raisedById: string;
  reason: string;
  description: string;
  status: 'OPEN';
  createdAt: string;
}
```

**Errors:**
- 400: Transaction not in HELD state, or dispute already exists
- 404: Transaction not found
- 403: Not the buyer of this transaction

#### GET /disputes
List disputes.

**Auth:** BUYER (own), PROVIDER (related), ADMIN (all)

**Query Parameters:**
```typescript
{
  status?: DisputeStatus;
  page?: number;
  limit?: number;
}
```

**Response 200:**
```typescript
{
  data: Dispute[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### GET /disputes/:id
Get dispute detail.

**Auth:** Related party or ADMIN

**Response 200:**
```typescript
{
  id: string;
  transactionId: string;
  raisedById: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  buyerEvidence: string | null;
  providerEvidence: string | null;
  adminNotes: string | null;
  resolution: string | null;
  resolvedAt: string | null;
  resolvedById: string | null;
  createdAt: string;
  updatedAt: string;
  transaction: Transaction;
  raisedBy: { id: string; name: string };
}
```

#### POST /disputes/:id/evidence
Submit evidence for a dispute.

**Auth:** BUYER (own dispute) or PROVIDER (related transaction)

**Request:**
```typescript
{
  evidence: string;            // Text evidence, min 10 characters
}
```

**Response 200:**
```typescript
{
  id: string;
  status: 'EVIDENCE_SUBMITTED';
  buyerEvidence: string | null;
  providerEvidence: string | null;
  updatedAt: string;
}
```

#### POST /disputes/:id/resolve
Resolve a dispute.

**Auth:** ADMIN only

**Request:**
```typescript
{
  resolution: 'BUYER' | 'PROVIDER';
  notes: string;               // Min 5 characters
}
```

**Response 200:**
```typescript
{
  id: string;
  status: 'RESOLVED_BUYER' | 'RESOLVED_PROVIDER';
  resolution: string;
  adminNotes: string;
  resolvedAt: string;
  resolvedById: string;
}
```

**Errors:**
- 400: Dispute not in reviewable state
- 404: Dispute not found
- 403: Not admin

---

### 3.4 Payout Endpoints

#### GET /payouts
List payouts for the authenticated provider.

**Auth:** PROVIDER (own), ADMIN (all)

**Query Parameters:**
```typescript
{
  status?: PayoutStatus;
  page?: number;
  limit?: number;
}
```

**Response 200:**
```typescript
{
  data: Payout[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

#### GET /payouts/:id
Get payout detail.

**Auth:** PROVIDER (own), ADMIN (all)

**Response 200:**
```typescript
{
  id: string;
  transactionId: string;
  providerId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  stripeTransferId: string | null;
  stripePayoutId: string | null;
  completedAt: string | null;
  createdAt: string;
  transaction: Transaction;
  provider: { id: string; name: string; email: string };
}
```

---

### 3.5 Stripe Connect Endpoints

#### POST /stripe/onboard
Initiate Stripe Connect onboarding for a provider.

**Auth:** PROVIDER only

**Response 200:**
```typescript
{
  url: string;                 // Stripe-hosted onboarding URL
  accountId: string;
}
```

#### GET /stripe/onboard/refresh
Generate a new onboarding link (if previous expired).

**Auth:** PROVIDER only

**Response 200:**
```typescript
{
  url: string;
}
```

#### GET /stripe/onboard/return
Handle return from Stripe onboarding. Checks account status.

**Auth:** PROVIDER only

**Response 200:**
```typescript
{
  onboardingStatus: OnboardingStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}
```

#### GET /stripe/account/status
Get current connected account status.

**Auth:** PROVIDER only

**Response 200:**
```typescript
{
  accountId: string;
  onboardingStatus: OnboardingStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
}
```

---

### 3.6 Webhook Endpoint

#### POST /webhooks/stripe
Receive Stripe webhook events.

**Auth:** None (signature verified)

**Headers:**
- `stripe-signature`: Stripe webhook signature

**Request Body:** Raw JSON (Stripe event)

**Response 200:**
```typescript
{
  received: true;
}
```

**Errors:**
- 400: Invalid signature

---

### 3.7 Analytics Endpoints

#### GET /analytics/overview
Get platform analytics overview.

**Auth:** ADMIN only

**Query Parameters:**
```typescript
{
  period?: '7d' | '30d' | '90d' | '1y';  // Default '30d'
}
```

**Response 200:**
```typescript
{
  totalTransactions: number;
  totalVolume: number;          // In cents
  totalFees: number;            // In cents
  disputeRate: number;          // Percentage
  averageHoldDuration: number;  // In hours
  transactionsByStatus: {
    status: TransactionStatus;
    count: number;
  }[];
}
```

#### GET /analytics/volume
Get transaction volume over time.

**Auth:** ADMIN only

**Query Parameters:**
```typescript
{
  period?: '7d' | '30d' | '90d' | '1y';
  groupBy?: 'day' | 'week' | 'month';  // Default based on period
}
```

**Response 200:**
```typescript
{
  data: {
    date: string;
    count: number;
    volume: number;             // In cents
    fees: number;               // In cents
  }[];
}
```

#### GET /analytics/providers
Get provider performance metrics.

**Auth:** ADMIN only

**Response 200:**
```typescript
{
  data: {
    providerId: string;
    providerName: string;
    transactionCount: number;
    totalVolume: number;
    disputeCount: number;
    disputeRate: number;
    averageTransactionValue: number;
  }[];
}
```

---

### 3.8 Health Endpoint

#### GET /health
Health check endpoint.

**Auth:** None

**Response 200:**
```typescript
{
  status: 'ok';
  timestamp: string;
  version: string;
}
```

---

## 4. Pagination Pattern

All list endpoints follow a consistent pagination pattern:

**Query parameters:**
- `page` (number, default 1, min 1)
- `limit` (number, default 20, min 1, max 100)

**Response envelope:**
```typescript
{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Implementation:**
```typescript
const skip = (page - 1) * limit;
const [data, total] = await Promise.all([
  prisma.model.findMany({ skip, take: limit, ...filters }),
  prisma.model.count({ where: filters.where }),
]);
return {
  data,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
};
```

---

## 5. API Authentication Pattern

All authenticated endpoints use the `Authorization` header:
```
Authorization: Bearer <jwt-access-token>
```

Guards are applied in order:
1. `JwtAuthGuard` — validates JWT, extracts user
2. `RolesGuard` — checks user role against `@Roles()` decorator
3. `ThrottlerGuard` — rate limiting (on applicable routes)

The authenticated user is available via `@Request() req`:
```typescript
req.user = {
  sub: string;      // User ID
  email: string;
  role: UserRole;
}
```

---

## 6. Error Response Schema

All error responses follow NestJS convention:

```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
}
```

Validation errors (class-validator) return an array of messages:
```typescript
{
  statusCode: 400,
  message: [
    "amount must be a positive number",
    "providerId must be a UUID"
  ],
  error: "Bad Request"
}
```

---

## 7. Database Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| transactions | buyerId | Buyer's transaction list |
| transactions | providerId | Provider's transaction list |
| transactions | status | Filter by status |
| transactions | createdAt | Sort by date |
| transaction_state_history | transactionId | History for a transaction |
| transaction_state_history | createdAt | Chronological ordering |
| disputes | transactionId | Disputes for a transaction |
| disputes | raisedById | User's disputes |
| disputes | status | Filter by status |
| payouts | providerId | Provider's payouts |
| payouts | status | Filter by status |
| webhook_logs | eventId | Idempotency lookup |
| webhook_logs | eventType | Filter by type |
| webhook_logs | createdAt | Chronological ordering |
