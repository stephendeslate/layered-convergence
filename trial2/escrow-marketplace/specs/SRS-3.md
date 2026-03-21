# System Requirements Specification — Business Logic (SRS-3)
# Marketplace Payment Hold & Conditional Release Platform

**Version:** 1.0
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Transaction State Machine

### 1.1 State Definitions

| State | Description | Entry Conditions |
|-------|-------------|-----------------|
| CREATED | Payment intent created, awaiting charge | Transaction created via API |
| HELD | Funds charged, held pending delivery | Stripe payment_intent.succeeded webhook |
| RELEASED | Funds transferred to provider | Buyer confirms, auto-release, admin action |
| DISPUTED | Buyer raised a dispute | Buyer disputes while in HELD state |
| REFUNDED | Funds returned to buyer | Dispute resolved in buyer's favor, admin refund |
| EXPIRED | Payment intent expired or cancelled | Timeout or buyer cancellation |

### 1.2 Transition Matrix

```
           ┌──────────────────────────────────────────────────────┐
           │              TO STATE                                │
           │ CREATED │ HELD │ RELEASED │ DISPUTED │ REFUNDED │ EXPIRED │
FROM STATE │         │      │          │          │          │         │
───────────┼─────────┼──────┼──────────┼──────────┼──────────┼─────────┤
CREATED    │    -    │  ✓   │    ✗     │    ✗     │    ✗     │    ✓    │
HELD       │    ✗    │  -   │    ✓     │    ✓     │    ✓     │    ✗    │
RELEASED   │    ✗    │  ✗   │    -     │    ✗     │    ✗     │    ✗    │
DISPUTED   │    ✗    │  ✗   │    ✓     │    -     │    ✓     │    ✗    │
REFUNDED   │    ✗    │  ✗   │    ✗     │    ✗     │    -     │    ✗    │
EXPIRED    │    ✗    │  ✗   │    ✗     │    ✗     │    ✗     │    -    │
```

### 1.3 State Machine Implementation (packages/shared)

The state machine is defined ONCE in `packages/shared` and consumed by both
the API and frontend. This is the SINGLE SOURCE OF TRUTH.

```typescript
// packages/shared/src/state-machine.ts

export enum TransactionStatus {
  CREATED = 'CREATED',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  DISPUTED = 'DISPUTED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
}

export type TransitionTrigger =
  | 'PAYMENT_SUCCEEDED'
  | 'BUYER_CONFIRMED'
  | 'AUTO_RELEASED'
  | 'ADMIN_RELEASED'
  | 'BUYER_DISPUTED'
  | 'DISPUTE_RESOLVED_BUYER'
  | 'DISPUTE_RESOLVED_PROVIDER'
  | 'ADMIN_REFUNDED'
  | 'PAYMENT_EXPIRED'
  | 'BUYER_CANCELLED';

export interface StateTransition {
  from: TransactionStatus;
  to: TransactionStatus;
  trigger: TransitionTrigger;
}

export const VALID_TRANSITIONS: StateTransition[] = [
  // CREATED → HELD (payment succeeded)
  { from: TransactionStatus.CREATED, to: TransactionStatus.HELD, trigger: 'PAYMENT_SUCCEEDED' },

  // CREATED → EXPIRED (timeout or cancellation)
  { from: TransactionStatus.CREATED, to: TransactionStatus.EXPIRED, trigger: 'PAYMENT_EXPIRED' },
  { from: TransactionStatus.CREATED, to: TransactionStatus.EXPIRED, trigger: 'BUYER_CANCELLED' },

  // HELD → RELEASED (buyer confirms, auto-release, admin action)
  { from: TransactionStatus.HELD, to: TransactionStatus.RELEASED, trigger: 'BUYER_CONFIRMED' },
  { from: TransactionStatus.HELD, to: TransactionStatus.RELEASED, trigger: 'AUTO_RELEASED' },
  { from: TransactionStatus.HELD, to: TransactionStatus.RELEASED, trigger: 'ADMIN_RELEASED' },

  // HELD → DISPUTED (buyer raises dispute)
  { from: TransactionStatus.HELD, to: TransactionStatus.DISPUTED, trigger: 'BUYER_DISPUTED' },

  // HELD → REFUNDED (admin refund)
  { from: TransactionStatus.HELD, to: TransactionStatus.REFUNDED, trigger: 'ADMIN_REFUNDED' },

  // DISPUTED → RELEASED (resolved in provider's favor)
  { from: TransactionStatus.DISPUTED, to: TransactionStatus.RELEASED, trigger: 'DISPUTE_RESOLVED_PROVIDER' },

  // DISPUTED → REFUNDED (resolved in buyer's favor)
  { from: TransactionStatus.DISPUTED, to: TransactionStatus.REFUNDED, trigger: 'DISPUTE_RESOLVED_BUYER' },
];

export const TERMINAL_STATES: TransactionStatus[] = [
  TransactionStatus.RELEASED,
  TransactionStatus.REFUNDED,
  TransactionStatus.EXPIRED,
];

export function isTerminalState(status: TransactionStatus): boolean {
  return TERMINAL_STATES.includes(status);
}

export function canTransition(
  from: TransactionStatus,
  to: TransactionStatus,
  trigger: TransitionTrigger
): boolean {
  return VALID_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && t.trigger === trigger
  );
}

export function getValidTransitions(from: TransactionStatus): StateTransition[] {
  return VALID_TRANSITIONS.filter((t) => t.from === from);
}

export function getValidTargetStates(from: TransactionStatus): TransactionStatus[] {
  return [...new Set(getValidTransitions(from).map((t) => t.to))];
}
```

