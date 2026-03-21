import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from './notification.service';

const mockConfig = {
  get: vi.fn((key: string, defaultVal: any) => {
    if (key === 'RESEND_API_KEY') return ''; // mock mode
    if (key === 'EMAIL_FROM') return 'noreply@test.demo';
    return defaultVal;
  }),
};

function createService() {
  return new NotificationService(mockConfig as any);
}

function mockTransaction(overrides: any = {}) {
  return {
    id: 'txn-1',
    amount: 10000,
    platformFee: 1000,
    providerAmount: 9000,
    description: 'Logo design',
    createdAt: new Date('2026-03-01'),
    deliveredAt: new Date('2026-03-02'),
    autoReleaseAt: new Date('2026-03-05'),
    releasedAt: new Date('2026-03-03'),
    buyer: { email: 'buyer@test.com', displayName: 'Alice Buyer' },
    provider: { email: 'provider@test.com', displayName: 'Bob Provider' },
    ...overrides,
  };
}

describe('NotificationService', () => {
  let service: NotificationService;
  let logSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = createService();
    // Spy on the logger to verify mock emails are logged
    logSpy = vi.spyOn((service as any).logger, 'log');
  });

  describe('sendPaymentReceived', () => {
    it('should log mock email to buyer', async () => {
      await service.sendPaymentReceived(mockTransaction());

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MOCK EMAIL]'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('buyer@test.com'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Payment hold confirmed'),
      );
    });
  });

  describe('sendDeliveryConfirmed', () => {
    it('should log mock emails to both parties', async () => {
      await service.sendDeliveryConfirmed(mockTransaction());

      // Should send to both buyer and provider
      const calls = logSpy.mock.calls.filter((c: any[]) =>
        c[0]?.includes('[MOCK EMAIL]'),
      );
      expect(calls.length).toBe(2);

      const recipients = calls.map((c: any[]) => c[0]);
      expect(recipients.some((r: string) => r.includes('buyer@test.com'))).toBe(true);
      expect(recipients.some((r: string) => r.includes('provider@test.com'))).toBe(true);
    });
  });

  describe('sendFundsReleased', () => {
    it('should log mock email to provider', async () => {
      await service.sendFundsReleased(mockTransaction());

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('provider@test.com'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Funds released'),
      );
    });
  });

  describe('sendPayoutSent', () => {
    it('should log mock email to provider', async () => {
      await service.sendPayoutSent({
        amount: 9000,
        paidAt: new Date('2026-03-04'),
        transaction: { description: 'Logo design' },
        provider: { email: 'provider@test.com', displayName: 'Bob Provider' },
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('provider@test.com'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Payout received'),
      );
    });
  });

  describe('sendDisputeOpened', () => {
    it('should log mock emails to both parties', async () => {
      await service.sendDisputeOpened({
        reason: 'NOT_AS_DESCRIBED',
        description: 'Service did not match specs',
        createdAt: new Date('2026-03-02'),
        transaction: {
          amount: 10000,
          buyer: { email: 'buyer@test.com', displayName: 'Alice Buyer' },
          provider: { email: 'provider@test.com', displayName: 'Bob Provider' },
        },
      });

      const calls = logSpy.mock.calls.filter((c: any[]) =>
        c[0]?.includes('[MOCK EMAIL]'),
      );
      expect(calls.length).toBe(2);
    });
  });

  describe('sendDisputeResolved', () => {
    it('should log mock emails to both parties with resolution', async () => {
      await service.sendDisputeResolved({
        status: 'RESOLVED_RELEASED',
        resolutionNote: 'Evidence supports provider',
        resolvedAt: new Date('2026-03-05'),
        transaction: {
          amount: 10000,
          description: 'Logo design',
          buyer: { email: 'buyer@test.com', displayName: 'Alice Buyer' },
          provider: { email: 'provider@test.com', displayName: 'Bob Provider' },
        },
      });

      const calls = logSpy.mock.calls.filter((c: any[]) =>
        c[0]?.includes('[MOCK EMAIL]'),
      );
      expect(calls.length).toBe(2);
    });

    it('should handle RESOLVED_REFUNDED resolution', async () => {
      await service.sendDisputeResolved({
        status: 'RESOLVED_REFUNDED',
        resolutionNote: 'Buyer claim valid',
        resolvedAt: new Date('2026-03-05'),
        transaction: {
          amount: 10000,
          description: 'Logo design',
          buyer: { email: 'buyer@test.com', displayName: 'Alice Buyer' },
          provider: { email: 'provider@test.com', displayName: 'Bob Provider' },
        },
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Dispute resolved'),
      );
    });
  });

  describe('sendWelcome', () => {
    it('should log mock welcome email', async () => {
      await service.sendWelcome({
        email: 'new@test.com',
        displayName: 'New User',
        role: 'BUYER',
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('new@test.com'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Welcome'),
      );
    });

    it('should handle PROVIDER role', async () => {
      await service.sendWelcome({
        email: 'provider@test.com',
        displayName: 'New Provider',
        role: 'PROVIDER',
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('provider@test.com'),
      );
    });
  });

  describe('sendOnboardingReminder', () => {
    it('should log mock onboarding reminder email', async () => {
      await service.sendOnboardingReminder({
        email: 'provider@test.com',
        displayName: 'Bob Provider',
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('provider@test.com'),
      );
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Complete your provider onboarding'),
      );
    });
  });
});
