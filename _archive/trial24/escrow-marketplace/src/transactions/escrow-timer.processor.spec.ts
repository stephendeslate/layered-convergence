import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EscrowTimerProcessor } from './escrow-timer.processor';

const mockPrisma = {
  transaction: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  transactionStateHistory: {
    create: vi.fn(),
  },
};

const mockStateMachine = {
  canTransition: vi.fn(),
};

describe('EscrowTimerProcessor', () => {
  let processor: EscrowTimerProcessor;

  beforeEach(() => {
    vi.clearAllMocks();
    processor = new EscrowTimerProcessor(mockPrisma as any, mockStateMachine as any);
  });

  describe('process', () => {
    it('should auto-release a HELD transaction', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1', status: 'HELD' });
      mockStateMachine.canTransition.mockReturnValue(true);
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await processor.process({ data: { transactionId: 'tx-1', tenantId: 'tenant-1' } } as any);

      expect(mockPrisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: 'RELEASED' } }),
      );
    });

    it('should skip if transaction not found', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await processor.process({ data: { transactionId: 'tx-1', tenantId: 'tenant-1' } } as any);

      expect(mockPrisma.transaction.update).not.toHaveBeenCalled();
    });

    it('should skip if transaction is no longer HELD', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1', status: 'RELEASED' });

      await processor.process({ data: { transactionId: 'tx-1', tenantId: 'tenant-1' } } as any);

      expect(mockPrisma.transaction.update).not.toHaveBeenCalled();
    });

    it('should skip if transition is not allowed', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1', status: 'HELD' });
      mockStateMachine.canTransition.mockReturnValue(false);

      await processor.process({ data: { transactionId: 'tx-1', tenantId: 'tenant-1' } } as any);

      expect(mockPrisma.transaction.update).not.toHaveBeenCalled();
    });

    it('should create state history record on auto-release', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1', status: 'HELD' });
      mockStateMachine.canTransition.mockReturnValue(true);
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await processor.process({ data: { transactionId: 'tx-1', tenantId: 'tenant-1' } } as any);

      expect(mockPrisma.transactionStateHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            changedBy: 'system',
            fromState: 'HELD',
            toState: 'RELEASED',
          }),
        }),
      );
    });
  });
});