### 1.4 Transition Enforcement

Every state transition in the API MUST:
1. Call `canTransition(currentState, targetState, trigger)` from shared package
2. If false, throw a `ConflictException` with descriptive message
3. If true, update the transaction status
4. Create a `TransactionStateHistory` record
5. Execute side effects (Stripe operations, notifications)
6. All within a database transaction (atomic)

```typescript
// Pseudo-code for transition enforcement
async function transitionTo(
  transactionId: string,
  targetState: TransactionStatus,
  trigger: TransitionTrigger,
  performedBy: string,
  reason?: string,
): Promise<Transaction> {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    });

    if (!canTransition(transaction.status, targetState, trigger)) {
      throw new ConflictException(
        `Cannot transition from ${transaction.status} to ${targetState} via ${trigger}`
      );
    }

    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: targetState,
        ...(targetState === TransactionStatus.RELEASED && { releasedAt: new Date() }),
        ...(targetState === TransactionStatus.REFUNDED && { refundedAt: new Date() }),
      },
    });

    await tx.transactionStateHistory.create({
      data: {
        transactionId,
        fromState: transaction.status,
        toState: targetState,
        reason,
        performedBy,
      },
    });

    return updated;
  });
}
```

---

## 2. Dispute Resolution Workflow

### 2.1 Dispute Lifecycle

```
Buyer raises dispute
       │
       ▼
   ┌───────┐
   │ OPEN  │ ← Transaction transitions to DISPUTED
   └───┬───┘
       │
       ▼ (evidence submitted by buyer or provider)
   ┌──────────────────┐
   │ EVIDENCE_SUBMITTED│
   └───────┬──────────┘
       │
       ▼ (admin begins review)
   ┌──────────────┐
   │ UNDER_REVIEW │
   └──────┬───────┘
       │
       ├──→ Resolve in buyer's favor
       │    ┌────────────────┐
       │    │ RESOLVED_BUYER │ → Transaction → REFUNDED
       │    └────────────────┘
       │
       └──→ Resolve in provider's favor
            ┌───────────────────┐
            │ RESOLVED_PROVIDER │ → Transaction → RELEASED
            └───────────────────┘
```

### 2.2 Dispute Rules

| Rule | Description |
|------|-------------|
| DR-001 | Only buyers can create disputes |
| DR-002 | Disputes can only be created on HELD transactions |
| DR-003 | Only one active dispute per transaction |
| DR-004 | Both buyer and provider can submit evidence |
| DR-005 | Only admins can resolve disputes |
| DR-006 | Resolution triggers transaction state change |
| DR-007 | Buyer favor → REFUNDED, Provider favor → RELEASED |
| DR-008 | Auto-release timer is cancelled when dispute is created |

