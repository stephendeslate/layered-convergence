/**
 * E2E tests — Transaction lifecycle:
 *   CREATED → PAYMENT_HELD → DELIVERED → RELEASED → PAID_OUT
 *
 * Tests the full happy-path lifecycle plus edge cases.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createTestApp,
  closeTestApp,
  cleanDatabase,
  registerUser,
  createAdminUser,
  onboardProvider,
  TestApp,
} from './setup';

describe('Transaction Lifecycle E2E', () => {
  let t: TestApp;
  let buyerToken: string;
  let providerToken: string;
  let adminToken: string;
  let buyerId: string;
  let providerId: string;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase(t.prisma);

    // Register buyer
    const buyer = await registerUser(t.request, {
      email: 'buyer-lifecycle@e2e.test',
      password: 'BuyerPass123',
      displayName: 'Lifecycle Buyer',
      role: 'BUYER',
    });
    buyerToken = buyer.tokens.accessToken;
    buyerId = buyer.user.id;

    // Register provider
    const provider = await registerUser(t.request, {
      email: 'provider-lifecycle@e2e.test',
      password: 'ProviderPass123',
      displayName: 'Lifecycle Provider',
      role: 'PROVIDER',
    });
    providerToken = provider.tokens.accessToken;
    providerId = provider.user.id;

    // Onboard provider (create Stripe connected account)
    await onboardProvider(t.prisma, providerId);

    // Create admin
    const admin = await createAdminUser(t.prisma, t.request);
    adminToken = admin.tokens.accessToken;
  });

  // ─── Create Transaction ──────────────────────────────────────────────────

  describe('Create Transaction', () => {
    it('should create a transaction with correct fee calculation', async () => {
      const res = await t.request
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          providerId,
          amount: 10000, // $100.00
          description: 'E2E test transaction for lifecycle validation',
        })
        .expect(201);

      expect(res.body.buyerId).toBe(buyerId);
      expect(res.body.providerId).toBe(providerId);
      expect(res.body.amount).toBe(10000);
      expect(res.body.platformFee).toBe(1000); // 10%
      expect(res.body.providerAmount).toBe(9000);
      expect(res.body.status).toBe('CREATED');
      expect(res.body.clientSecret).toBeTruthy();
      expect(res.body.stripePaymentIntentId).toBeTruthy();
    });

    it('should reject amount below minimum ($5.00)', async () => {
      await t.request
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          providerId,
          amount: 499,
          description: 'Below minimum amount for e2e test',
        })
        .expect(400);
    });

    it('should reject amount above maximum ($10,000.00)', async () => {
      await t.request
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          providerId,
          amount: 1000001,
          description: 'Above maximum amount for e2e test',
        })
        .expect(400);
    });

    it('should reject transaction with non-onboarded provider', async () => {
      // Register another provider without onboarding
      const noOnboard = await registerUser(t.request, {
        email: 'no-onboard@e2e.test',
        password: 'NoOnboard123',
        displayName: 'No Onboard Provider',
        role: 'PROVIDER',
      });

      await t.request
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          providerId: noOnboard.user.id,
          amount: 5000,
          description: 'Should fail because provider is not onboarded',
        })
        .expect(400);
    });
  });

  // ─── Full Lifecycle: CREATED → PAYMENT_HELD → DELIVERED → RELEASED ─────

  describe('Full lifecycle', () => {
    let transactionId: string;

    async function createTransaction() {
      const res = await t.request
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          providerId,
          amount: 10000,
          description: 'Full lifecycle test transaction for E2E suite',
        })
        .expect(201);
      return res.body;
    }

    async function simulatePaymentHeld(txnId: string) {
      // Simulate webhook: payment_intent.succeeded
      // In test, we directly confirm payment via the service
      await t.prisma.transaction.updateMany({
        where: { id: txnId, status: 'CREATED' },
        data: {
          status: 'PAYMENT_HELD',
          paymentHeldAt: new Date(),
          stripeChargeId: `ch_test_${txnId.slice(0, 8)}`,
        },
      });
      await t.prisma.transactionStateHistory.create({
        data: {
          transactionId: txnId,
          fromStatus: 'CREATED',
          toStatus: 'PAYMENT_HELD',
          action: 'PAYMENT_HELD',
          actorId: null,
        },
      });
    }

    it('should complete full lifecycle: create → hold → deliver → release', async () => {
      // Step 1: Create
      const txn = await createTransaction();
      transactionId = txn.id;
      expect(txn.status).toBe('CREATED');

      // Step 2: Simulate payment held (normally via Stripe webhook)
      await simulatePaymentHeld(transactionId);

      // Verify PAYMENT_HELD state
      const heldRes = await t.request
        .get(`/api/v1/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);
      expect(heldRes.body.status).toBe('PAYMENT_HELD');

      // Step 3: Provider marks delivery
      const deliverRes = await t.request
        .post(`/api/v1/transactions/${transactionId}/deliver`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);
      expect(deliverRes.body.status).toBe('DELIVERED');
      expect(deliverRes.body.deliveredAt).toBeTruthy();
      expect(deliverRes.body.autoReleaseAt).toBeTruthy();

      // Step 4: Buyer confirms delivery (releases payment)
      const confirmRes = await t.request
        .post(`/api/v1/transactions/${transactionId}/confirm`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);
      expect(confirmRes.body.status).toBe('RELEASED');
      expect(confirmRes.body.releasedAt).toBeTruthy();
      expect(confirmRes.body.stripeTransferId).toBeTruthy();
    });

    it('should track transaction state history', async () => {
      const txn = await createTransaction();
      transactionId = txn.id;
      await simulatePaymentHeld(transactionId);

      // Mark delivery
      await t.request
        .post(`/api/v1/transactions/${transactionId}/deliver`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      // Confirm delivery
      await t.request
        .post(`/api/v1/transactions/${transactionId}/confirm`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      // Check timeline
      const timelineRes = await t.request
        .get(`/api/v1/transactions/${transactionId}/timeline`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(timelineRes.body.currentStatus).toBe('RELEASED');
      expect(timelineRes.body.timeline.length).toBeGreaterThanOrEqual(3);
    });

    it('should allow admin to release payment from DELIVERED state', async () => {
      const txn = await createTransaction();
      transactionId = txn.id;
      await simulatePaymentHeld(transactionId);

      // Provider marks delivery
      await t.request
        .post(`/api/v1/transactions/${transactionId}/deliver`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      // Admin releases
      const res = await t.request
        .post(`/api/v1/transactions/${transactionId}/release`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe('RELEASED');
    });

    it('should prevent delivery by non-provider', async () => {
      const txn = await createTransaction();
      await simulatePaymentHeld(txn.id);

      // Another provider tries to mark delivery
      const other = await registerUser(t.request, {
        email: 'other-prov@e2e.test',
        password: 'OtherProv123',
        displayName: 'Other Provider',
        role: 'PROVIDER',
      });

      await t.request
        .post(`/api/v1/transactions/${txn.id}/deliver`)
        .set('Authorization', `Bearer ${other.tokens.accessToken}`)
        .expect(403);
    });

    it('should prevent confirmation by non-buyer', async () => {
      const txn = await createTransaction();
      await simulatePaymentHeld(txn.id);

      await t.request
        .post(`/api/v1/transactions/${txn.id}/deliver`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(200);

      // Provider tries to confirm (should fail)
      await t.request
        .post(`/api/v1/transactions/${txn.id}/confirm`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(403);
    });

    it('should reject invalid state transitions', async () => {
      const txn = await createTransaction();

      // Try to deliver from CREATED state (should fail — must be PAYMENT_HELD)
      await t.request
        .post(`/api/v1/transactions/${txn.id}/deliver`)
        .set('Authorization', `Bearer ${providerToken}`)
        .expect(400);
    });

    it('should cancel a transaction within the cancellation window', async () => {
      const txn = await createTransaction();

      const res = await t.request
        .post(`/api/v1/transactions/${txn.id}/cancel`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.status).toBe('CANCELLED');
    });
  });

  // ─── Transaction Listing ──────────────────────────────────────────────────

  describe('Transaction listing', () => {
    it('should return paginated results', async () => {
      // Create multiple transactions
      for (let i = 0; i < 3; i++) {
        await t.request
          .post('/api/v1/transactions')
          .set('Authorization', `Bearer ${buyerToken}`)
          .send({
            providerId,
            amount: 5000 + i * 1000,
            description: `Paginated test transaction number ${i + 1}`,
          })
          .expect(201);
      }

      const res = await t.request
        .get('/api/v1/transactions?page=1&limit=2')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.data.length).toBe(2);
      expect(res.body.total).toBe(3);
      expect(res.body.totalPages).toBe(2);
    });
  });
});
