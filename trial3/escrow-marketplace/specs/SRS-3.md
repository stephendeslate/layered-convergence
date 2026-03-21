# Software Requirements Specification — Part 3: Business Logic
# Escrow Marketplace

**Version:** 1.0 | **Date:** 2026-03-20

---

## 1. Transaction State Machine [VERIFY:STATE_MACHINE]

### 1.1 States and Transitions
```
CREATED ──────────► PAYMENT_PENDING ──────► HELD
                                              │
                    ┌─────────────────────────┤
                    ▼             ▼            ▼
                 DISPUTED      EXPIRED     RELEASED
                    │             │            │
          ┌────────┤             ▼            ▼
          ▼        ▼          RELEASED   TRANSFER_PENDING
   RESOLVED_BUYER  RESOLVED_PROVIDER       │
          │              │                  ▼
          ▼              ▼             TRANSFERRED
   REFUND_PENDING    RELEASED              │
          │                                ▼
          ▼                          PAYOUT_PENDING
       REFUNDED                            │
                                           ▼
                                          PAID
```

### 1.2 Transition Logic
- **CREATED → PAYMENT_PENDING:** When Stripe PaymentIntent is created
- **PAYMENT_PENDING → HELD:** When `payment_intent.succeeded` webhook fires
- **HELD → RELEASED:** Buyer confirms delivery OR auto-release timer fires
- **HELD → DISPUTED:** Buyer raises dispute
- **HELD → EXPIRED:** Hold period passes without action → auto-transitions to RELEASED
- **RELEASED → TRANSFER_PENDING:** Platform creates Stripe Transfer
- **TRANSFER_PENDING → TRANSFERRED:** `transfer.created` webhook fires
- **TRANSFERRED → PAYOUT_PENDING:** Payout initiated
- **PAYOUT_PENDING → PAID:** `payout.paid` webhook fires
- **DISPUTED → RESOLVED_BUYER:** Admin resolves in buyer's favor
- **DISPUTED → RESOLVED_PROVIDER:** Admin resolves in provider's favor
- **RESOLVED_BUYER → REFUND_PENDING:** Refund initiated
- **REFUND_PENDING → REFUNDED:** Refund completed
- **RESOLVED_PROVIDER → RELEASED:** Funds released to provider

### 1.3 Transition Validation
```typescript
function validateTransition(from: TransactionStatus, to: TransactionStatus): void {
  const validTargets = VALID_TRANSITIONS[from];
  if (!validTargets?.includes(to)) {
    throw new BadRequestException(
      `Invalid transition from ${from} to ${to}. Valid targets: ${validTargets?.join(', ') || 'none'}`
    );
  }
}
```

### 1.4 State History Logging
Every transition creates a TransactionStateHistory record with:
- fromState, toState
- reason (human-readable)
- timestamp (server time)

## 2. Payment Flow

### 2.1 Payment Creation
```typescript
async createTransaction(buyerId: string, dto: CreateTransactionDto) {
  // 1. Verify provider exists and is onboarded
  // 2. Calculate platform fee (default 5%)
  // 3. Create Transaction record (status: CREATED)
  // 4. Create Stripe PaymentIntent with metadata.transactionId
  // 5. Transition to PAYMENT_PENDING
  // 6. Return client_secret for frontend payment confirmation
}
```

### 2.2 Platform Fee Calculation
- Default: 5% of transaction amount
- Minimum fee: $0.50 (50 cents)
- Fee deducted before transfer to provider
- `platformFee` stored on Transaction record

### 2.3 Hold Period
- Default: 14 days from payment confirmation
- Configurable per transaction (holdDays in CreateTransactionDto)
- `holdUntil` = payment confirmation timestamp + holdDays
- Auto-release BullMQ job scheduled for holdUntil

## 3. Auto-Release Timer

### 3.1 BullMQ Delayed Job
```typescript
// On PAYMENT_PENDING → HELD transition:
await this.autoReleaseQueue.add(
  'auto-release',
  { transactionId },
  { delay: holdPeriodMs, jobId: `auto-release-${transactionId}` }
);
```

### 3.2 Timer Freeze on Dispute
```typescript
// On HELD → DISPUTED transition:
await this.autoReleaseQueue.remove(`auto-release-${transactionId}`);
```

### 3.3 Auto-Release Execution
```typescript
// BullMQ processor:
async processAutoRelease(job: Job<{ transactionId: string }>) {
  const txn = await this.prisma.transaction.findFirstOrThrow({
    where: { id: job.data.transactionId, status: 'HELD' }
  });
  await this.transitionState(txn.id, 'HELD', 'EXPIRED');
  // EXPIRED auto-transitions to RELEASED
  await this.transitionState(txn.id, 'EXPIRED', 'RELEASED');
  await this.initiateTransfer(txn);
}
```

## 4. Dispute Resolution

### 4.1 Dispute Creation
- Only buyer can raise dispute
- Transaction must be in HELD state
- Creates Dispute record (status: OPEN)
- Transitions transaction to DISPUTED
- Freezes auto-release timer

### 4.2 Evidence Submission
- Both buyer and provider can submit evidence
- Evidence stored as JSON array on Dispute record
- Each entry: { submittedBy, text, submittedAt }

### 4.3 Admin Resolution
- Admin selects resolution: BUYER_FAVOR, PROVIDER_FAVOR, or ESCALATED
- BUYER_FAVOR: transaction → RESOLVED_BUYER → REFUND_PENDING → REFUNDED
- PROVIDER_FAVOR: transaction → RESOLVED_PROVIDER → RELEASED → transfer flow
- ESCALATED: marked for external Stripe dispute process

## 5. Stripe Connect Integration

### 5.1 Provider Onboarding
```typescript
async startOnboarding(userId: string) {
  // 1. Create Stripe Express Account
  // 2. Create StripeConnectedAccount record
  // 3. Create Account Link (onboarding URL)
  // 4. Return onboarding URL to redirect provider
}
```

### 5.2 Webhook Processing [VERIFY:WEBHOOK_IDEMPOTENCY]
```typescript
async handleWebhook(signature: string, body: Buffer) {
  // 1. Verify Stripe signature
  // 2. Check WebhookLog for duplicate eventId
  // 3. If duplicate → return 200 (idempotent)
  // 4. Process event by type
  // 5. Log to WebhookLog with processedAt
}
```

### 5.3 Transfer Creation
```typescript
async initiateTransfer(transaction: Transaction) {
  // 1. Get provider's connected account
  // 2. Create Stripe Transfer (amount - platformFee)
  // 3. Transition to TRANSFER_PENDING
  // 4. transfer.created webhook → TRANSFERRED
}
```

## 6. Webhook Event Handlers

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Transition PAYMENT_PENDING → HELD, schedule auto-release |
| `transfer.created` | Transition TRANSFER_PENDING → TRANSFERRED |
| `payout.paid` | Transition PAYOUT_PENDING → PAID |
| `charge.dispute.created` | Create/update Dispute record |
| `charge.dispute.closed` | Update Dispute resolution |
| `account.updated` | Update StripeConnectedAccount status |