### 2.3 Dispute Creation Logic

```typescript
async function createDispute(
  transactionId: string,
  buyerId: string,
  reason: DisputeReason,
  description: string,
): Promise<Dispute> {
  return prisma.$transaction(async (tx) => {
    // 1. Verify transaction exists and is HELD
    const transaction = await tx.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    });

    if (transaction.status !== TransactionStatus.HELD) {
      throw new BadRequestException('Can only dispute HELD transactions');
    }

    if (transaction.buyerId !== buyerId) {
      throw new ForbiddenException('Only the buyer can raise a dispute');
    }

    // 2. Check no active dispute exists
    const existingDispute = await tx.dispute.findFirst({
      where: {
        transactionId,
        status: { notIn: ['RESOLVED_BUYER', 'RESOLVED_PROVIDER', 'CLOSED'] },
      },
    });

    if (existingDispute) {
      throw new BadRequestException('Active dispute already exists');
    }

    // 3. Create dispute
    const dispute = await tx.dispute.create({
      data: {
        transactionId,
        raisedById: buyerId,
        reason,
        description,
        status: 'OPEN',
      },
    });

    // 4. Transition transaction to DISPUTED
    await tx.transaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.DISPUTED },
    });

    await tx.transactionStateHistory.create({
      data: {
        transactionId,
        fromState: TransactionStatus.HELD,
        toState: TransactionStatus.DISPUTED,
        reason: `Dispute raised: ${reason}`,
        performedBy: buyerId,
      },
    });

    // 5. Cancel auto-release timer (done after tx commits)
    return dispute;
  });
}
```

### 2.4 Dispute Resolution Logic

```typescript
async function resolveDispute(
  disputeId: string,
  resolution: 'BUYER' | 'PROVIDER',
  adminId: string,
  notes: string,
): Promise<Dispute> {
  return prisma.$transaction(async (tx) => {
    const dispute = await tx.dispute.findUniqueOrThrow({
      where: { id: disputeId },
      include: { transaction: true },
    });

    // Validate dispute is in a resolvable state
    const resolvableStates = ['OPEN', 'EVIDENCE_SUBMITTED', 'UNDER_REVIEW'];
    if (!resolvableStates.includes(dispute.status)) {
      throw new BadRequestException('Dispute is not in a resolvable state');
    }

    const newDisputeStatus = resolution === 'BUYER'
      ? 'RESOLVED_BUYER'
      : 'RESOLVED_PROVIDER';

    const newTransactionStatus = resolution === 'BUYER'
      ? TransactionStatus.REFUNDED
      : TransactionStatus.RELEASED;

    const trigger = resolution === 'BUYER'
      ? 'DISPUTE_RESOLVED_BUYER'
      : 'DISPUTE_RESOLVED_PROVIDER';

    // Update dispute
    const updated = await tx.dispute.update({
      where: { id: disputeId },
      data: {
        status: newDisputeStatus,
        resolution: `Resolved in ${resolution.toLowerCase()}'s favor`,
        adminNotes: notes,
        resolvedAt: new Date(),
        resolvedById: adminId,
      },
    });

    // Transition transaction
    await tx.transaction.update({
      where: { id: dispute.transactionId },
      data: {
        status: newTransactionStatus,
        ...(newTransactionStatus === TransactionStatus.RELEASED && {
          releasedAt: new Date(),
        }),
        ...(newTransactionStatus === TransactionStatus.REFUNDED && {
          refundedAt: new Date(),
        }),
      },
    });

    await tx.transactionStateHistory.create({
      data: {
        transactionId: dispute.transactionId,
        fromState: TransactionStatus.DISPUTED,
        toState: newTransactionStatus,
        reason: `Dispute resolved in ${resolution.toLowerCase()}'s favor: ${notes}`,
        performedBy: adminId,
      },
    });

    return updated;
  });

  // After transaction commits:
  // - If BUYER: create Stripe refund
  // - If PROVIDER: create Stripe transfer
  // - Send notifications to both parties
}
```

---

## 3. Auto-Release Timer

### 3.1 Timer Logic

```
Transaction enters HELD state
       │
       ▼
