# Software Requirements Specification — Domain Logic (SRS-3)

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

## 1. Transaction State Machine

### 1.1 State Diagram

```
                    +----------+
                    | CREATED  |
                    +----+-----+
                         |
                    payment_intent.succeeded
                         |
                         v
                  +--------------+
           +----->| PAYMENT_HELD |<-----+
           |      +------+-------+      |
           |             |              |
           |        +----+----+         |
           |        |         |         |
           |   deliver()  dispute()  expire()
           |        |         |         |
           |        v         v         v
           |  +-----------+ +----------+ +---------+
           |  | DELIVERED | | DISPUTED | | EXPIRED |
           |  +-----+-----+ +----+-----+ +---------+
           |        |             |
           |   +----+----+  +----+----+----+
           |   |         |  |    |         |
           | confirm() dispute() | resolve() resolve()
           | auto_rel.  |  |    (release)  (refund)
           |   |         |  |    |         |
           |   v         v  |    v         v
           | +----------+  |  +----------+ +----------+
           | | RELEASED  |  |  | RELEASED | | REFUNDED |
           | +-----+-----+  |  +----------+ +----------+
           |       |         |
           |  payout.paid    |
           |       |         |
           |       v         |
           | +---------+     |
           | | PAID_OUT|     |
           | +---------+     |
           |                 |
           +--(no path back)-+

  Also: CREATED --cancel()--> CANCELLED
```

### 1.2 State Transition Table

Every valid transition is listed below. Any transition NOT in this table is
invalid and SHALL be rejected with HTTP 400 and error code `INVALID_TRANSITION`.

| From           | To             | Trigger                    | Guard Conditions                                | Actor      | Action                                   |
|----------------|----------------|----------------------------|-------------------------------------------------|------------|------------------------------------------|
| CREATED        | PAYMENT_HELD   | `payment_intent.succeeded` | PaymentIntent status = `requires_capture` or `succeeded` | System     | Record paymentHeldAt, notify provider    |
| CREATED        | CANCELLED      | `cancel()`                 | Transaction age < 1 hour; no PaymentIntent confirmed | Buyer      | Cancel PaymentIntent if exists           |
| PAYMENT_HELD   | DELIVERED      | `deliver()`                | Actor is transaction provider                   | Provider   | Record deliveredAt, start auto-release timer, notify buyer |
| PAYMENT_HELD   | DISPUTED       | `dispute()`                | Actor is transaction buyer; dispute reason provided | Buyer      | Create Dispute record, record disputedAt, notify admin |
| PAYMENT_HELD   | EXPIRED        | `expire()`                 | PaymentIntent uncaptured > 7 days               | System     | Record expiredAt, cancel PaymentIntent   |
| DELIVERED      | RELEASED       | `confirm()`                | Actor is transaction buyer                      | Buyer      | Capture PI, create Transfer, record releasedAt, cancel auto-release timer |
| DELIVERED      | RELEASED       | `auto_release()`           | autoReleaseAt has passed; no dispute filed       | System     | Capture PI, create Transfer, record releasedAt |
| DELIVERED      | DISPUTED       | `dispute()`                | Actor is buyer; within 72h of deliveredAt        | Buyer      | Create Dispute, cancel auto-release timer, record disputedAt |
| DISPUTED       | RELEASED       | `resolve(release)`         | Actor is ADMIN; dispute is OPEN or UNDER_REVIEW | Admin      | Capture PI, create Transfer, resolve dispute, record releasedAt |
| DISPUTED       | REFUNDED       | `resolve(refund)`          | Actor is ADMIN; dispute is OPEN or UNDER_REVIEW | Admin      | Cancel/refund PaymentIntent, resolve dispute, record refundedAt |
| RELEASED       | PAID_OUT       | `payout.paid`              | Stripe payout webhook confirms paid              | System     | Record paidOutAt, update Payout status   |

### 1.3 Terminal States

The following states are terminal — no further transitions are allowed:

