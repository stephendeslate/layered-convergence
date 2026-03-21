import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: {
    payout: { findMany: jest.Mock; findFirst: jest.Mock };
  };

  const mockPayout = {
    id: 'payout-1',
    amount: 100.0,
    status: 'PENDING',
    sellerId: 'seller-1',
    transactionId: 'txn-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    transaction: { id: 'txn-1', description: 'Test' },
  };

  beforeEach(async () => {
    prisma = {
      payout: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PayoutService>(PayoutService);
  });

  describe('findAll', () => {
    it('should return payouts for the seller', async () => {
      prisma.payout.findMany.mockResolvedValue([mockPayout]);

      const result = await service.findAll('seller-1');

      expect(result).toHaveLength(1);
      expect(prisma.payout.findMany).toHaveBeenCalledWith({
        where: { sellerId: 'seller-1' },
        include: { transaction: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no payouts exist', async () => {
      prisma.payout.findMany.mockResolvedValue([]);

      const result = await service.findAll('seller-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    // findFirst justification: payout lookup scoped to seller for ownership enforcement
    it('should return a payout by ID for authorized seller', async () => {
      prisma.payout.findFirst.mockResolvedValue(mockPayout);

      const result = await service.findOne('payout-1', 'seller-1');

      expect(result.id).toBe('payout-1');
      expect(prisma.payout.findFirst).toHaveBeenCalledWith({
        where: { id: 'payout-1', sellerId: 'seller-1' },
        include: { transaction: true },
      });
    });

    it('should throw NotFoundException when payout not found', async () => {
      prisma.payout.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('bad-id', 'seller-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
