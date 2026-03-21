/**
 * Factory functions for creating test data.
 * All IDs are deterministic for predictable tests.
 */

let counter = 0;

export function resetFactoryCounter() {
  counter = 0;
}

function nextId(): string {
  counter++;
  return `test_${counter.toString().padStart(6, '0')}`;
}

export function createUser(overrides: Record<string, unknown> = {}) {
  const id = nextId();
  return {
    id,
    email: `user_${id}@test.com`,
    passwordHash: '$2b$04$test_hash_placeholder',
    displayName: `Test User ${id}`,
    role: 'BUYER' as const,
    emailVerified: true,
    emailVerifiedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTransaction(overrides: Record<string, unknown> = {}) {
  const id = nextId();
  return {
    id,
    buyerId: nextId(),
    providerId: nextId(),
    amount: 10000,
    platformFee: 1000,
    providerAmount: 9000,
    currency: 'usd',
    description: `Test transaction ${id}`,
    status: 'CREATED' as const,
    stripePaymentIntentId: `pi_test_${id}`,
    stripeChargeId: null,
    stripeTransferId: null,
    stripeRefundId: null,
    paymentHeldAt: null,
    deliveredAt: null,
    releasedAt: null,
    paidOutAt: null,
    disputedAt: null,
    refundedAt: null,
    expiredAt: null,
    autoReleaseAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createDispute(overrides: Record<string, unknown> = {}) {
  const id = nextId();
  return {
    id,
    transactionId: nextId(),
    filedById: nextId(),
    reason: 'NOT_AS_DESCRIBED' as const,
    description: `Test dispute ${id}`,
    status: 'OPEN' as const,
    resolvedById: null,
    resolutionNote: null,
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createPayout(overrides: Record<string, unknown> = {}) {
  const id = nextId();
  return {
    id,
    transactionId: nextId(),
    connectedAccountId: nextId(),
    stripePayoutId: `po_test_${id}`,
    amount: 9000,
    status: 'PENDING' as const,
    failureReason: null,
    paidAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createConnectedAccount(overrides: Record<string, unknown> = {}) {
  const id = nextId();
  return {
    id,
    userId: nextId(),
    stripeAccountId: `acct_test_${id}`,
    onboardingStatus: 'COMPLETE' as const,
    chargesEnabled: true,
    payoutsEnabled: true,
    detailsSubmitted: true,
    onboardingUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createWebhookLog(overrides: Record<string, unknown> = {}) {
  const id = nextId();
  return {
    id,
    stripeEventId: `evt_test_${id}`,
    eventType: 'payment_intent.succeeded',
    status: 'RECEIVED' as const,
    payload: { id: `evt_test_${id}`, type: 'payment_intent.succeeded' },
    errorMessage: null,
    processedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}