| State     | Description                                           |
|-----------|-------------------------------------------------------|
| PAID_OUT  | Provider has received bank payout; transaction complete |
| REFUNDED  | Buyer has been refunded; transaction complete          |
| EXPIRED   | Payment hold expired without action; transaction dead  |
| CANCELLED | Transaction cancelled before payment; transaction dead |

### 1.4 State Transition Validation

```typescript
const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  CREATED:      ['PAYMENT_HELD', 'CANCELLED'],
  PAYMENT_HELD: ['DELIVERED', 'DISPUTED', 'EXPIRED'],
  DELIVERED:    ['RELEASED', 'DISPUTED'],
  RELEASED:     ['PAID_OUT'],
  PAID_OUT:     [],
  DISPUTED:     ['RELEASED', 'REFUNDED'],
  REFUNDED:     [],
  EXPIRED:      [],
  CANCELLED:    [],
};

function validateTransition(
  from: TransactionStatus,
  to: TransactionStatus
): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}
```

### 1.5 State Change Side Effects

Every state transition triggers the following side effects:

1. **TransactionStateHistory** record created with fromStatus, toStatus, action, actorId, metadata
2. **Transaction** record updated with new status and relevant timestamp
3. **Notification** dispatched to affected parties (see §SRS-4 Section 3)
4. **BullMQ jobs** created or cancelled as applicable (auto-release timer)

---

## 2. Payment Hold Lifecycle

### 2.1 Create Payment Hold

**Trigger:** Buyer submits payment creation form (§FR-301)

**Algorithm:**

```
1. Validate request:
   a. Buyer is authenticated and email verified
   b. Provider exists and onboarding status is COMPLETE
   c. Amount is between 500 and 1000000 cents ($5.00 - $10,000.00)
   d. Currency is "usd"
   e. Description is non-empty

2. Calculate fees:
   a. platformFee = floor(amount * PLATFORM_FEE_PERCENT / 100)
   b. If platformFee < 50, set platformFee = 50 (min $0.50)
   c. providerAmount = amount - platformFee

3. Create Transaction record:
   a. status = CREATED
   b. buyerId, providerId, amount, platformFee, providerAmount
   c. Create TransactionStateHistory (null → CREATED)

4. Create Stripe PaymentIntent:
   a. amount = transaction.amount
   b. currency = "usd"
   c. capture_method = "manual"
   d. metadata = { transactionId, buyerId, providerId }
   e. transfer_data = { destination: provider.stripeAccountId } — NOT used
      (separate charges and transfers model; transfer created later)

5. Update Transaction:
   a. stripePaymentIntentId = paymentIntent.id

6. Return:
   a. Transaction record
   b. PaymentIntent client_secret (for Stripe Elements confirmation)
```

### 2.2 Payment Confirmation (Webhook)

**Trigger:** `payment_intent.succeeded` webhook

**Algorithm:**

```
1. Look up Transaction by stripePaymentIntentId
2. Validate current status is CREATED
3. Transition to PAYMENT_HELD:
   a. Update status, paymentHeldAt
   b. Record stripeChargeId from PaymentIntent
   c. Create TransactionStateHistory
4. Notify provider: "New payment hold received"
5. Notify buyer: "Payment hold confirmed"
```

### 2.3 Hold Expiration

**Trigger:** Stripe automatically cancels uncaptured PaymentIntent after 7 days,
sending `payment_intent.canceled` webhook. Also monitored by a daily BullMQ
cleanup job.

**Algorithm:**

```
1. Look up Transaction by stripePaymentIntentId
2. If status is CREATED or PAYMENT_HELD:
   a. Transition to EXPIRED
   b. Record expiredAt
   c. Create TransactionStateHistory
   d. Notify buyer: "Payment hold expired"
   e. Notify provider: "Payment hold expired"
```

---

## 3. Auto-Release Timer

### 3.1 Timer Creation

**Trigger:** Provider marks delivery (status → DELIVERED)

**Algorithm:**

