# System Requirements Specification — Architecture (SRS-1)
# Marketplace Payment Hold & Conditional Release Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. System Overview

### 1.1 Architecture Style

The system follows a **modular monolith** architecture within a Turborepo
monorepo. The backend is a single NestJS application with well-defined module
boundaries. The frontend is a separate Next.js application that communicates
with the backend via REST API.

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Turborepo Monorepo                       │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   apps/web        │  │   apps/api        │  │ packages/    │  │
│  │   (Next.js 15)    │  │   (NestJS 11)     │  │ shared/      │  │
│  │                   │  │                   │  │ config/      │  │
│  │  - Buyer Portal   │  │  - Auth Module    │  │              │  │
│  │  - Provider Portal│  │  - Transactions   │  │ State Machine│  │
│  │  - Admin Dashboard│  │  - Disputes       │  │ Types/Enums  │  │
│  │  - Demo Banner    │  │  - Payouts        │  │ DTOs         │  │
│  │                   │  │  - Stripe         │  │              │  │
│  │  Stripe.js ◄──────┼──┤  - Webhooks      │  │              │  │
│  │  (card tokenize)  │  │  - Analytics      │  │              │  │
│  └───────┬───────────┘  │  - Notifications  │  └──────────────┘  │
│          │              └────────┬──────────┘                    │
│          │  REST API             │                               │
│          └───────────────────────┘                               │
└─────────────────────────────────────────────────────────────────┘
           │                       │
           ▼                       ▼
    ┌──────────────┐    ┌──────────────────────────┐
    │  Stripe API   │    │  Infrastructure           │
    │  (Test Mode)  │    │                           │
    │               │    │  PostgreSQL 16 (RLS)      │
    │  - Charges    │    │  Redis (BullMQ queues)    │
    │  - Transfers  │    │                           │
    │  - Connect    │    └──────────────────────────┘
    │  - Webhooks   │
    └──────────────┘
```

---

## 2. Service Boundaries

### 2.1 NestJS Module Structure

```
apps/api/src/
├── app.module.ts              # Root module
├── main.ts                    # Bootstrap
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts     # POST /auth/register, /auth/login, /auth/refresh
│   ├── auth.service.ts        # JWT generation, password hashing
│   ├── jwt.strategy.ts        # Passport JWT strategy
│   ├── jwt-auth.guard.ts      # Route guard
│   ├── roles.guard.ts         # Role-based access guard
│   ├── roles.decorator.ts     # @Roles() decorator
│   └── dto/
│       ├── register.dto.ts
│       └── login.dto.ts
├── transactions/
│   ├── transactions.module.ts
│   ├── transactions.controller.ts  # CRUD + state transition endpoints
│   ├── transactions.service.ts     # Business logic + state machine enforcement
│   └── dto/
│       ├── create-transaction.dto.ts
│       └── transition-transaction.dto.ts
├── disputes/
│   ├── disputes.module.ts
│   ├── disputes.controller.ts  # Create dispute, submit evidence, resolve
│   ├── disputes.service.ts     # Dispute workflow logic
│   └── dto/
│       ├── create-dispute.dto.ts
│       ├── submit-evidence.dto.ts
│       └── resolve-dispute.dto.ts
├── payouts/
│   ├── payouts.module.ts
│   ├── payouts.controller.ts   # View payouts
│   ├── payouts.service.ts      # Create transfers, track payouts
│   └── dto/
├── stripe/
│   ├── stripe.module.ts
│   ├── stripe.service.ts       # Stripe API wrapper (PaymentIntents, Transfers)
│   └── stripe-connect.service.ts  # Connected account management
├── webhooks/
│   ├── webhooks.module.ts
│   ├── webhooks.controller.ts  # POST /webhooks/stripe (raw body)
│   ├── webhooks.service.ts     # Event routing and processing
│   └── handlers/
│       ├── payment-intent.handler.ts
│       ├── transfer.handler.ts
│       ├── payout.handler.ts
│       └── dispute.handler.ts
├── analytics/
│   ├── analytics.module.ts
│   ├── analytics.controller.ts  # GET /analytics/*
│   └── analytics.service.ts    # Aggregation queries
├── notifications/
│   ├── notifications.module.ts
│   └── notifications.service.ts  # Email templates (demo: log only)
├── common/
│   ├── guards/
│   │   └── throttle.guard.ts
│   ├── interceptors/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── decorators/
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── queue/
    ├── queue.module.ts
    └── processors/
        └── auto-release.processor.ts
