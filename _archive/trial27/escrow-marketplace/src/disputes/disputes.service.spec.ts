import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DisputesService } from './disputes.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  transaction: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  dispute: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  transactionStateHistory: {
    create: vi.fn(),
  },
};

const mockStateMachine = {
  validateTransition: vi.fn(),
};

describe('DisputesService', () => {
  let service: DisputesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DisputesService(mockPrisma as any, mockStateMachine as any);
  });

  describe('create', () => {
    it('should create dispute for HELD transaction', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1', status: 'HELD' });
      mockPrisma.dispute.create.mockResolvedValue({ id: 'd-1', transactionId: 'tx-1' });
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      const result = await service.create(
        { transactionId: 'tx-1', reason: 'Bad service' },
        'user-1',
      );

      expect(result.id).toBe('d-1');
      expect(mockStateMachine.validateTransition).toHaveBeenCalledWith('HELD', 'DISPUTED');
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ transactionId: 'tx-999', reason: 'Bad' }, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when transaction not HELD', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1', status: 'CREATED' });

      await expect(
        service.create({ transactionId: 'tx-1', reason: 'Bad' }, 'user-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update transaction status to DISPUTED', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({ id: 'tx-1', status: 'HELD' });
      mockPrisma.dispute.create.mockResolvedValue({ id: 'd-1' });
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.create({ transactionId: 'tx-1', reason: 'Bad' }, 'user-1');

      expect(mockPrisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: { status: 'DISPUTED' },
      });
    });
  });

  describe('findAll', () => {
    it('should return disputes', async () => {
      mockPrisma.dispute.findMany.mockResolvedValue([{ id: 'd-1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should apply filters', async () => {
      mockPrisma.dispute.findMany.mockResolvedValue([]);
      await service.findAll({ transactionId: 'tx-1', status: 'OPEN' as any });

      const call = mockPrisma.dispute.findMany.mock.calls[0][0];
      expect(call.where.transactionId).toBe('tx-1');
      expect(call.where.status).toBe('OPEN');
    });
  });

  describe('findById', () => {
    it('should return dispute when found', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue({ id: 'd-1' });
      const result = await service.findById('d-1');
      expect(result.id).toBe('d-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue(null);
      await expect(service.findById('d-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('resolve', () => {
    it('should resolve dispute in favor of provider (RELEASED)', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue({
        id: 'd-1',
        status: 'OPEN',
        transactionId: 'tx-1',
        transaction: { status: 'DISPUTED' },
      });
      mockPrisma.dispute.update.mockResolvedValue({
        id: 'd-1',
        status: 'RESOLVED_PROVIDER',
        transaction: { status: 'DISPUTED' },
      });
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.resolve('d-1', { status: 'RESOLVED_PROVIDER' as any, resolution: 'Provider wins' }, 'admin-1');

      expect(mockStateMachine.validateTransition).toHaveBeenCalledWith('DISPUTED', 'RELEASED');
    });

    it('should resolve dispute in favor of buyer (REFUNDED)', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue({
        id: 'd-1',
        status: 'OPEN',
        transactionId: 'tx-1',
        transaction: { status: 'DISPUTED' },
      });
      mockPrisma.dispute.update.mockResolvedValue({
        id: 'd-1',
        status: 'RESOLVED_BUYER',
        transaction: { status: 'DISPUTED' },
      });
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.resolve('d-1', { status: 'RESOLVED_BUYER' as any, resolution: 'Buyer wins' }, 'admin-1');

      expect(mockStateMachine.validateTransition).toHaveBeenCalledWith('DISPUTED', 'REFUNDED');
    });

    it('should throw BadRequestException for already resolved dispute', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue({
        id: 'd-1',
        status: 'RESOLVED_PROVIDER',
        transactionId: 'tx-1',
        transaction: { status: 'RELEASED' },
      });

      await expect(
        service.resolve('d-1', { status: 'RESOLVED_BUYER' as any, resolution: 'X' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