```
1. Calculate autoReleaseAt = now() + AUTO_RELEASE_HOURS (default 72 hours)
2. Update Transaction.autoReleaseAt
3. Create BullMQ delayed job:
   a. Queue: "auto-release"
   b. Job ID: `auto-release:${transactionId}` (for cancellation)
   c. Delay: AUTO_RELEASE_HOURS * 60 * 60 * 1000 milliseconds
   d. Payload: { transactionId }
   e. Attempts: 3
   f. Backoff: { type: 'exponential', delay: 30000 }
```

### 3.2 Timer Execution

**Trigger:** BullMQ delayed job fires after timer expires

**Algorithm:**

```
1. Load Transaction by transactionId
2. Guard checks:
   a. Status MUST be DELIVERED (not DISPUTED or already RELEASED)
   b. autoReleaseAt MUST be in the past
   c. No Dispute record exists for this transaction
3. If guards pass:
   a. Capture the PaymentIntent via Stripe API
   b. Create Stripe Transfer:
      - amount: transaction.providerAmount
      - destination: provider.stripeAccountId
      - transfer_group: transaction.id
   c. Transition to RELEASED:
      - Update status, releasedAt
      - Record stripeTransferId
      - Create TransactionStateHistory (action: AUTO_RELEASE_TRIGGERED)
   d. Notify buyer: "Funds auto-released to provider"
   e. Notify provider: "Funds released — payout incoming"
4. If guards fail:
   a. Log reason and mark job as completed (no retry)
```

### 3.3 Timer Cancellation

**Trigger:** Buyer files dispute OR buyer confirms delivery manually

**Algorithm:**

```
1. Remove BullMQ job by ID: `auto-release:${transactionId}`
2. Update Transaction.autoReleaseAt = null
3. Proceed with the triggering action (dispute or manual release)
```

---

## 4. Platform Fee Calculation

### 4.1 Fee Formula

All calculations use integer cents to avoid floating-point errors (§BR-11).

```typescript
function calculatePlatformFee(amountCents: number): {
  platformFee: number;
  providerAmount: number;
} {
  const feePercent = Number(process.env.PLATFORM_FEE_PERCENT) || 10;
  let platformFee = Math.floor(amountCents * feePercent / 100);

  // Enforce minimum fee of $0.50 (50 cents)
  if (platformFee < 50) {
    platformFee = 50;
  }

  const providerAmount = amountCents - platformFee;

  // Invariant: providerAmount must be positive
  if (providerAmount <= 0) {
    throw new Error('Transaction amount too low for fee calculation');
  }

  return { platformFee, providerAmount };
}
```

### 4.2 Fee Examples

| Transaction Amount | Fee (10%) | Min Fee Applied | Provider Receives |
|--------------------|-----------|-----------------|-------------------|
| $5.00 (500)        | 50        | No              | $4.50 (450)       |
| $10.00 (1000)      | 100       | No              | $9.00 (900)       |
| $100.00 (10000)    | 1000      | No              | $90.00 (9000)     |
| $1,000.00 (100000) | 10000     | No              | $900.00 (90000)   |
| $10,000.00 (1000000)| 100000   | No              | $9,000.00 (900000)|

### 4.3 Fee Invariants

1. `platformFee + providerAmount == amount` — always true
2. `platformFee >= 50` — minimum $0.50
3. `providerAmount > 0` — provider always receives something
4. All values are integers (cents) — no floating point

---

## 5. Dispute Resolution Workflow

### 5.1 Dispute Creation

**Trigger:** Buyer calls `POST /api/v1/disputes` (§FR-701)

**Preconditions:**
- Transaction status is PAYMENT_HELD or DELIVERED
- Actor is the transaction buyer
- If DELIVERED: within 72 hours of deliveredAt (§BR-22)
- No existing dispute for this transaction

**Algorithm:**

```
1. Validate preconditions
2. Create Dispute record:
   a. transactionId, filedById = buyer.id
   b. reason (DisputeReason enum), description
   c. status = OPEN
3. Transition Transaction to DISPUTED:
   a. Update status, disputedAt
   b. Create TransactionStateHistory (action: DISPUTE_OPENED)
4. Cancel auto-release timer if exists (§3.3)
5. Notify provider: "Dispute filed on transaction"
6. Notify admin: "New dispute requires review"
7. Return Dispute record
```

