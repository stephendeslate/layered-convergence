import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StripeService } from './stripe.service';

const mockConfigService = {
  get: vi.fn((key: string, defaultVal?: string) => {
    const vals: Record<string, string> = {
      STRIPE_SECRET_KEY: '', // empty = mock mode
      STRIPE_WEBHOOK_SECRET: '',
    };
    return vals[key] ?? defaultVal ?? '';
  }),
};

describe('StripeService (mock mode)', () => {
  let service: StripeService;

  beforeEach(() => {
    service = new StripeService(mockConfigService as any);
  });

  it('should be in mock mode when no secret key', () => {
    expect(service.isMockMode).toBe(true);
  });

  describe('createPaymentIntent', () => {
    it('should return a mock PaymentIntent', async () => {
      const result = await service.createPaymentIntent({
        amount: 5000,
        currency: 'usd',
        metadata: { transactionId: 'txn-1' },
      });

      expect(result.id).toMatch(/^pi_mock_/);
      expect(result.clientSecret).toBeDefined();
      expect(result.status).toBe('requires_payment_method');
    });
  });

  describe('capturePaymentIntent', () => {
    it('should return a mock capture result', async () => {
      const result = await service.capturePaymentIntent('pi_mock_123');

      expect(result.id).toBe('pi_mock_123');
      expect(result.status).toBe('succeeded');
      expect(result.chargeId).toMatch(/^ch_mock_/);
    });
  });

  describe('cancelPaymentIntent', () => {
    it('should return a mock cancel result', async () => {
      const result = await service.cancelPaymentIntent('pi_mock_123');

      expect(result.id).toBe('pi_mock_123');
      expect(result.status).toBe('canceled');
    });
  });

  describe('createTransfer', () => {
    it('should return a mock transfer', async () => {
      const result = await service.createTransfer({
        amount: 4500,
        destination: 'acct_mock_1',
        transferGroup: 'txn-1',
      });

      expect(result.id).toMatch(/^tr_mock_/);
      expect(result.amount).toBe(4500);
    });
  });

  describe('createRefund', () => {
    it('should return a mock refund', async () => {
      const result = await service.createRefund({
        paymentIntentId: 'pi_mock_123',
      });

      expect(result.id).toMatch(/^re_mock_/);
      expect(result.status).toBe('succeeded');
    });
  });

  describe('createConnectedAccount', () => {
    it('should return a mock connected account', async () => {
      const result = await service.createConnectedAccount({
        email: 'provider@test.com',
      });

      expect(result.id).toMatch(/^acct_mock_/);
    });
  });

  describe('createAccountLink', () => {
    it('should return a mock onboarding URL', async () => {
      const result = await service.createAccountLink({
        accountId: 'acct_mock_1',
        refreshUrl: 'http://localhost/refresh',
        returnUrl: 'http://localhost/return',
      });

      expect(result.url).toContain('connect.stripe.com/setup/mock');
    });
  });

  describe('getAccount', () => {
    it('should return mock account details', async () => {
      const result = await service.getAccount('acct_mock_1');

      expect(result.chargesEnabled).toBe(true);
      expect(result.payoutsEnabled).toBe(true);
      expect(result.detailsSubmitted).toBe(true);
    });
  });

  describe('constructWebhookEvent', () => {
    it('should parse JSON in mock mode', () => {
      const event = {
        id: 'evt_test_1',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
      };
      const payload = JSON.stringify(event);

      const result = service.constructWebhookEvent(payload, '');

      expect(result).toBeDefined();
      expect(result!.id).toBe('evt_test_1');
    });

    it('should parse Buffer in mock mode', () => {
      const event = {
        id: 'evt_test_2',
        type: 'payment_intent.succeeded',
        data: { object: {} },
      };
      const payload = Buffer.from(JSON.stringify(event));

      const result = service.constructWebhookEvent(payload, '');

      expect(result!.id).toBe('evt_test_2');
    });
  });

  describe('isHealthy', () => {
    it('should return true in mock mode', async () => {
      const result = await service.isHealthy();
      expect(result).toBe(true);
    });
  });
});
