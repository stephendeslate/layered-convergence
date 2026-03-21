import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeService } from './dispute.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
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
};

describe('DisputeService', () => {
  let service: DisputeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DisputeService(mockPrisma as never);
  });

  describe('create', () => {
    it('should create a dispute for a funded transaction', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.FUNDED,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.dispute.create.mockResolvedValue({
        id: 'dispute-1',
        reason: 'Item not as described',
        status: DisputeStatus.OPEN,
      });

      const result = await service.create('buyer-1', 'BUYER', {
        transactionId: 'tx-1',
        reason: 'Item not as described',
      });

      expect(result.id).toBe('dispute-1');
      expect(mockPrisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: { status: TransactionStatus.DISPUTED },
      });
    });

    it('should reject dispute for non-disputable status', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.create('buyer-1', 'BUYER', {
          transactionId: 'tx-1',
          reason: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.FUNDED,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.create('other-user', 'BUYER', {
          transactionId: 'tx-1',
          reason: 'Test',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('resolve', () => {
    it('should resolve an open dispute', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        status: DisputeStatus.OPEN,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        transactionId: 'tx-1',
        transaction: { id: 'tx-1' },
      });
      mockPrisma.transaction.update.mockResolvedValue({});
      mockPrisma.dispute.update.mockResolvedValue({
        id: 'dispute-1',
        status: DisputeStatus.RESOLVED,
        resolution: 'Refund issued',
      });

      const result = await service.resolve('dispute-1', 'buyer-1', 'BUYER', {
        resolution: 'Refund issued',
      });

      expect(result.status).toBe(DisputeStatus.RESOLVED);
    });

    it('should reject resolving an already resolved dispute', async () => {
      mockPrisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        status: DisputeStatus.RESOLVED,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        transactionId: 'tx-1',
        transaction: { id: 'tx-1' },
      });

      await expect(
        service.resolve('dispute-1', 'buyer-1', 'BUYER', {
          resolution: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for OPEN', () => {
      const transitions = service.getValidTransitions(DisputeStatus.OPEN);
      expect(transitions).toContain(DisputeStatus.INVESTIGATING);
    });

    it('should return empty array for RESOLVED', () => {
      const transitions = service.getValidTransitions(DisputeStatus.RESOLVED);
      expect(transitions).toEqual([]);
    });
  });
});