### 5.2 Evidence Submission

**Trigger:** Buyer or provider calls `POST /api/v1/disputes/:id/evidence`

**Preconditions:**
- Dispute status is OPEN or UNDER_REVIEW
- Actor is buyer or provider on the associated transaction

**Algorithm:**

```
1. Validate preconditions
2. Create DisputeEvidence record:
   a. disputeId, submittedById = actor.id
   b. content (text description)
   c. fileUrl, fileName, fileSize (optional attachment)
3. If dispute status is OPEN:
   a. Transition dispute to UNDER_REVIEW
4. Create TransactionStateHistory (action: DISPUTE_EVIDENCE_ADDED)
5. Notify opposing party: "New evidence submitted"
6. Notify admin: "Evidence added to dispute"
7. Return DisputeEvidence record
```

### 5.3 Dispute Resolution

**Trigger:** Admin calls `POST /api/v1/disputes/:id/resolve`

**Preconditions:**
- Actor has ADMIN role
- Dispute status is OPEN or UNDER_REVIEW

**Request Body:**
```typescript
{
  action: 'RELEASE' | 'REFUND' | 'ESCALATE';
  note: string; // required resolution explanation
}
```

**Algorithm — RELEASE (funds to provider):**

```
1. Capture the PaymentIntent via Stripe API
2. Create Stripe Transfer:
   a. amount: transaction.providerAmount
   b. destination: provider.stripeAccountId
   c. transfer_group: transaction.id
3. Update Dispute:
   a. status = RESOLVED_RELEASED
   b. resolvedById = admin.id
   c. resolutionNote = note
   d. resolvedAt = now()
4. Transition Transaction to RELEASED:
   a. Update status, releasedAt
   b. Record stripeTransferId
   c. Create TransactionStateHistory (action: DISPUTE_RESOLVED, metadata: { resolution: 'RELEASE' })
5. Notify buyer: "Dispute resolved — funds released to provider"
6. Notify provider: "Dispute resolved in your favor — funds released"
```

**Algorithm — REFUND (funds to buyer):**

```
1. Cancel the PaymentIntent via Stripe API (if uncaptured)
   OR refund the charge via Stripe API (if captured)
2. Update Dispute:
   a. status = RESOLVED_REFUNDED
   b. resolvedById = admin.id
   c. resolutionNote = note
   d. resolvedAt = now()
3. Transition Transaction to REFUNDED:
   a. Update status, refundedAt
   b. Record stripeRefundId
   c. Create TransactionStateHistory (action: DISPUTE_RESOLVED, metadata: { resolution: 'REFUND' })
4. Notify buyer: "Dispute resolved — funds refunded"
5. Notify provider: "Dispute resolved — funds refunded to buyer"
```

**Algorithm — ESCALATE:**

```
1. Update Dispute:
   a. status = ESCALATED
   b. resolvedById = admin.id
   c. resolutionNote = note
2. Create TransactionStateHistory (action: DISPUTE_ESCALATED)
3. Transaction remains in DISPUTED state
4. Notify buyer: "Dispute escalated for further review"
5. Notify provider: "Dispute escalated for further review"
6. Create high-priority admin task for manual review
```

---

## 6. Stripe Connect Onboarding Flow

### 6.1 Start Onboarding

**Trigger:** Provider calls `POST /api/v1/onboarding/start` (§FR-201)

**Algorithm:**

```
1. Check if StripeConnectedAccount exists for user:
   a. If no: create Stripe Express account via API
      - stripe.accounts.create({ type: 'express', ... })
      - Create local StripeConnectedAccount record
      - Set onboardingStatus = PENDING
   b. If yes and status != COMPLETE: use existing stripeAccountId

2. Create Account Link:
   - stripe.accountLinks.create({
       account: stripeAccountId,
       refresh_url: `${FRONTEND_URL}/onboarding/refresh`,
       return_url: `${FRONTEND_URL}/onboarding/complete`,
       type: 'account_onboarding',
     })

3. Store onboardingUrl on StripeConnectedAccount
4. Return { url: accountLink.url }
5. Frontend redirects provider to Stripe-hosted onboarding
```

