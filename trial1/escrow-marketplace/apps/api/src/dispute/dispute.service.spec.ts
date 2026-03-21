import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeService } from './dispute.service';
import {
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import {
  TransactionStatus,
  DisputeStatus,
  DisputeReason,
  AuditAction,
} from '@prisma/client';

const mockPrisma = {
  dispute: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  disputeEvidence: {
    create: vi.fn(),
  },
  transaction: {
    updateMany: vi.fn(),
    findUnique: vi.fn(),
  },
};

const mockAudit = {
  logTransition: vi.fn(),
};

const mockBullmq = {
  cancelAutoRelease: vi.fn(),
};

const mockTransactionService = {
  findTransactionOrThrow: vi.fn(),
  releasePayment: vi.fn(),
  refundTransaction: vi.fn(),
};

function createService() {
  return new DisputeService(
    mockPrisma as any,
    mockAudit as any,
    mockBullmq as any,
    mockTransactionService as any,
  );
}

function mockTransaction(overrides: Record<string, any> = {}) {
  return {
    id: 'txn-1',
    buyerId: 'buyer-1',
    providerId: 'provider-1',
    status: TransactionStatus.PAYMENT_HELD,
    amount: 10000,
    providerAmount: 9000,
    deliveredAt: null,
    ...overrides,
  };
}

describe('DisputeService', () => {
  let service: DisputeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = createService();
    mockAudit.logTransition.mockResolvedValue({ id: 'h-1' });
  });

  // ─── Create Dispute ─────────────────────────────────────────────────────

  describe('createDispute', () => {
    it('should create a dispute for PAYMENT_HELD transaction', async () => {
      const txn = mockTransaction();
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(txn);
      mockPrisma.dispute.findUnique.mockResolvedValue(null);
      mockPrisma.dispute.create.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'txn-1',
        status: DisputeStatus.OPEN,
      });
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.createDispute(
        'txn-1',
        'buyer-1',
        DisputeReason.NOT_AS_DESCRIBED,
        'The logo does not match the agreed design specifications at all.',
      );

      expect(result.id).toBe('dispute-1');
      expect(mockPrisma.dispute.create).toHaveBeenCalled();
      expect(mockPrisma.transaction.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: TransactionStatus.DISPUTED,
          }),
        }),
      );
      expect(mockBullmq.cancelAutoRelease).toHaveBeenCalledWith('txn-1');
    });

    it('should create a dispute for DELIVERED transaction within 72h window', async () => {
      const txn = mockTransaction({
        status: TransactionStatus.DELIVERED,
        deliveredAt: new Date(), // just delivered
      });
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(txn);
      mockPrisma.dispute.findUnique.mockResolvedValue(null);
      mockPrisma.dispute.create.mockResolvedValue({
        id: 'dispute-2',
        transactionId: 'txn-1',
        status: DisputeStatus.OPEN,
      });
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.createDispute(
        'txn-1',
        'buyer-1',
        DisputeReason.QUALITY_ISSUE,
        'The quality of the delivered work is not acceptable at all.',
      );

      expect(result.id).toBe('dispute-2');
    });

    it('should reject dispute if not the buyer', async () => {
      const txn = mockTransaction();
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(txn);

      await expect(
        service.createDispute(
          'txn-1',
          'provider-1',
          DisputeReason.OTHER,
          'Trying to file from provider account which should not work',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject dispute for wrong transaction status', async () => {
      const txn = mockTransaction({ status: TransactionStatus.RELEASED });
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(txn);

      await expect(
        service.createDispute(
          'txn-1',
          'buyer-1',
          DisputeReason.OTHER,
          'Transaction already released so this should fail please',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject dispute if 72h window passed for DELIVERED', async () => {
      const txn = mockTransaction({
        status: TransactionStatus.DELIVERED,
        deliveredAt: new Date(Date.now() - 73 * 60 * 60 * 1000), // 73 hours ago
      });
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(txn);

      await expect(
        service.createDispute(
          'txn-1',
          'buyer-1',
          DisputeReason.NOT_DELIVERED,
          'Dispute window has closed so this should not be allowed at all',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject if dispute already exists', async () => {
      const txn = mockTransaction();
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(txn);
      mockPrisma.dispute.findUnique.mockResolvedValue({
        id: 'existing-dispute',
      });

      await expect(
        service.createDispute(
          'txn-1',
          'buyer-1',
          DisputeReason.OTHER,
          'A dispute already exists for this transaction so should fail',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should log DISPUTE_OPENED audit entry', async () => {
      const txn = mockTransaction();
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(txn);
      mockPrisma.dispute.findUnique.mockResolvedValue(null);
      mockPrisma.dispute.create.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'txn-1',
        status: DisputeStatus.OPEN,
      });
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      await service.createDispute(
        'txn-1',
        'buyer-1',
        DisputeReason.OTHER,
        'Generic dispute for testing audit logging functionality',
      );

      expect(mockAudit.logTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.DISPUTE_OPENED,
          toStatus: TransactionStatus.DISPUTED,
        }),
      );
    });
  });

  // ─── Submit Evidence ──────────────────────────────────────────────────────

  describe('submitEvidence', () => {
    it('should submit evidence for an OPEN dispute', async () => {
      const dispute = {
        id: 'dispute-1',
        transactionId: 'txn-1',
        status: DisputeStatus.OPEN,
        transaction: mockTransaction({ status: TransactionStatus.DISPUTED }),
      };
      mockPrisma.dispute.findUnique.mockResolvedValue(dispute);
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(
        mockTransaction({ status: TransactionStatus.DISPUTED }),
      );
      mockPrisma.disputeEvidence.create.mockResolvedValue({
        id: 'evidence-1',
      });
      mockPrisma.dispute.update.mockResolvedValue({
        ...dispute,
        status: DisputeStatus.UNDER_REVIEW,
      });

      const result = await service.submitEvidence(
        'dispute-1',
        'buyer-1',
        'Here is my detailed evidence',
      );

      expect(result.id).toBe('evidence-1');
      expect(mockPrisma.dispute.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: DisputeStatus.UNDER_REVIEW },
        }),
      );
    });

    it('should reject evidence for resolved dispute', async () => {
      const dispute = {
        id: 'dispute-1',
        transactionId: 'txn-1',
        status: DisputeStatus.RESOLVED_RELEASED,
        transaction: mockTransaction(),
      };
      mockPrisma.dispute.findUnique.mockResolvedValue(dispute);

      await expect(
        service.submitEvidence('dispute-1', 'buyer-1', 'Late evidence submission'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject evidence from non-party', async () => {
      const dispute = {
        id: 'dispute-1',
        transactionId: 'txn-1',
        status: DisputeStatus.OPEN,
        transaction: mockTransaction(),
      };
      mockPrisma.dispute.findUnique.mockResolvedValue(dispute);
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(
        mockTransaction(),
      );

      await expect(
        service.submitEvidence('dispute-1', 'stranger-1', 'Unauthorized evidence'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── Resolve Dispute ──────────────────────────────────────────────────────

  describe('resolveDispute', () => {
    it('should resolve in provider favor (RELEASE)', async () => {
      const dispute = {
        id: 'dispute-1',
        transactionId: 'txn-1',
        status: DisputeStatus.OPEN,
        transaction: mockTransaction({ status: TransactionStatus.DISPUTED }),
      };
      mockPrisma.dispute.findUnique.mockResolvedValue(dispute);
      mockPrisma.dispute.update.mockResolvedValue({
        ...dispute,
        status: DisputeStatus.RESOLVED_RELEASED,
      });
      mockTransactionService.releasePayment.mockResolvedValue(
        mockTransaction({ status: TransactionStatus.RELEASED }),
      );

      const result = await service.resolveDispute(
        'dispute-1',
        'admin-1',
        'RELEASE',
        'Evidence shows service was delivered correctly',
      );

      expect(mockPrisma.dispute.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: DisputeStatus.RESOLVED_RELEASED,
            resolvedById: 'admin-1',
          }),
        }),
      );
      expect(mockTransactionService.releasePayment).toHaveBeenCalledWith(
        'txn-1',
        'admin-1',
        AuditAction.DISPUTE_RESOLVED,
      );
    });

    it('should resolve in buyer favor (REFUND)', async () => {
      const dispute = {
        id: 'dispute-1',
        transactionId: 'txn-1',
        status: DisputeStatus.UNDER_REVIEW,
        transaction: mockTransaction({ status: TransactionStatus.DISPUTED }),
      };
      mockPrisma.dispute.findUnique.mockResolvedValue(dispute);
      mockPrisma.dispute.update.mockResolvedValue({
        ...dispute,
        status: DisputeStatus.RESOLVED_REFUNDED,
      });
      mockTransactionService.refundTransaction.mockResolvedValue(
        mockTransaction({ status: TransactionStatus.REFUNDED }),
      );

      const result = await service.resolveDispute(
        'dispute-1',
        'admin-1',
        'REFUND',
        'Evidence shows service was not delivered as described',
      );

      expect(mockTransactionService.refundTransaction).toHaveBeenCalledWith(
        'txn-1',
        'admin-1',
        'Evidence shows service was not delivered as described',
      );
    });

    it('should reject resolution if dispute already resolved', async () => {
      const dispute = {
        id: 'dispute-1',
        transactionId: 'txn-1',
        status: DisputeStatus.RESOLVED_RELEASED,
        transaction: mockTransaction(),
      };
      mockPrisma.dispute.findUnique.mockResolvedValue(dispute);

      await expect(
        service.resolveDispute(
          'dispute-1',
          'admin-1',
          'RELEASE',
          'Trying to resolve again should fail',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should escalate dispute', async () => {
      const dispute = {
        id: 'dispute-1',
        transactionId: 'txn-1',
        status: DisputeStatus.OPEN,
        transaction: mockTransaction({ status: TransactionStatus.DISPUTED }),
      };
      mockPrisma.dispute.findUnique.mockResolvedValue(dispute);
      mockPrisma.dispute.update.mockResolvedValue({
        ...dispute,
        status: DisputeStatus.ESCALATED,
      });

      await service.resolveDispute(
        'dispute-1',
        'admin-1',
        'ESCALATE',
        'Need further investigation from external team',
      );

      expect(mockPrisma.dispute.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: DisputeStatus.ESCALATED,
          }),
        }),
      );
    });
  });

  // ─── Chargeback Dispute ───────────────────────────────────────────────────

  describe('createChargebackDispute', () => {
    it('should create dispute from Stripe chargeback', async () => {
      const txn = mockTransaction({ status: TransactionStatus.PAYMENT_HELD });
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(txn);
      mockPrisma.dispute.findUnique.mockResolvedValue(null);
      mockPrisma.dispute.create.mockResolvedValue({
        id: 'dispute-cb',
        status: DisputeStatus.OPEN,
      });
      mockPrisma.transaction.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.createChargebackDispute('txn-1');

      expect(result.id).toBe('dispute-cb');
      expect(mockPrisma.dispute.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            reason: DisputeReason.OTHER,
            description: 'Stripe chargeback dispute',
          }),
        }),
      );
    });

    it('should return existing dispute if already exists', async () => {
      const txn = mockTransaction();
      mockTransactionService.findTransactionOrThrow.mockResolvedValue(txn);
      mockPrisma.dispute.findUnique.mockResolvedValue({
        id: 'existing-dispute',
      });

      const result = await service.createChargebackDispute('txn-1');
      expect(result.id).toBe('existing-dispute');
      expect(mockPrisma.dispute.create).not.toHaveBeenCalled();
    });
  });
});
