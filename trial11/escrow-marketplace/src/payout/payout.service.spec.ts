import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PayoutService } from './payout.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransactionStatus, PayoutStatus } from '../../generated/prisma/client.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      transaction: {
        findUnique: vi.fn(),
      },
      payout: {
        create: vi.fn(),
        findMany: vi.fn(),
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

  describe('createPayout', () => {
    it('should create payout with correct amount after fee deduction', async () => {
      const transaction = {
        id: 'tx-1',
        providerId: 'provider-1',
        amount: 100,
        platformFeePercent: 10,
        status: TransactionStatus.RELEASED,
      };
      prisma.transaction.findUnique.mockResolvedValue(transaction);
      prisma.payout.create.mockResolvedValue({
        id: 'payout-1',
        userId: 'provider-1',
        amount: 90,
        status: PayoutStatus.PENDING,
      });

      const result = await service.createPayout('tx-1', 'provider-1');
      expect(result.amount).toBe(90);
      expect(prisma.payout.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 90,
            status: PayoutStatus.PENDING,
          }),
        }),
      );
    });

    it('should throw NotFoundException for nonexistent transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
      await expect(service.createPayout('bad-id', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should reject payout for non-RELEASED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        providerId: 'provider-1',
        status: TransactionStatus.FUNDED,
      });

      await expect(service.createPayout('tx-1', 'provider-1')).rejects.toThrow(BadRequestException);
    });

    it('should reject payout requested by non-provider', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        providerId: 'provider-1',
        status: TransactionStatus.RELEASED,
      });

      await expect(service.createPayout('tx-1', 'buyer-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('listPayouts', () => {
    it('should return payouts for user', async () => {
      const payouts = [{ id: 'p-1', userId: 'provider-1', amount: 90 }];
      prisma.payout.findMany.mockResolvedValue(payouts);

      const result = await service.listPayouts('provider-1');
      expect(result).toHaveLength(1);
      expect(prisma.payout.findMany).toHaveBeenCalledWith({
        where: { userId: 'provider-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
