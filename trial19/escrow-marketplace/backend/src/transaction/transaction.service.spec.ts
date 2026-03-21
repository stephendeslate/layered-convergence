import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from './transaction.service';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';

const mockPrisma = {
  transaction: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TransactionService(mockPrisma as never);
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const created = { id: 'tx-1', title: 'Test', amount: '100.00', status: 'PENDING' };
      mockPrisma.transaction.create.mockResolvedValue(created);

      const result = await service.create('buyer-1', {
        title: 'Test',
        amount: 100,
        sellerId: 'seller-1',
      });

      expect(result.id).toBe('tx-1');
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return transaction for authorized user', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      const result = await service.findById('tx-1', 'buyer-1', 'BUYER');
      expect(result.id).toBe('tx-1');
    });

    it('should throw NotFoundException for missing transaction', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.findById('nonexistent', 'buyer-1', 'BUYER'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.findById('tx-1', 'other-user', 'BUYER'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should transition PENDING to FUNDED', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      mockPrisma.transaction.update.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.FUNDED,
      });

      const result = await service.updateStatus(
        'tx-1',
        TransactionStatus.FUNDED,
        'buyer-1',
        'BUYER',
      );

      expect(result.status).toBe(TransactionStatus.FUNDED);
    });

    it('should reject invalid transition PENDING to SHIPPED', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.updateStatus('tx-1', TransactionStatus.SHIPPED, 'buyer-1', 'BUYER'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject transition from terminal state RELEASED', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.RELEASED,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.updateStatus('tx-1', TransactionStatus.FUNDED, 'buyer-1', 'BUYER'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for PENDING', () => {
      const transitions = service.getValidTransitions(TransactionStatus.PENDING);
      expect(transitions).toContain(TransactionStatus.FUNDED);
      expect(transitions).not.toContain(TransactionStatus.SHIPPED);
    });

    it('should return empty array for terminal state REFUNDED', () => {
      const transitions = service.getValidTransitions(TransactionStatus.REFUNDED);
      expect(transitions).toEqual([]);
    });
  });
});
