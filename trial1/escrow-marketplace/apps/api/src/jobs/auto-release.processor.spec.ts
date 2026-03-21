import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutoReleaseProcessor } from './auto-release.processor';
import { TransactionStatus, AuditAction } from '@prisma/client';

const mockPrisma = {
  transaction: {
    findUnique: vi.fn(),
  },
};

const mockTransactionService = {
  releasePayment: vi.fn(),
};

const mockConfig = {
  get: vi.fn().mockReturnValue('redis://localhost:6379'),
};

describe('AutoReleaseProcessor', () => {
  let processor: AutoReleaseProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new AutoReleaseProcessor(
      mockPrisma as any,
      mockTransactionService as any,
      mockConfig as any,
    );
  });

  it('should release a DELIVERED transaction with no dispute', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: TransactionStatus.DELIVERED,
      dispute: null,
      autoReleaseAt: new Date(Date.now() - 1000), // in the past
      provider: { connectedAccount: { stripeAccountId: 'acct_1' } },
    });

    await processor.process({
      data: { transactionId: 'txn-1' },
    } as any);

    expect(mockTransactionService.releasePayment).toHaveBeenCalledWith(
      'txn-1',
      null,
      AuditAction.AUTO_RELEASE_TRIGGERED,
    );
  });

  it('should skip if transaction is not in DELIVERED state', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: TransactionStatus.RELEASED,
      dispute: null,
    });

    await processor.process({
      data: { transactionId: 'txn-1' },
    } as any);

    expect(mockTransactionService.releasePayment).not.toHaveBeenCalled();
  });

  it('should skip if transaction has a dispute', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: TransactionStatus.DELIVERED,
      dispute: { id: 'dispute-1' },
      autoReleaseAt: new Date(Date.now() - 1000),
    });

    await processor.process({
      data: { transactionId: 'txn-1' },
    } as any);

    expect(mockTransactionService.releasePayment).not.toHaveBeenCalled();
  });

  it('should skip if transaction not found', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue(null);

    await processor.process({
      data: { transactionId: 'nonexistent' },
    } as any);

    expect(mockTransactionService.releasePayment).not.toHaveBeenCalled();
  });

  it('should skip if auto-release time not yet reached', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: TransactionStatus.DELIVERED,
      dispute: null,
      autoReleaseAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour in future
    });

    await processor.process({
      data: { transactionId: 'txn-1' },
    } as any);

    expect(mockTransactionService.releasePayment).not.toHaveBeenCalled();
  });

  it('should throw if release fails (for BullMQ retry)', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: TransactionStatus.DELIVERED,
      dispute: null,
      autoReleaseAt: new Date(Date.now() - 1000),
      provider: { connectedAccount: { stripeAccountId: 'acct_1' } },
    });
    mockTransactionService.releasePayment.mockRejectedValue(
      new Error('Stripe error'),
    );

    await expect(
      processor.process({ data: { transactionId: 'txn-1' } } as any),
    ).rejects.toThrow('Stripe error');
  });
});
