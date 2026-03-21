import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PayoutService } from './payout.service.js';

describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: {
    transaction: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    payout: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      transaction: {
        findFirst: vi.fn(),
      },
      payout: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };
    service = new PayoutService(prisma as any);
  });

  describe('createByTransactionId', () => {
    it('should create a payout for the transaction provider', async () => {
      const transaction = {
        id: 'tx-1',
        providerId: 'provider-1',
        amount: 100,
      };
      prisma.transaction.findFirst.mockResolvedValue(transaction);
      const expected = { id: 'payout-1', userId: 'provider-1', transactionId: 'tx-1', amount: 100 };
      prisma.payout.create.mockResolvedValue(expected);

      const result = await service.createByTransactionId('tx-1');

      expect(prisma.payout.create).toHaveBeenCalledWith({
        data: {
          userId: 'provider-1',
          transactionId: 'tx-1',
          amount: 100,
        },
      });
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.createByTransactionId('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.createByTransactionId('nonexistent')).rejects.toThrow(
        'Transaction not found',
      );
    });

    it('should use transaction amount for payout', async () => {
      const transaction = {
        id: 'tx-2',
        providerId: 'provider-2',
        amount: 500,
      };
      prisma.transaction.findFirst.mockResolvedValue(transaction);
      prisma.payout.create.mockResolvedValue({ id: 'payout-2', amount: 500 });

      await service.createByTransactionId('tx-2');

      expect(prisma.payout.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amount: 500,
        }),
      });
    });
  });

  describe('findByUser', () => {
    it('should return payouts ordered by createdAt desc', async () => {
      const payouts = [
        { id: 'payout-2', userId: 'user-1', amount: 200 },
        { id: 'payout-1', userId: 'user-1', amount: 100 },
      ];
      prisma.payout.findMany.mockResolvedValue(payouts);

      const result = await service.findByUser('user-1');

      expect(prisma.payout.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(payouts);
    });

    it('should return empty array when no payouts exist', async () => {
      prisma.payout.findMany.mockResolvedValue([]);

      const result = await service.findByUser('user-1');

      expect(result).toEqual([]);
    });
  });
});
