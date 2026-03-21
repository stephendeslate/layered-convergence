import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionsService } from './transactions.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  transaction: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  transactionStateHistory: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
};

const mockStateMachine = {
  validateTransition: vi.fn(),
  canTransition: vi.fn(),
};

const mockEscrowQueue = {
  add: vi.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TransactionsService(mockPrisma as any, mockStateMachine as any, mockEscrowQueue as any);
  });

  describe('create', () => {
    it('should create a transaction with platform fee', async () => {
      const tx = { id: 'tx-1', amount: 10000, platformFee: 500, status: 'CREATED' };
      mockPrisma.transaction.create.mockResolvedValue(tx);
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      const result = await service.create(
        { amount: 10000, providerId: 'p-1', description: 'Test' },
        'buyer-1',
        'tenant-1',
      );

      expect(mockPrisma.transaction.create).toHaveBeenCalled();
      expect(result.id).toBe('tx-1');
    });

    it('should create initial state history entry', async () => {
      mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-1' });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.create({ amount: 1000, providerId: 'p-1' }, 'buyer-1', 'tenant-1');

      expect(mockPrisma.transactionStateHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          transactionId: 'tx-1',
          fromState: 'CREATED',
          toState: 'CREATED',
          reason: 'Transaction created',
          changedBy: 'buyer-1',
        }),
      });
    });

    it('should use default currency usd', async () => {
      mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-1' });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.create({ amount: 1000, providerId: 'p-1' }, 'buyer-1', 'tenant-1');

      const createCall = mockPrisma.transaction.create.mock.calls[0][0];
      expect(createCall.data.currency).toBe('usd');
    });
  });

  describe('findAll', () => {
    it('should return transactions for tenant', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([{ id: 'tx-1' }]);

      const result = await service.findAll('tenant-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });

    it('should apply status filter', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.findAll('tenant-1', { status: 'HELD' as any });

      const call = mockPrisma.transaction.findMany.mock.calls[0][0];
      expect(call.where.status).toBe('HELD');
    });

    it('should apply buyerId filter', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.findAll('tenant-1', { buyerId: 'buyer-1' });

      const call = mockPrisma.transaction.findMany.mock.calls[0][0];
      expect(call.where.buyerId).toBe('buyer-1');
    });
  });

  describe('findById', () => {
    it('should return transaction when found', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', tenantId: 'tenant-1' });

      const result = await service.findById('tx-1', 'tenant-1');
      expect(result.id).toBe('tx-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findById('tx-999', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should validate and update transaction status', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', status: 'CREATED', tenantId: 'tenant-1' });
      mockPrisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'HELD', holdUntil: null });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.transition('tx-1', { status: 'HELD' as any, reason: 'Funded' }, 'user-1', 'tenant-1');

      expect(mockStateMachine.validateTransition).toHaveBeenCalledWith('CREATED', 'HELD');
      expect(mockPrisma.transaction.update).toHaveBeenCalled();
    });

    it('should add escrow queue job when transitioning to HELD', async () => {
      const holdUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', status: 'CREATED', tenantId: 'tenant-1' });
      mockPrisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'HELD', holdUntil });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.transition('tx-1', { status: 'HELD' as any, reason: 'Funded' }, 'user-1', 'tenant-1');

      expect(mockEscrowQueue.add).toHaveBeenCalledWith(
        'auto-release',
        { transactionId: 'tx-1', tenantId: 'tenant-1' },
        expect.objectContaining({ delay: expect.any(Number) }),
      );
    });

    it('should not add queue job for non-HELD transitions', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', status: 'HELD', tenantId: 'tenant-1' });
      mockPrisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'RELEASED', holdUntil: null });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.transition('tx-1', { status: 'RELEASED' as any, reason: 'Done' }, 'user-1', 'tenant-1');

      expect(mockEscrowQueue.add).not.toHaveBeenCalled();
    });

    it('should create state history record', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', status: 'HELD', tenantId: 'tenant-1' });
      mockPrisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'RELEASED', holdUntil: null });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.transition('tx-1', { status: 'RELEASED' as any, reason: 'Complete' }, 'user-1', 'tenant-1');

      expect(mockPrisma.transactionStateHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          transactionId: 'tx-1',
          fromState: 'HELD',
          toState: 'RELEASED',
          reason: 'Complete',
          changedBy: 'user-1',
        }),
      });
    });
  });

  describe('getStateHistory', () => {
    it('should return state history for transaction', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', tenantId: 'tenant-1' });
      mockPrisma.transactionStateHistory.findMany.mockResolvedValue([{ id: 'h-1' }]);

      const result = await service.getStateHistory('tx-1', 'tenant-1');
      expect(result).toHaveLength(1);
    });

    it('should throw if transaction not found', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.getStateHistory('tx-999', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });
});
