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

const mockQueue = {
  add: vi.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TransactionsService(mockPrisma as any, mockStateMachine as any, mockQueue as any);
  });

  describe('create', () => {
    it('should create a transaction with platform fee', async () => {
      const dto = { amount: 10000, providerId: 'prov-1' };
      mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-1', amount: 10000, platformFee: 500, status: 'CREATED' });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      const result = await service.create(dto as any, 'buyer-1', 'tenant-1');

      expect(result.id).toBe('tx-1');
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
      expect(mockPrisma.transactionStateHistory.create).toHaveBeenCalled();
    });

    it('should use default currency usd', async () => {
      const dto = { amount: 5000, providerId: 'prov-1' };
      mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-1', currency: 'usd' });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.create(dto as any, 'buyer-1', 'tenant-1');

      const createCall = mockPrisma.transaction.create.mock.calls[0][0];
      expect(createCall.data.currency).toBe('usd');
    });
  });

  describe('findAll', () => {
    it('should find transactions by tenantId', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.findAll('tenant-1');

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-1' }) }),
      );
    });

    it('should apply status filter', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.findAll('tenant-1', { status: 'HELD' as any });

      const call = mockPrisma.transaction.findMany.mock.calls[0][0];
      expect(call.where.status).toBe('HELD');
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

      await expect(service.findById('none', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should validate and update transaction status', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', status: 'CREATED', tenantId: 'tenant-1' });
      mockPrisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'HELD', holdUntil: null });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.transition('tx-1', { status: 'HELD' as any }, 'user-1', 'tenant-1');

      expect(mockStateMachine.validateTransition).toHaveBeenCalledWith('CREATED', 'HELD');
      expect(mockPrisma.transaction.update).toHaveBeenCalled();
    });

    it('should add escrow queue job when transitioning to HELD', async () => {
      const holdUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', status: 'CREATED', tenantId: 'tenant-1' });
      mockPrisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'HELD', holdUntil });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.transition('tx-1', { status: 'HELD' as any }, 'user-1', 'tenant-1');

      expect(mockQueue.add).toHaveBeenCalledWith('auto-release', expect.any(Object), expect.any(Object));
    });
  });

  describe('getStateHistory', () => {
    it('should return state history for a transaction', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1' });
      mockPrisma.transactionStateHistory.findMany.mockResolvedValue([{ id: 'h-1' }]);

      const result = await service.getStateHistory('tx-1', 'tenant-1');
      expect(result).toHaveLength(1);
    });
  });
});