### 6.2 Onboarding Status Sync

**Trigger:** `account.updated` webhook from Stripe

**Algorithm:**

```
1. Extract stripeAccountId from event
2. Look up StripeConnectedAccount by stripeAccountId
3. Update fields from Stripe account object:
   a. chargesEnabled = account.charges_enabled
   b. payoutsEnabled = account.payouts_enabled
   c. detailsSubmitted = account.details_submitted
4. Determine onboarding status:
   a. If charges_enabled AND payouts_enabled AND details_submitted:
      - onboardingStatus = COMPLETE
      - Create TransactionStateHistory (action: PROVIDER_ONBOARDED)
   b. If details_submitted but NOT charges_enabled:
      - onboardingStatus = RESTRICTED
      - Create TransactionStateHistory (action: PROVIDER_RESTRICTED)
   c. Else:
      - onboardingStatus = PENDING
5. Save updated StripeConnectedAccount
```

### 6.3 Onboarding Return/Refresh

**Return URL** (`/onboarding/complete`):
- Frontend fetches onboarding status from API
- Displays success message if COMPLETE
- Displays pending message with "Continue Onboarding" if not COMPLETE

**Refresh URL** (`/onboarding/refresh`):
- Frontend calls `POST /api/v1/onboarding/refresh-link`
- API generates new Account Link and returns URL
- Frontend redirects to new onboarding URL

---

## 7. Webhook Handler Logic

### 7.1 Webhook Receipt and Validation

```typescript
async function handleStripeWebhook(
  rawBody: Buffer,
  signature: string
): Promise<void> {
  // 1. Verify signature
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    STRIPE_WEBHOOK_SECRET
  );

  // 2. Idempotency check
  const existing = await prisma.webhookLog.findUnique({
    where: { stripeEventId: event.id },
  });

  if (existing && existing.status !== 'FAILED') {
    // Already processed or processing — skip
    return;
  }

  // 3. Create/update WebhookLog
  await prisma.webhookLog.upsert({
    where: { stripeEventId: event.id },
    create: {
      stripeEventId: event.id,
      eventType: event.type,
      status: 'PROCESSING',
      payload: event as any,
    },
    update: {
      status: 'PROCESSING',
      errorMessage: null,
    },
  });

  // 4. Enqueue for processing
  await webhookQueue.add(event.type, {
    eventId: event.id,
    eventType: event.type,
    data: event.data.object,
  });
}
```

### 7.2 Event Handlers

#### payment_intent.succeeded

```
1. Extract PaymentIntent ID from event data
2. Find Transaction by stripePaymentIntentId
3. If not found: log warning, mark webhook SKIPPED, return
4. If Transaction.status != CREATED: log info (already processed), mark SKIPPED
5. Transition Transaction: CREATED → PAYMENT_HELD
   a. Update paymentHeldAt, stripeChargeId
   b. Create TransactionStateHistory
6. Notify provider and buyer
7. Mark WebhookLog PROCESSED
```

#### payment_intent.payment_failed

```
1. Extract PaymentIntent ID from event data
2. Find Transaction by stripePaymentIntentId
3. If not found or status != CREATED: mark SKIPPED
4. Log payment failure reason
5. Notify buyer: "Payment failed — please try again"
6. Mark WebhookLog PROCESSED
```

#### payment_intent.canceled

```
1. Extract PaymentIntent ID from event data
2. Find Transaction by stripePaymentIntentId
3. If not found: mark SKIPPED
4. If status is CREATED or PAYMENT_HELD:
   a. Transition to EXPIRED
   b. Update expiredAt
   c. Create TransactionStateHistory
   d. Notify both parties
5. Mark WebhookLog PROCESSED
```

#### transfer.created

