import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutService } from './payout.service.js';

describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: {
    payout: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      payout: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
    };
    service = new PayoutService(prisma as any);
  });

  describe('create', () => {
    it('should create a payout for the user', async () => {
      const expected = { id: 'payout-1', userId: 'user-1', amount: 100 };
      prisma.payout.create.mockResolvedValue(expected);

      const result = await service.create('user-1', 100);

      expect(prisma.payout.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', amount: 100 },
      });
      expect(result).toEqual(expected);
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
