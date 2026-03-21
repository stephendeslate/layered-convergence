/**
 * E2E tests — Dispute flow:
 *   Raise dispute → submit evidence → admin resolve (release or refund)
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

describe('Dispute Flow E2E', () => {
  let t: TestApp;
  let buyerToken: string;
  let providerToken: string;
  let adminToken: string;
  let buyerId: string;
  let providerId: string;
  let adminId: string;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase(t.prisma);

    const buyer = await registerUser(t.request, {
      email: 'buyer-dispute@e2e.test',
      password: 'BuyerPass123',
      displayName: 'Dispute Buyer',
      role: 'BUYER',
    });
    buyerToken = buyer.tokens.accessToken;
    buyerId = buyer.user.id;

    const provider = await registerUser(t.request, {
      email: 'provider-dispute@e2e.test',
      password: 'ProviderPass123',
      displayName: 'Dispute Provider',
      role: 'PROVIDER',
    });
    providerToken = provider.tokens.accessToken;
    providerId = provider.user.id;
    await onboardProvider(t.prisma, providerId);

    const admin = await createAdminUser(t.prisma, t.request);
    adminToken = admin.tokens.accessToken;
    adminId = admin.user.id;
  });

  /**
   * Helper: create a transaction and advance it to DELIVERED state.
   */
  async function createDeliveredTransaction() {
    // Create transaction
    const createRes = await t.request
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        providerId,
        amount: 10000,
        description: 'Transaction for dispute testing in E2E suite',
      })
      .expect(201);

    const txnId = createRes.body.id;

    // Simulate PAYMENT_HELD
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
      },
    });

    // Provider marks delivery
    await t.request
      .post(`/api/v1/transactions/${txnId}/deliver`)
      .set('Authorization', `Bearer ${providerToken}`)
      .expect(200);

    return txnId;
  }

  // ─── Create Dispute ────────────────────────────────────────────────────────

  describe('Create dispute', () => {
    it('should allow buyer to file a dispute on DELIVERED transaction', async () => {
      const txnId = await createDeliveredTransaction();

      const res = await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: txnId,
          reason: 'NOT_AS_DESCRIBED',
          description: 'The work delivered does not match the agreed specifications at all.',
        })
        .expect(201);

      expect(res.body.status).toBe('OPEN');
      expect(res.body.reason).toBe('NOT_AS_DESCRIBED');
      expect(res.body.transactionId).toBe(txnId);

      // Transaction should now be DISPUTED
      const txnRes = await t.request
        .get(`/api/v1/transactions/${txnId}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);
      expect(txnRes.body.status).toBe('DISPUTED');
    });

    it('should reject duplicate dispute on same transaction', async () => {
      const txnId = await createDeliveredTransaction();

      await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: txnId,
          reason: 'NOT_DELIVERED',
          description: 'First dispute on this transaction for testing uniqueness.',
        })
        .expect(201);

      await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: txnId,
          reason: 'QUALITY_ISSUE',
          description: 'Second dispute should be rejected as duplicate dispute.',
        })
        .expect(409);
    });

    it('should reject dispute from provider (only buyer can file)', async () => {
      const txnId = await createDeliveredTransaction();

      await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          transactionId: txnId,
          reason: 'NOT_AS_DESCRIBED',
          description: 'Provider should not be able to file a dispute on this.',
        })
        .expect(403);
    });
  });

  // ─── Submit Evidence ───────────────────────────────────────────────────────

  describe('Submit evidence', () => {
    it('should allow buyer to submit evidence', async () => {
      const txnId = await createDeliveredTransaction();

      // Create dispute
      const disputeRes = await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: txnId,
          reason: 'NOT_AS_DESCRIBED',
          description: 'Work does not match specifications for the agreed project.',
        })
        .expect(201);

      const disputeId = disputeRes.body.id;

      // Submit evidence
      const evidenceRes = await t.request
        .post(`/api/v1/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          content: 'Here are screenshots proving the deliverable does not match the mockup.',
        })
        .expect(201);

      expect(evidenceRes.body.content).toContain('screenshots');
      expect(evidenceRes.body.submittedById).toBe(buyerId);
    });

    it('should allow provider to submit counter-evidence', async () => {
      const txnId = await createDeliveredTransaction();

      const disputeRes = await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: txnId,
          reason: 'QUALITY_ISSUE',
          description: 'The quality of the delivered work is not acceptable.',
        })
        .expect(201);

      const disputeId = disputeRes.body.id;

      // Provider submits counter-evidence
      const evidenceRes = await t.request
        .post(`/api/v1/disputes/${disputeId}/evidence`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({
          content: 'The work was delivered exactly as specified in the original agreement.',
        })
        .expect(201);

      expect(evidenceRes.body.submittedById).toBe(providerId);
    });
  });

  // ─── Resolve Dispute ──────────────────────────────────────────────────────

  describe('Resolve dispute', () => {
    it('should allow admin to resolve dispute by releasing funds to provider', async () => {
      const txnId = await createDeliveredTransaction();

      const disputeRes = await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: txnId,
          reason: 'NOT_AS_DESCRIBED',
          description: 'Dispute for testing admin resolution in favor of provider.',
        })
        .expect(201);

      const disputeId = disputeRes.body.id;

      // Admin resolves: RELEASE (funds to provider)
      const resolveRes = await t.request
        .post(`/api/v1/disputes/${disputeId}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'RELEASE',
          note: 'Evidence shows deliverable matches specs. Releasing to provider.',
        })
        .expect(200);

      expect(resolveRes.body.dispute.status).toBe('RESOLVED_RELEASED');
      expect(resolveRes.body.transaction.status).toBe('RELEASED');
    });

    it('should allow admin to resolve dispute by refunding buyer', async () => {
      const txnId = await createDeliveredTransaction();

      const disputeRes = await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: txnId,
          reason: 'NOT_DELIVERED',
          description: 'Dispute for testing admin resolution with refund to buyer.',
        })
        .expect(201);

      const disputeId = disputeRes.body.id;

      // Admin resolves: REFUND (funds back to buyer)
      const resolveRes = await t.request
        .post(`/api/v1/disputes/${disputeId}/resolve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          action: 'REFUND',
          note: 'Provider failed to deliver. Issuing full refund to buyer.',
        })
        .expect(200);

      expect(resolveRes.body.dispute.status).toBe('RESOLVED_REFUNDED');
      expect(resolveRes.body.transaction.status).toBe('REFUNDED');
    });

    it('should allow admin to escalate a dispute', async () => {
      const txnId = await createDeliveredTransaction();

      const disputeRes = await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: txnId,
          reason: 'OTHER',
          description: 'Complex dispute that needs escalation for further review.',
        })
        .expect(201);

      const disputeId = disputeRes.body.id;

      const escalateRes = await t.request
        .post(`/api/v1/disputes/${disputeId}/escalate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ note: 'Requires senior review due to complexity of this case.' })
        .expect(200);

      expect(escalateRes.body.status).toBe('ESCALATED');
    });

    it('should deny non-admin from resolving disputes', async () => {
      const txnId = await createDeliveredTransaction();

      const disputeRes = await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: txnId,
          reason: 'NOT_AS_DESCRIBED',
          description: 'Dispute testing that non-admin cannot resolve disputes.',
        })
        .expect(201);

      // Buyer tries to resolve
      await t.request
        .post(`/api/v1/disputes/${disputeRes.body.id}/resolve`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          action: 'REFUND',
          note: 'Buyer should not be able to self-resolve this dispute.',
        })
        .expect(403);
    });
  });

  // ─── Dispute Listing ──────────────────────────────────────────────────────

  describe('Dispute listing', () => {
    it('should list disputes for authenticated user', async () => {
      const txnId = await createDeliveredTransaction();

      await t.request
        .post('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          transactionId: txnId,
          reason: 'NOT_DELIVERED',
          description: 'Dispute for testing list endpoint returns results.',
        })
        .expect(201);

      const res = await t.request
        .get('/api/v1/disputes')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });
  });
});