```
1. Extract Transfer ID and metadata from event data
2. Find Transaction by stripeTransferId or transfer_group
3. If not found: mark SKIPPED
4. Confirm transfer amount matches expected providerAmount
5. Log transfer confirmation
6. Mark WebhookLog PROCESSED
```

#### transfer.failed

```
1. Extract Transfer ID from event data
2. Find Transaction by stripeTransferId
3. If found:
   a. Log failure reason
   b. Create TransactionStateHistory with failure metadata
   c. Notify admin: "Transfer failed — manual intervention required"
   d. Notify provider: "Transfer failed — we are investigating"
4. Mark WebhookLog PROCESSED
```

#### payout.paid

```
1. Extract Payout ID from event data
2. Find Payout by stripePayoutId
3. If not found: mark SKIPPED
4. Update Payout: status = PAID, paidAt = now()
5. Find associated Transaction:
   a. If status is RELEASED:
      - Transition to PAID_OUT
      - Update paidOutAt
      - Create TransactionStateHistory
6. Notify provider: "Payout received"
7. Mark WebhookLog PROCESSED
```

#### payout.failed

```
1. Extract Payout ID from event data
2. Find Payout by stripePayoutId
3. If not found: mark SKIPPED
4. Update Payout: status = FAILED, failureReason = event failure reason
5. Create TransactionStateHistory (action: PAYOUT_FAILED)
6. Notify provider: "Payout failed — please check your bank details"
7. Notify admin: "Payout failed for provider"
8. Mark WebhookLog PROCESSED
```

#### charge.dispute.created

```
1. Extract Charge ID from event data
2. Find Transaction by stripeChargeId
3. If not found: mark SKIPPED
4. If Transaction does not already have a Dispute:
   a. Create Dispute record:
      - reason: OTHER
      - description: "Stripe chargeback dispute"
      - status: OPEN
   b. Transition Transaction to DISPUTED if not already
   c. Cancel auto-release timer if applicable
5. Notify admin: "Stripe chargeback dispute received"
6. Mark WebhookLog PROCESSED
```

#### charge.dispute.closed

```
1. Extract Charge ID and dispute outcome from event data
2. Find Transaction by stripeChargeId
3. Find associated Dispute
4. Update Dispute based on outcome:
   a. If won: status = RESOLVED_RELEASED
   b. If lost: status = RESOLVED_REFUNDED, transition Transaction to REFUNDED
5. Notify both parties of outcome
6. Mark WebhookLog PROCESSED
```

#### account.updated

```
1. Extract Account ID from event data
2. Find StripeConnectedAccount by stripeAccountId
3. If not found: mark SKIPPED
4. Update onboarding fields (see §6.2)
5. Mark WebhookLog PROCESSED
```

---

## 8. Idempotency Strategy

### 8.1 Webhook Idempotency

Every Stripe webhook event has a unique `event.id`. The platform uses the
`WebhookLog` table (§SRS-2 Section 3.8) to enforce at-most-once processing:

```
1. On webhook receipt: check WebhookLog for event.id
2. If found with status PROCESSED or PROCESSING: return 200 OK, skip
3. If found with status FAILED: re-process (retry scenario)
4. If not found: create WebhookLog with status RECEIVED, then PROCESSING
5. On successful processing: update to PROCESSED
6. On failure: update to FAILED with errorMessage
```

### 8.2 API Idempotency

Critical mutating endpoints support idempotency via the `Idempotency-Key` header:

| Endpoint                              | Idempotency Approach                      |
|---------------------------------------|-------------------------------------------|
| `POST /api/v1/transactions`           | Client-provided Idempotency-Key header    |
| `POST /api/v1/transactions/:id/release` | Transaction ID + status guards          |
| `POST /api/v1/disputes/:id/resolve`   | Dispute ID + status guards                |

**Idempotency-Key Implementation:**

```
1. Client sends `Idempotency-Key: <uuid>` header
2. Server checks if key exists in cache (Redis, TTL 24 hours)
3. If found: return cached response
4. If not found: process request, cache response with key, return
```

### 8.3 State Machine Idempotency

