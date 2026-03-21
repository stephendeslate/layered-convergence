/**
 * E2E tests — Webhook idempotency: same event processed only once.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createTestApp,
  closeTestApp,
  cleanDatabase,
  TestApp,
} from './setup';

describe('Webhook Idempotency E2E', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase(t.prisma);
  });

  function createWebhookPayload(eventId: string, eventType: string, data: unknown = {}) {
    return JSON.stringify({
      id: eventId,
      type: eventType,
      data: { object: data },
      created: Math.floor(Date.now() / 1000),
    });
  }

  describe('POST /api/v1/webhooks/stripe', () => {
    it('should process a webhook event and create a log entry', async () => {
      const payload = createWebhookPayload(
        'evt_test_001',
        'payment_intent.succeeded',
        { id: 'pi_test_001', status: 'succeeded' },
      );

      const res = await t.request
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(payload)
        .expect(200);

      expect(res.body.received).toBe(true);

      // Check WebhookLog was created
      const log = await t.prisma.webhookLog.findUnique({
        where: { stripeEventId: 'evt_test_001' },
      });
      expect(log).toBeTruthy();
      expect(log!.eventType).toBe('payment_intent.succeeded');
      expect(['PROCESSING', 'PROCESSED']).toContain(log!.status);
    });

    it('should skip duplicate webhook events (idempotency)', async () => {
      const payload = createWebhookPayload(
        'evt_test_dup',
        'payment_intent.succeeded',
        { id: 'pi_test_dup' },
      );

      // First call — should process
      await t.request
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(payload)
        .expect(200);

      // Mark as PROCESSED so the duplicate check triggers
      await t.prisma.webhookLog.update({
        where: { stripeEventId: 'evt_test_dup' },
        data: { status: 'PROCESSED', processedAt: new Date() },
      });

      // Second call with same event ID — should be skipped
      await t.request
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(payload)
        .expect(200);

      // Should still have only one log entry
      const logs = await t.prisma.webhookLog.findMany({
        where: { stripeEventId: 'evt_test_dup' },
      });
      expect(logs.length).toBe(1);
      // Status should remain PROCESSED (not re-processed)
      expect(logs[0].status).toBe('PROCESSED');
    });

    it('should retry failed webhook events', async () => {
      // Create a FAILED webhook log entry
      await t.prisma.webhookLog.create({
        data: {
          stripeEventId: 'evt_test_retry',
          eventType: 'payment_intent.succeeded',
          status: 'FAILED',
          payload: { id: 'evt_test_retry', type: 'payment_intent.succeeded' },
          errorMessage: 'Previous processing failed',
        },
      });

      // Send the same event again — FAILED events should be retried
      const payload = createWebhookPayload(
        'evt_test_retry',
        'payment_intent.succeeded',
        { id: 'pi_test_retry' },
      );

      const res = await t.request
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(payload)
        .expect(200);

      expect(res.body.received).toBe(true);

      // Status should now be PROCESSING (retried)
      const log = await t.prisma.webhookLog.findUnique({
        where: { stripeEventId: 'evt_test_retry' },
      });
      expect(log!.status).toBe('PROCESSING');
    });

    it('should handle different event types independently', async () => {
      const payload1 = createWebhookPayload(
        'evt_test_type1',
        'payment_intent.succeeded',
        { id: 'pi_test_type1' },
      );
      const payload2 = createWebhookPayload(
        'evt_test_type2',
        'account.updated',
        { id: 'acct_test_type2' },
      );

      await t.request
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(payload1)
        .expect(200);

      await t.request
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send(payload2)
        .expect(200);

      const logs = await t.prisma.webhookLog.findMany({
        where: {
          stripeEventId: { in: ['evt_test_type1', 'evt_test_type2'] },
        },
      });
      expect(logs.length).toBe(2);
    });

    it('should reject requests without a body', async () => {
      // The webhook controller requires rawBody, but sending empty might cause 400
      // In mock mode without signature verification, a malformed body fails parsing
      const res = await t.request
        .post('/api/v1/webhooks/stripe')
        .set('Content-Type', 'application/json')
        .send('not-json')
        .expect(400);
    });
  });
});