```

### 2.2 Module Dependencies

```
AppModule
├── AuthModule
│   └── PrismaModule
├── TransactionsModule
│   ├── PrismaModule
│   ├── StripeModule
│   ├── QueueModule
│   └── NotificationsModule
├── DisputesModule
│   ├── PrismaModule
│   ├── TransactionsModule
│   └── NotificationsModule
├── PayoutsModule
│   ├── PrismaModule
│   └── StripeModule
├── StripeModule (global)
├── WebhooksModule
│   ├── StripeModule
│   ├── TransactionsModule
│   ├── PayoutsModule
│   └── PrismaModule
├── AnalyticsModule
│   └── PrismaModule
├── NotificationsModule
├── QueueModule (BullMQ)
│   └── TransactionsModule (forwardRef)
└── PrismaModule (global)
```

---

## 3. Stripe Connect Architecture

### 3.1 Account Model: Separate Charges and Transfers

We use Stripe's **separate charges and transfers** model rather than destination
charges. This gives the platform maximum control over when funds are transferred
to providers.

```
Payment Flow:
1. Platform creates PaymentIntent on its own Stripe account
2. Buyer's card is charged → funds land in platform's Stripe balance
3. Platform holds funds (no transfer yet)
4. Upon release → Platform creates Transfer to provider's connected account
5. Provider receives funds in their connected account
```

### 3.2 Why Not Destination Charges

| Feature | Destination Charges | Separate Charges & Transfers |
|---------|-------------------|------------------------------|
| Control over transfer timing | Limited | Full control |
| Platform holds funds | No (immediate transfer) | Yes |
| Refund flexibility | Limited | Full |
| Multi-provider split | Complex | Simple |
| Dispute handling | Provider handles | Platform handles |

### 3.3 Connected Account Lifecycle

```
Provider registers
       │
       ▼
Create Express Account ──→ Stripe creates account
       │
       ▼
Generate Account Link ──→ Redirect to Stripe onboarding
       │
       ▼
Stripe onboarding (KYC) ──→ Provider completes identity + banking
       │
       ▼
Return to platform ──→ Check account.charges_enabled
       │
       ├── charges_enabled = true  → Status: ACTIVE
       ├── charges_enabled = false → Status: RESTRICTED
       └── details_submitted = false → Status: PENDING
```

### 3.4 Key Stripe API Calls

| Operation | Stripe API | Parameters |
|-----------|-----------|------------|
| Create connected account | `stripe.accounts.create` | `type: 'express'`, `country: 'US'` |
| Generate onboarding link | `stripe.accountLinks.create` | `type: 'account_onboarding'` |
| Create payment intent | `stripe.paymentIntents.create` | `amount`, `currency: 'usd'` |
| Create transfer | `stripe.transfers.create` | `amount`, `destination`, `transfer_group` |
| Create refund | `stripe.refunds.create` | `payment_intent` |
| Verify webhook | `stripe.webhooks.constructEvent` | `payload`, `sig`, `secret` |
| Check account status | `stripe.accounts.retrieve` | `accountId` |

---

## 4. Webhook Processing

### 4.1 Webhook Architecture

```
Stripe ──POST──→ /webhooks/stripe
                     │
                     ▼
              Verify Signature
              (constructEvent)
                     │
                     ▼
              Check Idempotency
              (WebhookLog lookup)
                     │
              ┌──────┴──────┐
              │ Duplicate?   │
              │ → Return 200 │
              └──────┬──────┘
                     │ New event
                     ▼
              Log to WebhookLog
              (status: PROCESSING)
                     │
                     ▼
              Route to Handler
              ┌─────────────────────────────────┐
              │ payment_intent.succeeded         │
              │ → TransactionService.hold()      │
              │                                  │
              │ transfer.created                 │
              │ → PayoutService.trackTransfer()  │
              │                                  │
              │ payout.paid                      │
              │ → PayoutService.trackPayout()    │
              │                                  │
              │ charge.dispute.created           │
              │ → DisputeService.stripeDispute() │
              │                                  │
              │ charge.dispute.closed            │
              │ → DisputeService.closeDispute()  │
              └─────────────────────────────────┘
                     │
                     ▼
              Update WebhookLog
              (status: PROCESSED / FAILED)
                     │
                     ▼
              Return 200 (always)
