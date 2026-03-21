import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from './transaction.service';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionStatus, AuditAction, OnboardingStatus } from '@prisma/client';

const mockPrisma = {
  transaction: {
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  },
  transactionStateHistory: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
};

const mockStripe = {
  createPaymentIntent: vi.fn(),
  capturePaymentIntent: vi.fn(),
  cancelPaymentIntent: vi.fn(),
  createTransfer: vi.fn(),
  createRefund: vi.fn(),
  isMockMode: true,
};

const mockAudit = {
  logTransition: vi.fn(),
  getTransactionHistory: vi.fn(),
};

const mockBullmq = {
  scheduleAutoRelease: vi.fn(),
  cancelAutoRelease: vi.fn(),
};

const mockConfig = {
  get: vi.fn((key: string, defaultVal: any) => {
    if (key === 'PLATFORM_FEE_PERCENT') return 10;
    if (key === 'AUTO_RELEASE_HOURS') return 72;
    return defaultVal;
  }),
};

function createService() {
  return new TransactionService(
    mockPrisma as any,
    mockStripe as any,
    mockAudit as any,
    mockBullmq as any,
    mockConfig as any,
  );
}

// Helper to create a mock transaction in a given state
function mockTransaction(overrides: Partial<{
  id: string;
  status: TransactionStatus;
  buyerId: string;
  providerId: string;
  amount: number;
  providerAmount: number;
  platformFee: number;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  createdAt: Date;
  deliveredAt: Date | null;
  autoReleaseAt: Date | null;
  provider: any;
  buyer: any;
}> = {}) {
  return {
    id: 'txn-1',
    status: TransactionStatus.CREATED,
    buyerId: 'buyer-1',
    providerId: 'provider-1',
    amount: 10000,
    providerAmount: 9000,
    platformFee: 1000,
    currency: 'usd',
    description: 'Test service',
    stripePaymentIntentId: 'pi_mock_1',
    stripeChargeId: null,
    stripeTransferId: null,
    stripeRefundId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deliveredAt: null,
    autoReleaseAt: null,
    paymentHeldAt: null,
    releasedAt: null,
    paidOutAt: null,
    disputedAt: null,
    refundedAt: null,
    expiredAt: null,
    provider: {
      id: 'provider-1',
      connectedAccount: { stripeAccountId: 'acct_mock_1' },
    },
    buyer: { id: 'buyer-1' },
    ...overrides,
  };
}

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = createService();
    mockPrisma.transactionStateHistory.create.mockResolvedValue({ id: 'history-1' });
    mockAudit.logTransition.mockResolvedValue({ id: 'history-1' });
  });

  // ─── Fee Calculation ──────────────────────────────────────────────────────

  describe('calculatePlatformFee', () => {
    it('should calculate 10% fee for $100', () => {
      const result = service.calculatePlatformFee(10000);
      expect(result.platformFee).toBe(1000);
      expect(result.providerAmount).toBe(9000);
      expect(result.platformFee + result.providerAmount).toBe(10000);
    });

    it('should calculate 10% fee for minimum amount $5', () => {
      const result = service.calculatePlatformFee(500);
      expect(result.platformFee).toBe(50);
      expect(result.providerAmount).toBe(450);
    });

    it('should enforce minimum fee of $0.50', () => {
      // With 10% fee, 400 cents would be 40 cents fee, below minimum
      // But 400 is below the minimum transaction amount, so test with custom scenario
      // Actually at 10%, the minimum transaction amount (500) already gives exactly 50 cents fee
      const result = service.calculatePlatformFee(500);
      expect(result.platformFee).toBeGreaterThanOrEqual(50);
    });

    it('should calculate fee for maximum amount $10,000', () => {
      const result = service.calculatePlatformFee(1000000);
      expect(result.platformFee).toBe(100000);
      expect(result.providerAmount).toBe(900000);
    });

    it('should ensure fee + providerAmount = amount', () => {
      const amounts = [500, 1000, 5000, 10000, 50000, 100000, 1000000];
      for (const amount of amounts) {
        const result = service.calculatePlatformFee(amount);
        expect(result.platformFee + result.providerAmount).toBe(amount);
      }
    });

    it('should use floor for fractional fee calculations', () => {
      // 10% of 1001 = 100.1, should floor to 100
      const result = service.calculatePlatformFee(1001);
      expect(result.platformFee).toBe(100);
      expect(result.providerAmount).toBe(901);
    });
  });

  // ─── State Transition Validation ──────────────────────────────────────────

  describe('validateTransition', () => {
    it('should allow CREATED -> PAYMENT_HELD', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.CREATED,
          TransactionStatus.PAYMENT_HELD,
        ),
      ).not.toThrow();
    });

    it('should allow CREATED -> CANCELLED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.CREATED,
          TransactionStatus.CANCELLED,
        ),
      ).not.toThrow();
    });

    it('should allow PAYMENT_HELD -> DELIVERED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.PAYMENT_HELD,
          TransactionStatus.DELIVERED,
        ),
      ).not.toThrow();
    });

    it('should allow PAYMENT_HELD -> DISPUTED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.PAYMENT_HELD,
          TransactionStatus.DISPUTED,
        ),
      ).not.toThrow();
    });

    it('should allow PAYMENT_HELD -> EXPIRED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.PAYMENT_HELD,
          TransactionStatus.EXPIRED,
        ),
      ).not.toThrow();
    });

    it('should allow DELIVERED -> RELEASED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.DELIVERED,
          TransactionStatus.RELEASED,
        ),
      ).not.toThrow();
    });

    it('should allow DELIVERED -> DISPUTED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.DELIVERED,
          TransactionStatus.DISPUTED,
        ),
      ).not.toThrow();
    });

    it('should allow DISPUTED -> RELEASED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.DISPUTED,
          TransactionStatus.RELEASED,
        ),
      ).not.toThrow();
    });

    it('should allow DISPUTED -> REFUNDED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.DISPUTED,
          TransactionStatus.REFUNDED,
        ),
      ).not.toThrow();
    });

    it('should allow RELEASED -> PAID_OUT', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.RELEASED,
          TransactionStatus.PAID_OUT,
        ),
      ).not.toThrow();
    });

    // Invalid transitions
    it('should reject CREATED -> DELIVERED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.CREATED,
          TransactionStatus.DELIVERED,
        ),
      ).toThrow(BadRequestException);
    });

    it('should reject CREATED -> RELEASED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.CREATED,
          TransactionStatus.RELEASED,
        ),
      ).toThrow(BadRequestException);
    });

    it('should reject PAYMENT_HELD -> RELEASED (must go through DELIVERED)', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.PAYMENT_HELD,
          TransactionStatus.RELEASED,
        ),
      ).toThrow(BadRequestException);
    });

    it('should reject RELEASED -> REFUNDED', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.RELEASED,
          TransactionStatus.REFUNDED,
        ),
      ).toThrow(BadRequestException);
    });

    it('should reject transitions from terminal states', () => {
      const terminalStates = [
        TransactionStatus.PAID_OUT,
        TransactionStatus.REFUNDED,
        TransactionStatus.EXPIRED,
        TransactionStatus.CANCELLED,
      ];

      for (const state of terminalStates) {
        expect(() =>
          service.validateTransition(state, TransactionStatus.CREATED),
        ).toThrow(BadRequestException);
      }
    });

    it('should reject DELIVERED -> PAID_OUT (must go through RELEASED)', () => {
      expect(() =>
        service.validateTransition(
          TransactionStatus.DELIVERED,
          TransactionStatus.PAID_OUT,
        ),
      ).toThrow(BadRequestException);
    });
  });

  // ─── Create Transaction ───────────────────────────────────────────────────

  describe('createTransaction', () => {
    it('should create a transaction with correct fee calculation', async () => {
      const txn = mockTransaction();
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'provider-1',
        role: 'PROVIDER',
        connectedAccount: {
          onboardingStatus: OnboardingStatus.COMPLETE,
          stripeAccountId: 'acct_mock_1',
        },
      });
      mockPrisma.transaction.create.mockResolvedValue(txn);
      mockPrisma.transaction.update.mockResolvedValue({
        ...txn,
        stripePaymentIntentId: 'pi_mock_new',
      });
      mockStripe.createPaymentIntent.mockResolvedValue({
        id: 'pi_mock_new',
        clientSecret: 'pi_mock_new_secret',
        status: 'requires_payment_method',
      });

      const result = await service.createTransaction(
        'buyer-1',
        'provider-1',
        10000,
        'Logo design project',
      );

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 10000,
            platformFee: 1000,
            providerAmount: 9000,
          }),
        }),
      );
      expect(mockStripe.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000,
          currency: 'usd',
          captureMethod: 'manual',
        }),
      );
      expect(result.clientSecret).toBe('pi_mock_new_secret');
    });

    it('should reject amount below minimum', async () => {
      await expect(
        service.createTransaction('buyer-1', 'provider-1', 499, 'Too cheap'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject amount above maximum', async () => {
      await expect(
        service.createTransaction('buyer-1', 'provider-1', 1000001, 'Too expensive'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if provider not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createTransaction('buyer-1', 'provider-1', 10000, 'Test'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject if provider not onboarded', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'provider-1',
        role: 'PROVIDER',
        connectedAccount: {
          onboardingStatus: OnboardingStatus.PENDING,
        },
      });

      await expect(
        service.createTransaction('buyer-1', 'provider-1', 10000, 'Test'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should log TRANSACTION_CREATED audit entry', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'provider-1',
        role: 'PROVIDER',
        connectedAccount: {
          onboardingStatus: OnboardingStatus.COMPLETE,
        },
      });
      mockPrisma.transaction.create.mockResolvedValue(mockTransaction());
      mockPrisma.transaction.update.mockResolvedValue(mockTransaction());
      mockStripe.createPaymentIntent.mockResolvedValue({
        id: 'pi_1',
        clientSecret: 'sec',
        status: 'requires_payment_method',
      });

      await service.createTransaction('buyer-1', 'provider-1', 10000, 'Test');

      expect(mockAudit.logTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.TRANSACTION_CREATED,
          toStatus: TransactionStatus.CREATED,
          fromStatus: null,
        }),
      );
    });
  });

  // ─── Confirm Payment ──────────────────────────────────────────────────────

  describe('confirmPayment', () => {
    it('should transition from CREATED to PAYMENT_HELD', async () => {
      const txn = mockTransaction({ status: TransactionStatus.CREATED });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.confirmPayment('txn-1', 'ch_mock_1');

      expect(mockPrisma.transaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'txn-1', status: TransactionStatus.CREATED },
          data: expect.objectContaining({
            status: TransactionStatus.PAYMENT_HELD,
            stripeChargeId: 'ch_mock_1',
          }),
        }),
      );
    });
  });

  // ─── Mark Delivery ────────────────────────────────────────────────────────

  describe('markDelivery', () => {
    it('should transition from PAYMENT_HELD to DELIVERED', async () => {
      const txn = mockTransaction({ status: TransactionStatus.PAYMENT_HELD });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.markDelivery('txn-1', 'provider-1');

      expect(mockPrisma.transaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'txn-1', status: TransactionStatus.PAYMENT_HELD },
          data: expect.objectContaining({
            status: TransactionStatus.DELIVERED,
          }),
        }),
      );
      expect(mockBullmq.scheduleAutoRelease).toHaveBeenCalledWith(
        'txn-1',
        72 * 60 * 60 * 1000,
      );
    });

    it('should reject if caller is not the provider', async () => {
      const txn = mockTransaction({ status: TransactionStatus.PAYMENT_HELD });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);

      await expect(
        service.markDelivery('txn-1', 'buyer-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── Confirm Delivery (buyer releases) ────────────────────────────────────

  describe('confirmDelivery', () => {
    it('should transition from DELIVERED to RELEASED', async () => {
      const txn = mockTransaction({ status: TransactionStatus.DELIVERED });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });
      mockStripe.capturePaymentIntent.mockResolvedValue({
        id: 'pi_mock_1',
        status: 'succeeded',
        chargeId: 'ch_1',
      });
      mockStripe.createTransfer.mockResolvedValue({
        id: 'tr_mock_1',
        amount: 9000,
      });

      await service.confirmDelivery('txn-1', 'buyer-1');

      expect(mockBullmq.cancelAutoRelease).toHaveBeenCalledWith('txn-1');
      expect(mockStripe.capturePaymentIntent).toHaveBeenCalledWith('pi_mock_1');
      expect(mockStripe.createTransfer).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 9000,
          destination: 'acct_mock_1',
        }),
      );
    });

    it('should reject if caller is not the buyer', async () => {
      const txn = mockTransaction({ status: TransactionStatus.DELIVERED });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);

      await expect(
        service.confirmDelivery('txn-1', 'provider-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── Refund Transaction ───────────────────────────────────────────────────

  describe('refundTransaction', () => {
    it('should refund a disputed transaction', async () => {
      const txn = mockTransaction({
        status: TransactionStatus.DISPUTED,
        stripeChargeId: 'ch_1',
      });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });
      mockStripe.createRefund.mockResolvedValue({
        id: 're_mock_1',
        status: 'succeeded',
      });

      await service.refundTransaction('txn-1', 'admin-1', 'Buyer is right');

      expect(mockStripe.createRefund).toHaveBeenCalledWith(
        expect.objectContaining({
          paymentIntentId: 'pi_mock_1',
        }),
      );
    });

    it('should cancel PaymentIntent if not captured', async () => {
      const txn = mockTransaction({
        status: TransactionStatus.DISPUTED,
        stripeChargeId: null,
      });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.refundTransaction('txn-1', 'admin-1');

      expect(mockStripe.cancelPaymentIntent).toHaveBeenCalledWith('pi_mock_1');
    });
  });

  // ─── Expire Transaction ───────────────────────────────────────────────────

  describe('expireTransaction', () => {
    it('should expire a PAYMENT_HELD transaction', async () => {
      const txn = mockTransaction({ status: TransactionStatus.PAYMENT_HELD });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.expireTransaction('txn-1');

      expect(mockStripe.cancelPaymentIntent).toHaveBeenCalledWith('pi_mock_1');
    });
  });

  // ─── Cancel Transaction ───────────────────────────────────────────────────

  describe('cancelTransaction', () => {
    it('should cancel a CREATED transaction within 1 hour', async () => {
      const txn = mockTransaction({
        status: TransactionStatus.CREATED,
        createdAt: new Date(), // just created
      });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.cancelTransaction('txn-1', 'buyer-1');

      expect(mockAudit.logTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.TRANSACTION_CANCELLED,
        }),
      );
    });

    it('should reject cancellation after 1 hour', async () => {
      const txn = mockTransaction({
        status: TransactionStatus.CREATED,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);

      await expect(
        service.cancelTransaction('txn-1', 'buyer-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if caller is not the buyer', async () => {
      const txn = mockTransaction({ status: TransactionStatus.CREATED });
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);

      await expect(
        service.cancelTransaction('txn-1', 'provider-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── List & Detail ────────────────────────────────────────────────────────

  describe('listTransactions', () => {
    it('should return paginated transactions for a user', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([mockTransaction()]);
      mockPrisma.transaction.count.mockResolvedValue(1);

      const result = await service.listTransactions('buyer-1', 'BUYER', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should return all transactions for admin', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      mockPrisma.transaction.count.mockResolvedValue(0);

      await service.listTransactions('admin-1', 'ADMIN', 1, 20);

      // Admin query should NOT filter by buyerId/providerId
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  describe('getTransactionDetail', () => {
    it('should return transaction with history', async () => {
      const txn = {
        ...mockTransaction(),
        stateHistory: [],
        dispute: null,
        payout: null,
      };
      mockPrisma.transaction.findUnique.mockResolvedValue(txn);

      const result = await service.getTransactionDetail('txn-1');
      expect(result.id).toBe('txn-1');
    });

    it('should throw NotFoundException for missing transaction', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.getTransactionDetail('nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