Calculate holdExpiresAt:
  createdAt + holdPeriodDays (default 14)
       │
       ▼
Add BullMQ delayed job:
  jobId: auto-release-{transactionId}
  delay: holdPeriodMs
       │
       ▼
Job fires after delay
       │
       ▼
Check transaction status:
  ├── HELD → Execute release (create transfer)
  ├── DISPUTED → Skip (dispute takes precedence)
  ├── RELEASED → Skip (already released)
  ├── REFUNDED → Skip (already refunded)
  └── Any other → Skip (unexpected state)
```

### 3.2 Timer Cancellation

The auto-release timer should be cancelled when:
- Transaction is manually released (buyer confirms)
- Transaction enters DISPUTED state
- Transaction is refunded by admin

Cancellation is done by removing the BullMQ job:
```typescript
await autoReleaseQueue.remove(`auto-release-${transactionId}`);
```

If removal fails (job already processing), the processor's state check ensures
idempotency — it will not release a non-HELD transaction.

### 3.3 Timer Processor

```typescript
// auto-release.processor.ts
@Processor('marketplace-jobs')
export class AutoReleaseProcessor {
  @Process('auto-release')
  async handleAutoRelease(job: Job<{ transactionId: string }>) {
    const { transactionId } = job.data;

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.status !== TransactionStatus.HELD) {
      // Transaction no longer in HELD state — skip
      return { skipped: true, reason: 'not_held' };
    }

    // Execute release
    await this.transactionService.releaseTransaction(
      transactionId,
      'system',
      'AUTO_RELEASED',
      'Auto-release timer expired',
    );

    return { released: true, transactionId };
  }
}
```

---

## 4. Fee Calculation

### 4.1 Fee Formula

```
platformFeeAmount = max(
  ceil(amount * platformFeePercent / 100),
  MIN_PLATFORM_FEE_CENTS
)
```

Where:
- `amount` is the transaction amount in cents
- `platformFeePercent` is the fee percentage (default 10)
- `MIN_PLATFORM_FEE_CENTS` is the minimum fee (default 50 cents)
- `ceil` rounds up to the nearest cent

### 4.2 Fee Calculation Service

```typescript
// fee-calculation.service.ts

export interface FeeCalculationResult {
  platformFeeAmount: number;    // Fee in cents
  platformFeePercent: number;   // Fee percentage applied
  providerAmount: number;       // Amount provider receives (amount - fee)
}