```

### 4.2 Webhook Security

1. **Raw body access** — NestJS must be configured to provide raw body for
   signature verification. The webhooks controller uses `@RawBody()`.

2. **Signature verification** — Every webhook call goes through
   `stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)`.
   If verification fails, return 400.

3. **Idempotency** — Each Stripe event has a unique `event.id`. Before
   processing, check `WebhookLog` for existing entries. Skip duplicates.

4. **Always return 200** — After signature verification passes, always return
   200 to Stripe (even if processing fails). Log failures for manual review.

### 4.3 Webhook Events Handled

| Event | Handler | Action |
|-------|---------|--------|
| `payment_intent.succeeded` | PaymentIntentHandler | Transition CREATED → HELD |
| `payment_intent.payment_failed` | PaymentIntentHandler | Log failure, notify buyer |
| `transfer.created` | TransferHandler | Update payout record |
| `payout.paid` | PayoutHandler | Mark payout as completed |
| `charge.dispute.created` | DisputeHandler | Create dispute record |
| `charge.dispute.closed` | DisputeHandler | Update dispute status |
| `account.updated` | AccountHandler | Update connected account status |

---

## 5. Queue Design

### 5.1 BullMQ Configuration

```
Redis connection: REDIS_URL environment variable
Queue name: 'marketplace-jobs'
Default settings:
  - attempts: 3
  - backoff: exponential (1s, 2s, 4s)
  - removeOnComplete: 1000
  - removeOnFail: 5000
```

### 5.2 Job Types

#### Auto-Release Job
```typescript
{
  name: 'auto-release',
  data: {
    transactionId: string,
    expectedState: 'HELD'  // Guard: only release if still HELD
  },
  opts: {
    delay: holdPeriodMs,    // Default: 14 days in milliseconds
    jobId: `auto-release-${transactionId}`,  // Prevent duplicates
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 }
  }
}
```

#### Processing Logic
```
auto-release processor:
  1. Fetch transaction by ID
  2. If transaction.status !== 'HELD' → skip (no-op)
  3. If transaction.status === 'HELD':
     a. Create Stripe Transfer to provider
     b. Transition to RELEASED
     c. Log state history
     d. Notify provider
```

### 5.3 Job Lifecycle

```
Transaction enters HELD state
       │
       ▼
Add delayed job to BullMQ ──→ Job waits for holdPeriod
       │
       ├── Transaction released manually before timer
       │   → Job fires but state !== HELD → no-op
       │
       ├── Transaction disputed before timer
       │   → Remove job from queue (cancel timer)
       │
       └── Timer expires, still HELD
           → Job fires → Create transfer → RELEASED
```

---

## 6. Data Flow Diagrams

### 6.1 Payment Creation Flow

```
Buyer (Frontend)          API Server              Stripe           Database
     │                        │                      │                │
     │  POST /transactions    │                      │                │
     │  {amount, providerId}  │                      │                │
     ├───────────────────────►│                      │                │
     │                        │  paymentIntents.create               │
     │                        ├─────────────────────►│                │
     │                        │  {clientSecret}      │                │
     │                        │◄─────────────────────┤                │
     │                        │                      │                │
     │                        │  INSERT transaction  │                │
     │                        │  status: CREATED     │                │
     │                        ├──────────────────────┼───────────────►│
     │                        │                      │                │
     │  {transactionId,       │                      │                │
     │   clientSecret}        │                      │                │
     │◄───────────────────────┤                      │                │
     │                        │                      │                │
     │  stripe.confirmPayment │                      │                │
     │  (clientSecret)        │                      │                │
     ├────────────────────────┼─────────────────────►│                │
     │                        │                      │                │
     │                        │  webhook:            │                │
     │                        │  payment_intent.     │                │
     │                        │  succeeded           │                │
     │                        │◄─────────────────────┤                │
     │                        │                      │                │
     │                        │  UPDATE transaction  │                │
     │                        │  status: HELD        │                │
     │                        ├──────────────────────┼───────────────►│
     │                        │                      │                │
     │                        │  Add auto-release    │                │
     │                        │  delayed job         │                │
     │                        ├──►[BullMQ]           │                │
```

### 6.2 Release Flow

```
Buyer (Frontend)          API Server              Stripe           Database
     │                        │                      │                │
     │  POST /transactions/   │                      │                │
     │  {id}/release          │                      │                │
     ├───────────────────────►│                      │                │
     │                        │  Validate: HELD      │                │
     │                        │  Calculate payout    │                │
     │                        │                      │                │
     │                        │  transfers.create    │                │
     │                        │  {destination, amt}  │                │
     │                        ├─────────────────────►│                │
     │                        │  {transferId}        │                │
     │                        │◄─────────────────────┤                │
     │                        │                      │                │
     │                        │  UPDATE transaction  │                │
     │                        │  status: RELEASED    │                │
     │                        │  INSERT payout       │                │
     │                        │  INSERT state_history│                │
     │                        ├──────────────────────┼───────────────►│
     │                        │                      │                │
     │  {transaction}         │                      │                │
     │◄───────────────────────┤                      │                │