The state machine itself provides idempotency for state transitions:

```
1. Load Transaction with current status
2. Validate transition is allowed (§1.4)
3. Attempt update with WHERE clause: `WHERE id = :id AND status = :expectedStatus`
4. If 0 rows updated: transition already happened (concurrent request) — return current state
5. If 1 row updated: transition succeeded — proceed with side effects
```

This pessimistic approach prevents race conditions without distributed locks.

---

## 9. API Contracts

### 9.1 Create Transaction

**Request:**
```
POST /api/v1/transactions
Authorization: Bearer <jwt>
Content-Type: application/json
Idempotency-Key: <uuid>

{
  "providerId": "clx...",
  "amount": 5000,          // $50.00 in cents
  "description": "Logo design project"
}
```

**Response (201 Created):**
```json
{
  "id": "clx...",
  "buyerId": "clx...",
  "providerId": "clx...",
  "amount": 5000,
  "platformFee": 500,
  "providerAmount": 4500,
  "currency": "usd",
  "description": "Logo design project",
  "status": "CREATED",
  "clientSecret": "pi_xxx_secret_xxx",
  "createdAt": "2026-03-20T10:00:00.000Z"
}
```

**Error Responses:**

| Status | Code                    | Condition                              |
|--------|-------------------------|----------------------------------------|
| 400    | AMOUNT_TOO_LOW          | Amount < 500 cents                     |
| 400    | AMOUNT_TOO_HIGH         | Amount > 1000000 cents                 |
| 400    | INVALID_CURRENCY        | Currency != "usd"                      |
| 400    | PROVIDER_NOT_ONBOARDED  | Provider onboarding incomplete         |
| 401    | UNAUTHORIZED            | No valid JWT                           |
| 403    | EMAIL_NOT_VERIFIED      | Buyer email not verified               |
| 403    | NOT_A_BUYER             | User role is not BUYER                 |
| 404    | PROVIDER_NOT_FOUND      | Provider ID does not exist             |
| 409    | DUPLICATE_REQUEST       | Idempotency-Key already used           |

### 9.2 Mark Delivery

**Request:**
```
POST /api/v1/transactions/:id/deliver
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "id": "clx...",
  "status": "DELIVERED",
  "deliveredAt": "2026-03-21T15:00:00.000Z",
  "autoReleaseAt": "2026-03-24T15:00:00.000Z"
}
```

**Error Responses:**

| Status | Code               | Condition                                 |
|--------|--------------------|-------------------------------------------|
| 400    | INVALID_TRANSITION | Transaction not in PAYMENT_HELD state     |
| 401    | UNAUTHORIZED       | No valid JWT                              |
| 403    | NOT_PROVIDER       | Actor is not this transaction's provider  |
| 404    | NOT_FOUND          | Transaction not found                     |

### 9.3 Confirm Delivery

**Request:**
```
POST /api/v1/transactions/:id/confirm
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "id": "clx...",
  "status": "RELEASED",
  "releasedAt": "2026-03-22T10:00:00.000Z",
  "providerAmount": 4500,
  "stripeTransferId": "tr_xxx"
}
```

**Error Responses:**

| Status | Code               | Condition                                 |
|--------|--------------------|-------------------------------------------|
| 400    | INVALID_TRANSITION | Transaction not in DELIVERED state        |
| 401    | UNAUTHORIZED       | No valid JWT                              |
| 403    | NOT_BUYER          | Actor is not this transaction's buyer     |
| 404    | NOT_FOUND          | Transaction not found                     |

### 9.4 Create Dispute

**Request:**
```
POST /api/v1/disputes
Authorization: Bearer <jwt>

{
  "transactionId": "clx...",
  "reason": "NOT_AS_DESCRIBED",
  "description": "The delivered logo does not match the agreed specifications."
}
```

**Response (201 Created):**
```json
{
  "id": "clx...",
  "transactionId": "clx...",
  "reason": "NOT_AS_DESCRIBED",
  "description": "The delivered logo does not match the agreed specifications.",
  "status": "OPEN",
  "createdAt": "2026-03-22T12:00:00.000Z"
}
```

