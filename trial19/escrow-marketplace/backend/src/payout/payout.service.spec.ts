import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutService } from './payout.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PayoutStatus } from '@prisma/client';

const mockPrisma = {
  transaction: {
    findUnique: vi.fn(),
  },
  payout: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

describe('PayoutService', () => {
  let service: PayoutService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PayoutService(mockPrisma as never);
  });

  describe('create', () => {
    it('should create a payout', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      mockPrisma.payout.create.mockResolvedValue({
        id: 'payout-1',
        amount: '500.00',
        status: PayoutStatus.PENDING,
      });

      const result = await service.create('buyer-1', 'BUYER', {
        amount: 500,
        transactionId: 'tx-1',
        recipientId: 'seller-1',
      });

      expect(result.id).toBe('payout-1');
    });

    it('should throw NotFoundException for missing transaction', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.create('buyer-1', 'BUYER', {
          amount: 500,
          transactionId: 'nonexistent',
          recipientId: 'seller-1',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.create('other-user', 'BUYER', {
          amount: 500,
          transactionId: 'tx-1',
          recipientId: 'seller-1',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStatus', () => {
    it('should transition PENDING to PROCESSING', async () => {
      mockPrisma.payout.findUnique.mockResolvedValue({
        id: 'payout-1',
        status: PayoutStatus.PENDING,
        recipientId: 'seller-1',
      });
      mockPrisma.payout.update.mockResolvedValue({
        id: 'payout-1',
        status: PayoutStatus.PROCESSING,
      });

      const result = await service.updateStatus(
        'payout-1',
        PayoutStatus.PROCESSING,
        'seller-1',
        'SELLER',
      );

      expect(result.status).toBe(PayoutStatus.PROCESSING);
    });

    it('should reject invalid transition COMPLETED to PENDING', async () => {
      mockPrisma.payout.findUnique.mockResolvedValue({
        id: 'payout-1',
        status: PayoutStatus.COMPLETED,
        recipientId: 'seller-1',
      });

      await expect(
        service.updateStatus('payout-1', PayoutStatus.PENDING, 'seller-1', 'SELLER'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
