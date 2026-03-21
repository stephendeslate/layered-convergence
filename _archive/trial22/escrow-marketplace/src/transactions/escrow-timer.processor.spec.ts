import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EscrowTimerProcessor } from './escrow-timer.processor';
import { TransactionStateMachine } from './transaction-state-machine';
import { TransactionStatus } from '@prisma/client';

const mockPrisma = {
  transaction: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  transactionStateHistory: {
    create: vi.fn(),
  },
};

describe('EscrowTimerProcessor', () => {
  let processor: EscrowTimerProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    const stateMachine = new TransactionStateMachine();
    processor = new EscrowTimerProcessor(mockPrisma as any, stateMachine);
  });

  it('should auto-release a HELD transaction', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'tx-1', status: TransactionStatus.HELD,
    });
    mockPrisma.transaction.update.mockResolvedValue({});
    mockPrisma.transactionStateHistory.create.mockResolvedValue({});

    await processor.process({ data: { transactionId: 'tx-1', tenantId: 't-1' } } as any);

    expect(mockPrisma.transaction.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { status: TransactionStatus.RELEASED },
      }),
    );
  });

  it('should skip when transaction not found', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue(null);
    await processor.process({ data: { transactionId: 'tx-999', tenantId: 't-1' } } as any);
    expect(mockPrisma.transaction.update).not.toHaveBeenCalled();
  });

  it('should skip when transaction is no longer HELD', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'tx-1', status: TransactionStatus.RELEASED,
    });
    await processor.process({ data: { transactionId: 'tx-1', tenantId: 't-1' } } as any);
    expect(mockPrisma.transaction.update).not.toHaveBeenCalled();
  });

  it('should create state history record on auto-release', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'tx-1', status: TransactionStatus.HELD,
    });
    mockPrisma.transaction.update.mockResolvedValue({});
    mockPrisma.transactionStateHistory.create.mockResolvedValue({});

    await processor.process({ data: { transactionId: 'tx-1', tenantId: 't-1' } } as any);

    expect(mockPrisma.transactionStateHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fromState: TransactionStatus.HELD,
          toState: TransactionStatus.RELEASED,
          changedBy: 'system',
        }),
      }),
    );
  });
});
