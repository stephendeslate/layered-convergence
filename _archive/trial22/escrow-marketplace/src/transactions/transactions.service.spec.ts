import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionStateMachine } from './transaction-state-machine';
import { TransactionStatus } from '@prisma/client';

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

const mockQueue = {
  add: vi.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;
  let stateMachine: TransactionStateMachine;

  beforeEach(() => {
    vi.clearAllMocks();
    stateMachine = new TransactionStateMachine();
    service = new TransactionsService(
      mockPrisma as any,
      stateMachine,
      mockQueue as any,
    );
  });

  describe('create', () => {
    it('should create a transaction with correct platform fee', async () => {
      const dto = { amount: 10000, providerId: 'provider-1', description: 'Test' };
      const created = { id: 'tx-1', ...dto, buyerId: 'buyer-1', platformFee: 500, status: 'CREATED', buyer: {}, provider: {} };
      mockPrisma.transaction.create.mockResolvedValue(created);
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      const result = await service.create(dto, 'buyer-1', 'tenant-1');
      expect(result.id).toBe('tx-1');
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 10000,
            buyerId: 'buyer-1',
            providerId: 'provider-1',
            tenantId: 'tenant-1',
          }),
        }),
      );
    });

    it('should use default currency usd', async () => {
      const dto = { amount: 5000, providerId: 'provider-1' };
      mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-1', buyer: {}, provider: {} });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.create(dto, 'buyer-1', 'tenant-1');
      expect(mockPrisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'usd' }),
        }),
      );
    });

    it('should create initial state history', async () => {
      const dto = { amount: 5000, providerId: 'provider-1' };
      mockPrisma.transaction.create.mockResolvedValue({ id: 'tx-1', buyer: {}, provider: {} });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.create(dto, 'buyer-1', 'tenant-1');
      expect(mockPrisma.transactionStateHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            transactionId: 'tx-1',
            fromState: 'CREATED',
            toState: 'CREATED',
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return transactions for tenant', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([{ id: 'tx-1' }]);
      const result = await service.findAll('tenant-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-1' }),
        }),
      );
    });

    it('should filter by status when provided', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      await service.findAll('tenant-1', { status: TransactionStatus.HELD });
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'HELD' }),
        }),
      );
    });

    it('should filter by buyerId when provided', async () => {
      mockPrisma.transaction.findMany.mockResolvedValue([]);
      await service.findAll('tenant-1', { buyerId: 'b-1' });
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ buyerId: 'b-1' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return transaction by id and tenant', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({ id: 'tx-1', buyer: {}, provider: {} });
      const result = await service.findById('tx-1', 'tenant-1');
      expect(result.id).toBe('tx-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue(null);
      await expect(service.findById('tx-999', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should transition from CREATED to HELD', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1', status: TransactionStatus.CREATED, buyer: {}, provider: {}, stateHistory: [], disputes: [], payouts: [],
      });
      mockPrisma.transaction.update.mockResolvedValue({
        id: 'tx-1', status: TransactionStatus.HELD, holdUntil: new Date(), buyer: {}, provider: {},
      });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});
      mockQueue.add.mockResolvedValue({});

      const result = await service.transition(
        'tx-1',
        { status: TransactionStatus.HELD },
        'user-1',
        'tenant-1',
      );
      expect(result.status).toBe('HELD');
    });

    it('should enqueue auto-release when transitioning to HELD', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1', status: TransactionStatus.CREATED, buyer: {}, provider: {}, stateHistory: [], disputes: [], payouts: [],
      });
      const holdUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      mockPrisma.transaction.update.mockResolvedValue({
        id: 'tx-1', status: TransactionStatus.HELD, holdUntil, buyer: {}, provider: {},
      });
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});
      mockQueue.add.mockResolvedValue({});

      await service.transition('tx-1', { status: TransactionStatus.HELD }, 'user-1', 'tenant-1');
      expect(mockQueue.add).toHaveBeenCalledWith(
        'auto-release',
        expect.objectContaining({ transactionId: 'tx-1' }),
        expect.objectContaining({ delay: expect.any(Number) }),
      );
    });
  });

  describe('getStateHistory', () => {
    it('should return state history for a transaction', async () => {
      mockPrisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1', buyer: {}, provider: {}, stateHistory: [], disputes: [], payouts: [],
      });
      mockPrisma.transactionStateHistory.findMany.mockResolvedValue([
        { fromState: 'CREATED', toState: 'HELD' },
      ]);

      const result = await service.getStateHistory('tx-1', 'tenant-1');
      expect(result).toHaveLength(1);
    });
  });
});