```

---

## 7. Authentication Architecture

### 7.1 JWT Token Flow

```
Register/Login ──→ API validates credentials
                         │
                         ▼
                   Generate tokens:
                   - Access token (15min, HS256)
                   - Refresh token (7d, HS256)
                         │
                         ▼
                   Return both tokens
                         │
                         ▼
              Frontend stores in httpOnly cookies
                   OR localStorage (demo)
                         │
                         ▼
              API requests include:
              Authorization: Bearer <accessToken>
                         │
                         ▼
              JwtAuthGuard validates token
              RolesGuard checks role claim
```

### 7.2 JWT Payload

```typescript
{
  sub: string;      // User ID
  email: string;    // User email
  role: 'BUYER' | 'PROVIDER' | 'ADMIN';
  iat: number;      // Issued at
  exp: number;      // Expiration
}
```

### 7.3 Role-Based Access

| Endpoint | BUYER | PROVIDER | ADMIN |
|----------|-------|----------|-------|
| POST /transactions | Yes | No | No |
| GET /transactions | Own | Own | All |
| POST /transactions/:id/release | Yes | No | Yes |
| POST /disputes | Yes | No | No |
| POST /disputes/:id/resolve | No | No | Yes |
| GET /analytics | No | No | Yes |
| POST /stripe/onboard | No | Yes | No |
| GET /payouts | No | Own | All |

---

## 8. Error Handling Strategy

### 8.1 Error Response Format

```typescript
{
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
}
```

### 8.2 Error Categories

| Category | HTTP Status | Example |
|----------|-------------|---------|
| Validation | 400 | Missing required field |
| Authentication | 401 | Invalid/expired JWT |
| Authorization | 403 | Provider trying to create payment |
| Not Found | 404 | Transaction not found |
| Conflict | 409 | Invalid state transition |
| Rate Limit | 429 | Too many requests |
| Stripe Error | 502 | Stripe API failure |
| Internal | 500 | Unhandled exception |

### 8.3 Stripe Error Handling

```
Stripe API call
       │
       ├── Success → Continue normal flow
       │
       ├── CardError → Return 400 with card error message
       │
       ├── InvalidRequestError → Return 400 with details
       │
       ├── AuthenticationError → Log critical, return 500
       │
       ├── RateLimitError → Retry with backoff, then 503
       │
       └── APIError → Log, return 502
```

---

## 9. Environment Configuration

### 9.1 Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/marketplace

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=<random-256-bit-string>
JWT_REFRESH_SECRET=<random-256-bit-string>

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
PORT=3000
CORS_ORIGINS=http://localhost:3001
NODE_ENV=development

# Platform Config
PLATFORM_FEE_PERCENT=10
DEFAULT_HOLD_PERIOD_DAYS=14
MIN_PLATFORM_FEE_CENTS=50
```

### 9.2 Configuration Module

NestJS ConfigModule with validation:
- All required variables validated at startup
- Stripe keys must start with `sk_test_` (never `sk_live_`)
- DATABASE_URL must be a valid PostgreSQL connection string

---

## 10. Deployment Architecture

### 10.1 Target Deployment

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Vercel       │     │  Railway          │     │  Stripe       │
│               │     │                   │     │  (Test Mode)  │
│  Next.js 15   │────►│  NestJS API      │────►│               │
│  Frontend     │ API │  PostgreSQL 16   │     │  Webhooks ────┤
│               │     │  Redis           │◄────┤               │
└──────────────┘     └──────────────────┘     └──────────────┘
```

### 10.2 Local Development

```
Docker Compose:
  - PostgreSQL 16
  - Redis 7
NestJS: localhost:3000
Next.js: localhost:3001
Stripe CLI: stripe listen --forward-to localhost:3000/webhooks/stripe
```

---

## 11. Monitoring and Observability

### 11.1 Logging Strategy

- **Structured JSON logging** in production
- **Pretty-print logging** in development
- Log levels: ERROR, WARN, INFO, DEBUG
- All Stripe API calls logged at INFO level
- All state transitions logged at INFO level
- All webhook events logged at INFO level
- Errors logged with stack traces

### 11.2 Health Checks

```
GET /health
{
  status: 'ok',
  database: 'connected',
  redis: 'connected',
  stripe: 'reachable',
  timestamp: ISO8601
}
```

---

## 12. Testing Strategy

### 12.1 Test Pyramid

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Services, utilities, state machine |
| Integration | Vitest + real DB | API endpoints, database operations |
| E2E | Supertest + real DB | Full request lifecycle |
| Frontend | Vitest + Testing Library | Component rendering, interactions |

### 12.2 Test Database

- Separate test database (or schema) for integration/E2E tests
- Database reset between test suites
- Seed data for test scenarios

### 12.3 Stripe Testing

- Use Stripe test mode API keys in tests
- Mock Stripe API calls in unit tests
- Use real Stripe test mode in integration tests where possible
- Test webhook signature verification with known test payloads