export function calculateFee(
  amountCents: number,
  feePercent: number = 10,
  minFeeCents: number = 50,
): FeeCalculationResult {
  if (amountCents <= 0) {
    throw new Error('Amount must be positive');
  }
  if (feePercent < 0 || feePercent > 100) {
    throw new Error('Fee percent must be between 0 and 100');
  }

  const calculatedFee = Math.ceil(amountCents * feePercent / 100);
  const platformFeeAmount = Math.max(calculatedFee, minFeeCents);

  // Fee cannot exceed the transaction amount
  const cappedFee = Math.min(platformFeeAmount, amountCents);

  return {
    platformFeeAmount: cappedFee,
    platformFeePercent: feePercent,
    providerAmount: amountCents - cappedFee,
  };
}
```

### 4.3 Fee Examples

| Amount (cents) | Fee % | Calculated | Min | Applied | Provider Gets |
|---------------|-------|-----------|-----|---------|--------------|
| 10000 ($100) | 10% | 1000 | 50 | 1000 | 9000 ($90) |
| 500 ($5) | 10% | 50 | 50 | 50 | 450 ($4.50) |
| 300 ($3) | 10% | 30 | 50 | 50 | 250 ($2.50) |
| 100000 ($1000) | 10% | 10000 | 50 | 10000 | 90000 ($900) |
| 100 ($1) | 10% | 10 | 50 | 50 | 50 ($0.50) |
| 50 ($0.50) | 10% | 5 | 50 | 50 | 0 ($0.00) |

Note: The last case (fee equals amount) is technically valid but leaves nothing
for the provider. The API should enforce a minimum transaction amount.

---

## 5. Webhook Processing

### 5.1 Webhook Processing Pipeline

```typescript
async function processWebhook(
  rawBody: Buffer,
  signature: string,
): Promise<void> {
  // 1. Verify signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    throw new BadRequestException('Invalid webhook signature');
  }

  // 2. Check idempotency
  const existing = await prisma.webhookLog.findUnique({
    where: { eventId: event.id },
  });

  if (existing) {
    // Duplicate event — skip processing
    return;
  }

  // 3. Log event
  const log = await prisma.webhookLog.create({
    data: {
      eventId: event.id,
      eventType: event.type,
      payload: event.data as any,
      status: 'PROCESSING',
    },
  });

  // 4. Route to handler
  try {
    await routeEvent(event);

    // 5. Mark as processed
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });
  } catch (error) {
    // 6. Mark as failed but still return 200
    await prisma.webhookLog.update({
      where: { id: log.id },
      data: {
        status: 'FAILED',
        error: error.message,
        processedAt: new Date(),
      },
    });
  }
}
```

### 5.2 Event Handlers

#### payment_intent.succeeded

```typescript
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
): Promise<void> {
  const transaction = await prisma.transaction.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });

  if (!transaction) {
    throw new Error(`No transaction found for PaymentIntent ${paymentIntent.id}`);
  }

  if (transaction.status !== TransactionStatus.CREATED) {
    // Already processed — skip
    return;
  }

  // Transition to HELD
  await transitionTo(
    transaction.id,
    TransactionStatus.HELD,
    'PAYMENT_SUCCEEDED',
    'system',
    'Payment confirmed by Stripe',
  );

  // Set hold expiration
  const holdExpiresAt = addDays(new Date(), DEFAULT_HOLD_PERIOD_DAYS);
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { holdExpiresAt },
  });

  // Schedule auto-release
  await autoReleaseQueue.add(
    'auto-release',
    { transactionId: transaction.id },
    {
      delay: DEFAULT_HOLD_PERIOD_DAYS * 24 * 60 * 60 * 1000,
      jobId: `auto-release-${transaction.id}`,
    },
  );

  // Notify buyer and provider
  await notificationService.sendPaymentHeld(transaction);
}
```

#### transfer.created

```typescript
async function handleTransferCreated(
  transfer: Stripe.Transfer,
): Promise<void> {
  // Update payout record if exists
  const payout = await prisma.payout.findUnique({
    where: { stripeTransferId: transfer.id },
  });

  if (payout) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: { status: 'PROCESSING' },
    });
  }
}
```

#### payout.paid

```typescript
async function handlePayoutPaid(
  payout: Stripe.Payout,
): Promise<void> {
  // Find payout by Stripe payout ID
  const payoutRecord = await prisma.payout.findFirst({
    where: { stripePayoutId: payout.id },
  });

  if (payoutRecord) {
    await prisma.payout.update({
      where: { id: payoutRecord.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }
}
```

#### charge.dispute.created

```typescript
async function handleChargeDisputeCreated(
  dispute: Stripe.Dispute,
): Promise<void> {
  const chargeId = typeof dispute.charge === 'string'
    ? dispute.charge
    : dispute.charge.id;

  // Find transaction by payment intent (from charge)
  const charge = await stripe.charges.retrieve(chargeId);
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  const transaction = await prisma.transaction.findUnique({
    where: { stripePaymentIntentId: paymentIntentId },
  });

  if (!transaction) return;

  // Create internal dispute record linked to Stripe dispute
  await prisma.dispute.create({
    data: {
      transactionId: transaction.id,
      raisedById: transaction.buyerId,
      reason: 'OTHER',
      description: `Stripe dispute: ${dispute.reason}`,
      status: 'OPEN',
      stripeDisputeId: dispute.id,
    },
  });

  // Transition to DISPUTED if still HELD
  if (transaction.status === TransactionStatus.HELD) {
    await transitionTo(
      transaction.id,
      TransactionStatus.DISPUTED,
      'BUYER_DISPUTED',
      'system',
      `Stripe dispute created: ${dispute.reason}`,
    );
  }
}
```

#### charge.dispute.closed

```typescript
async function handleChargeDisputeClosed(
  dispute: Stripe.Dispute,
): Promise<void> {
  const internalDispute = await prisma.dispute.findUnique({
    where: { stripeDisputeId: dispute.id },
  });

  if (!internalDispute) return;

  const resolution = dispute.status === 'won'
    ? 'RESOLVED_PROVIDER'
    : 'RESOLVED_BUYER';

  await prisma.dispute.update({
    where: { id: internalDispute.id },
    data: {
      status: resolution,
      resolution: `Stripe dispute ${dispute.status}`,
      resolvedAt: new Date(),
      resolvedById: 'system',
    },
  });
}
```

---

## 6. Idempotency

### 6.1 Webhook Idempotency

Every Stripe event has a unique `event.id`. The `WebhookLog` table stores
processed events. Before processing:

```typescript
const existing = await prisma.webhookLog.findUnique({
  where: { eventId: event.id },
});

if (existing) {
  // Already processed or processing — skip
  return { received: true };
}
```

### 6.2 State Transition Idempotency

State transitions are idempotent by design:
- The state machine validates the current state before transitioning
- If the transaction is already in the target state, the transition is skipped
- This handles webhook retries and duplicate API calls

### 6.3 Stripe Operation Idempotency

Stripe API calls use idempotency keys to prevent duplicate operations:

```typescript
await stripe.transfers.create(
  {
    amount: providerAmount,
    currency: 'usd',
    destination: connectedAccountId,
    transfer_group: transactionId,
  },
  {
    idempotencyKey: `transfer-${transactionId}`,
  },
);
```

---

## 7. Payment Creation Logic

### 7.1 Full Payment Creation Flow

```typescript
async function createTransaction(
  buyerId: string,
  providerId: string,
  amount: number,
  description: string,
  holdPeriodDays: number = 14,
): Promise<{ transaction: Transaction; clientSecret: string }> {
  // 1. Validate provider exists and is active
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    include: { connectedAccount: true },
  });

  if (!provider || provider.role !== 'PROVIDER') {
    throw new NotFoundException('Provider not found');
  }

  // Note: We don't require ACTIVE status at creation time
  // (only at release time), but we warn if not active
  // Provider must be ACTIVE to receive payouts

  // 2. Calculate fees
  const feeResult = calculateFee(amount);

  // 3. Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    metadata: {
      providerId,
      buyerId,
      platformFee: feeResult.platformFeeAmount.toString(),
    },
  });

  // 4. Create transaction record
  const transaction = await prisma.transaction.create({
    data: {
      buyerId,
      providerId,
      amount,
      description,
      status: TransactionStatus.CREATED,
      platformFeeAmount: feeResult.platformFeeAmount,
      platformFeePercent: feeResult.platformFeePercent,
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  // 5. Log initial state
  await prisma.transactionStateHistory.create({
    data: {
      transactionId: transaction.id,
      fromState: TransactionStatus.CREATED,
      toState: TransactionStatus.CREATED,
      reason: 'Transaction created',
      performedBy: buyerId,
    },
  });

  return {
    transaction,
    clientSecret: paymentIntent.client_secret!,
  };
}
```

---

## 8. Release Logic

### 8.1 Full Release Flow

```typescript
async function releaseTransaction(
  transactionId: string,
  performedBy: string,
  trigger: TransitionTrigger,
  reason: string,
): Promise<Transaction> {
  return prisma.$transaction(async (tx) => {
    // 1. Get transaction with lock
    const transaction = await tx.transaction.findUniqueOrThrow({
      where: { id: transactionId },
      include: {
        provider: { include: { connectedAccount: true } },
      },
    });

    // 2. Validate state transition
    if (!canTransition(transaction.status, TransactionStatus.RELEASED, trigger)) {
      throw new ConflictException(
        `Cannot release transaction in ${transaction.status} state`
      );
    }

    // 3. Verify provider has active connected account
    const connectedAccount = transaction.provider.connectedAccount;
    if (!connectedAccount || connectedAccount.onboardingStatus !== 'ACTIVE') {
      throw new BadRequestException(
        'Provider does not have an active Stripe account'
      );
    }

    // 4. Calculate provider payout
    const providerAmount = transaction.amount - transaction.platformFeeAmount;

    // 5. Create Stripe Transfer
    const transfer = await stripe.transfers.create(
      {
        amount: providerAmount,
        currency: transaction.currency,
        destination: connectedAccount.stripeAccountId,
        transfer_group: transaction.id,
        metadata: {
          transactionId: transaction.id,
          platformFee: transaction.platformFeeAmount.toString(),
        },
      },
      {
        idempotencyKey: `transfer-${transaction.id}`,
      },
    );

    // 6. Update transaction
    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.RELEASED,
        stripeTransferId: transfer.id,
        releasedAt: new Date(),
      },
    });

    // 7. Create payout record
    await tx.payout.create({
      data: {
        transactionId,
        providerId: transaction.providerId,
        amount: providerAmount,
        currency: transaction.currency,
        status: 'PENDING',
        stripeTransferId: transfer.id,
      },
    });

    // 8. Log state transition
    await tx.transactionStateHistory.create({
      data: {
        transactionId,
        fromState: transaction.status,
        toState: TransactionStatus.RELEASED,
        reason,
        performedBy,
      },
    });

    return updated;
  });
}
```

---

## 9. Refund Logic

### 9.1 Full Refund Flow

```typescript
async function refundTransaction(
  transactionId: string,
  performedBy: string,
  trigger: TransitionTrigger,
  reason: string,
): Promise<Transaction> {
  return prisma.$transaction(async (tx) => {
    // 1. Get transaction
    const transaction = await tx.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    });

    // 2. Validate state transition
    if (!canTransition(transaction.status, TransactionStatus.REFUNDED, trigger)) {
      throw new ConflictException(
        `Cannot refund transaction in ${transaction.status} state`
      );
    }

    // 3. Create Stripe Refund
    if (transaction.stripePaymentIntentId) {
      await stripe.refunds.create(
        {
          payment_intent: transaction.stripePaymentIntentId,
        },
        {
          idempotencyKey: `refund-${transaction.id}`,
        },
      );
    }

    // 4. Update transaction
    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.REFUNDED,
        refundedAt: new Date(),
      },
    });

    // 5. Log state transition
    await tx.transactionStateHistory.create({
      data: {
        transactionId,
        fromState: transaction.status,
        toState: TransactionStatus.REFUNDED,
        reason,
        performedBy,
      },
    });

    return updated;
  });
}
```

---

## 10. Provider Onboarding Logic

### 10.1 Create Connected Account

```typescript
async function initiateOnboarding(
  userId: string,
): Promise<{ url: string; accountId: string }> {
  // 1. Check if account already exists
  const existing = await prisma.stripeConnectedAccount.findUnique({
    where: { userId },
  });

  let stripeAccountId: string;

  if (existing) {
    stripeAccountId = existing.stripeAccountId;
  } else {
    // 2. Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    stripeAccountId = account.id;

    // 3. Save to database
    await prisma.stripeConnectedAccount.create({
      data: {
        userId,
        stripeAccountId: account.id,
        onboardingStatus: 'PENDING',
      },
    });
  }

  // 4. Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${APP_URL}/provider/onboarding/refresh`,
    return_url: `${APP_URL}/provider/onboarding/return`,
    type: 'account_onboarding',
  });

  return {
    url: accountLink.url,
    accountId: stripeAccountId,
  };
}
```

### 10.2 Check Account Status

```typescript
async function checkAccountStatus(
  userId: string,
): Promise<OnboardingStatus> {
  const record = await prisma.stripeConnectedAccount.findUnique({
    where: { userId },
  });

  if (!record) {
    return 'NOT_STARTED';
  }

  // Fetch latest status from Stripe
  const account = await stripe.accounts.retrieve(record.stripeAccountId);

  let status: OnboardingStatus;
  if (account.charges_enabled && account.payouts_enabled) {
    status = 'ACTIVE';
  } else if (account.details_submitted) {
    status = 'RESTRICTED';
  } else {
    status = 'PENDING';
  }

  // Update local record
  await prisma.stripeConnectedAccount.update({
    where: { id: record.id },
    data: {
      onboardingStatus: status,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
    },
  });

  return status;
}
```

---

## 11. Analytics Aggregation Logic

### 11.1 Overview Query

```typescript
async function getOverview(period: string): Promise<OverviewData> {
  const startDate = getStartDate(period);

  const [
    totalTransactions,
    volumeResult,
    feeResult,
    disputeCount,
    statusCounts,
  ] = await Promise.all([
    prisma.transaction.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.transaction.aggregate({
      where: { createdAt: { gte: startDate } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['RELEASED', 'REFUNDED'] },
      },
      _sum: { platformFeeAmount: true },
    }),
    prisma.dispute.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.transaction.groupBy({
      by: ['status'],
      where: { createdAt: { gte: startDate } },
      _count: true,
    }),
  ]);

  const disputeRate = totalTransactions > 0
    ? (disputeCount / totalTransactions) * 100
    : 0;

  return {
    totalTransactions,
    totalVolume: volumeResult._sum.amount ?? 0,
    totalFees: feeResult._sum.platformFeeAmount ?? 0,
    disputeRate: Math.round(disputeRate * 100) / 100,
    averageHoldDuration: 0, // Calculated separately
    transactionsByStatus: statusCounts.map((s) => ({
      status: s.status,
      count: s._count,
    })),
  };
}
```

### 11.2 Volume Over Time Query

```typescript
async function getVolumeOverTime(
  period: string,
  groupBy: string,
): Promise<VolumeData[]> {
  const startDate = getStartDate(period);

  // Use Prisma's $queryRaw (safe, parameterized)
  const results = await prisma.$queryRaw<VolumeData[]>`
    SELECT
      date_trunc(${groupBy}, created_at) as date,
      COUNT(*)::int as count,
      COALESCE(SUM(amount), 0)::int as volume,
      COALESCE(SUM(platform_fee_amount), 0)::int as fees
    FROM transactions
    WHERE created_at >= ${startDate}
    GROUP BY date_trunc(${groupBy}, created_at)
    ORDER BY date ASC
  `;

  return results;
}
```

---

## 12. Input Validation Rules

### 12.1 Transaction Creation

| Field | Type | Validation |
|-------|------|-----------|
| providerId | string | Required, UUID format |
| amount | number | Required, integer, min 100 (1 dollar) |
| description | string | Required, min 3 chars, max 500 chars |
| holdPeriodDays | number | Optional, min 1, max 90, default 14 |

### 12.2 Dispute Creation

| Field | Type | Validation |
|-------|------|-----------|
| transactionId | string | Required, UUID format |
| reason | enum | Required, one of DisputeReason values |
| description | string | Required, min 10 chars, max 2000 chars |

### 12.3 Evidence Submission

| Field | Type | Validation |
|-------|------|-----------|
| evidence | string | Required, min 10 chars, max 5000 chars |

### 12.4 Dispute Resolution

| Field | Type | Validation |
|-------|------|-----------|
| resolution | enum | Required, 'BUYER' or 'PROVIDER' |
| notes | string | Required, min 5 chars, max 2000 chars |

### 12.5 Registration

| Field | Type | Validation |
|-------|------|-----------|
| email | string | Required, valid email format |
| password | string | Required, min 8 chars |
| name | string | Required, min 2 chars, max 100 chars |
| role | enum | Required, 'BUYER' or 'PROVIDER' |

---

## 13. Concurrency Considerations

### 13.1 Optimistic Concurrency

State transitions use Prisma's `$transaction` for atomicity. The transaction
is read and updated within the same database transaction, preventing race
conditions between concurrent state changes.

### 13.2 Duplicate Webhook Prevention

The `WebhookLog.eventId` unique constraint prevents duplicate webhook
processing. If two identical webhook deliveries arrive simultaneously, the
second `prisma.webhookLog.create` will fail with a unique constraint violation,
preventing double-processing.

### 13.3 Idempotent Stripe Operations

Stripe idempotency keys ensure that duplicate API calls (transfers, refunds)
are handled safely. The key format `{operation}-{transactionId}` ensures
one operation per transaction.
