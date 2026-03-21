import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { TransactionStateMachine } from '../transactions/transaction-state-machine';
import { TransactionStatus, DisputeStatus } from '@prisma/client';

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

describe('DisputesService', () => {
  let service: DisputesService;
  let stateMachine: TransactionStateMachine;

  beforeEach(() => {
    vi.clearAllMocks();
    stateMachine = new TransactionStateMachine();
    service = new DisputesService(mockPrisma as any, stateMachine);
  });

  describe('create', () => {
    it('should create a dispute for HELD transaction', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1', status: TransactionStatus.HELD,
      });
      mockPrisma.dispute.create.mockResolvedValue({
        id: 'disp-1', transactionId: 'tx-1', reason: 'Bad service',
        transaction: {}, raisedBy: {},
      });
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      const result = await service.create(
        { transactionId: 'tx-1', reason: 'Bad service' },
        'buyer-1',
      );
      expect(result.id).toBe('disp-1');
    });

    it('should throw NotFoundException when transaction not found', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ transactionId: 'tx-999', reason: 'Bad' }, 'buyer-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when transaction not HELD', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1', status: TransactionStatus.CREATED,
      });
      await expect(
        service.create({ transactionId: 'tx-1', reason: 'Bad' }, 'buyer-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should transition transaction to DISPUTED', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1', status: TransactionStatus.HELD,
      });
      mockPrisma.dispute.create.mockResolvedValue({
        id: 'disp-1', transaction: {}, raisedBy: {},
      });
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.create({ transactionId: 'tx-1', reason: 'Bad service' }, 'buyer-1');
      expect(mockPrisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: TransactionStatus.DISPUTED },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all disputes', async () => {
      mockPrisma.dispute.findMany.mockResolvedValue([{ id: 'disp-1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by transactionId', async () => {
      mockPrisma.dispute.findMany.mockResolvedValue([]);
      await service.findAll({ transactionId: 'tx-1' });
      expect(mockPrisma.dispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ transactionId: 'tx-1' }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return dispute when found', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue({ id: 'disp-1', transaction: {}, raisedBy: {} });
      const result = await service.findById('disp-1');
      expect(result.id).toBe('disp-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue(null);
      await expect(service.findById('disp-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('resolve', () => {
    it('should resolve dispute in provider favor and release funds', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue({
        id: 'disp-1', status: DisputeStatus.OPEN,
        transaction: { id: 'tx-1', status: TransactionStatus.DISPUTED },
        transactionId: 'tx-1', raisedBy: {},
      });
      mockPrisma.dispute.update.mockResolvedValue({
        id: 'disp-1', status: DisputeStatus.RESOLVED_PROVIDER,
        transaction: { id: 'tx-1' },
      });
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      const result = await service.resolve(
        'disp-1',
        { status: DisputeStatus.RESOLVED_PROVIDER, resolution: 'Provider provided proof' },
        'admin-1',
      );
      expect(result.status).toBe('RESOLVED_PROVIDER');
    });

    it('should resolve dispute in buyer favor and refund', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue({
        id: 'disp-1', status: DisputeStatus.OPEN,
        transaction: { id: 'tx-1', status: TransactionStatus.DISPUTED },
        transactionId: 'tx-1', raisedBy: {},
      });
      mockPrisma.dispute.update.mockResolvedValue({
        id: 'disp-1', status: DisputeStatus.RESOLVED_BUYER,
        transaction: { id: 'tx-1' },
      });
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.transactionStateHistory.create.mockResolvedValue({});

      await service.resolve(
        'disp-1',
        { status: DisputeStatus.RESOLVED_BUYER, resolution: 'Buyer is right' },
        'admin-1',
      );

      expect(mockPrisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: TransactionStatus.REFUNDED },
        }),
      );
    });

    it('should throw BadRequestException when dispute already resolved', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue({
        id: 'disp-1', status: DisputeStatus.RESOLVED_BUYER,
        transaction: {}, transactionId: 'tx-1', raisedBy: {},
      });

      await expect(
        service.resolve('disp-1', { status: DisputeStatus.RESOLVED_PROVIDER, resolution: 'test' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