**Error Responses:**

| Status | Code                  | Condition                                |
|--------|-----------------------|------------------------------------------|
| 400    | INVALID_STATUS        | Transaction not in PAYMENT_HELD/DELIVERED|
| 400    | DISPUTE_WINDOW_CLOSED | More than 72h since delivery             |
| 400    | REASON_REQUIRED       | Missing reason or description            |
| 401    | UNAUTHORIZED          | No valid JWT                             |
| 403    | NOT_BUYER             | Actor is not this transaction's buyer    |
| 404    | NOT_FOUND             | Transaction not found                    |
| 409    | DISPUTE_EXISTS        | Transaction already has a dispute        |

### 9.5 Resolve Dispute

**Request:**
```
POST /api/v1/disputes/:id/resolve
Authorization: Bearer <jwt>

{
  "action": "RELEASE",
  "note": "Evidence shows service was delivered as described."
}
```

**Response (200 OK):**
```json
{
  "id": "clx...",
  "status": "RESOLVED_RELEASED",
  "resolvedById": "clx...",
  "resolutionNote": "Evidence shows service was delivered as described.",
  "resolvedAt": "2026-03-23T09:00:00.000Z",
  "transaction": {
    "id": "clx...",
    "status": "RELEASED",
    "releasedAt": "2026-03-23T09:00:00.000Z"
  }
}
```

**Error Responses:**

| Status | Code                  | Condition                                |
|--------|-----------------------|------------------------------------------|
| 400    | INVALID_ACTION        | Action not in RELEASE/REFUND/ESCALATE    |
| 400    | DISPUTE_ALREADY_RESOLVED | Dispute in terminal state             |
| 400    | NOTE_REQUIRED         | Missing resolution note                  |
| 401    | UNAUTHORIZED          | No valid JWT                             |
| 403    | NOT_ADMIN             | Actor role is not ADMIN                  |
| 404    | NOT_FOUND             | Dispute not found                        |

### 9.6 Get Transaction History

**Request:**
```
GET /api/v1/transactions/:id/history
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "transactionId": "clx...",
  "history": [
    {
      "id": "clx...",
      "fromStatus": null,
      "toStatus": "CREATED",
      "action": "TRANSACTION_CREATED",
      "actorId": "clx...",
      "metadata": null,
      "createdAt": "2026-03-20T10:00:00.000Z"
    },
    {
      "id": "clx...",
      "fromStatus": "CREATED",
      "toStatus": "PAYMENT_HELD",
      "action": "PAYMENT_HELD",
      "actorId": null,
      "metadata": { "stripeEventId": "evt_xxx" },
      "createdAt": "2026-03-20T10:01:00.000Z"
    }
  ]
}
```

---

## 10. BullMQ Queue Configuration

### 10.1 Queues

| Queue Name        | Purpose                                | Concurrency | Retry |
|-------------------|----------------------------------------|-------------|-------|
| `webhook-process` | Process Stripe webhook events          | 5           | 3     |
| `auto-release`    | Execute auto-release timers            | 2           | 3     |
| `notifications`   | Send email notifications               | 3           | 2     |
| `cleanup`         | Daily expired hold cleanup             | 1           | 1     |

### 10.2 Retry Configuration

```typescript
const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000, // 5s, 10s, 20s
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};
```

### 10.3 Dead Letter Handling

Failed jobs after max retries are moved to a dead letter queue. Admin
dashboard displays failed jobs for manual review and replay.

---

## 11. Document References

| Document   | Section  | Relationship                                     |
|------------|----------|--------------------------------------------------|
| §BRD       | 2        | Business rules implemented by domain logic       |
| §PRD       | 2        | Functional requirements driving these algorithms |
| §SRS-1     | 3        | Architecture supporting webhook pipeline         |
| §SRS-2     | 3        | Data model these algorithms operate on           |
| §SRS-4     | 3, 4     | Notifications and audit triggered by logic       |

---

*End of SRS-3 — Escrow Marketplace v1.0*
