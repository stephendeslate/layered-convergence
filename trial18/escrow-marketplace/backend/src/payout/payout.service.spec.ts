import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: {
    payout: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      payout: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
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

  describe('create', () => {
    it('should create a payout with decimal amount', async () => {
      prisma.payout.create.mockResolvedValue({
        id: 'payout-1',
        amount: new Prisma.Decimal(250.75),
        transactionId: 'tx-1',
        recipientId: 'seller-1',
      });

      const result = await service.create('tx-1', 'seller-1', 250.75);
      expect(result.id).toBe('payout-1');
      expect(prisma.payout.create).toHaveBeenCalledWith({
        data: {
          transactionId: 'tx-1',
          recipientId: 'seller-1',
          amount: expect.any(Prisma.Decimal),
        },
      });
    });
  });

  describe('findById', () => {
    it('should return payout for authorized recipient', async () => {
      prisma.payout.findUnique.mockResolvedValue({
        id: 'payout-1',
        recipientId: 'seller-1',
        transaction: {},
      });

      const result = await service.findById('payout-1', 'seller-1', 'SELLER');
      expect(result.id).toBe('payout-1');
    });

    it('should throw NotFoundException for non-existent payout', async () => {
      prisma.payout.findUnique.mockResolvedValue(null);

      await expect(
        service.findById('bad-id', 'user-1', 'BUYER'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      prisma.payout.findUnique.mockResolvedValue({
        id: 'payout-1',
        recipientId: 'seller-1',
        transaction: {},
      });

      await expect(
        service.findById('payout-1', 'other-user', 'BUYER'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to view any payout', async () => {
      prisma.payout.findUnique.mockResolvedValue({
        id: 'payout-1',
        recipientId: 'seller-1',
        transaction: {},
      });

      const result = await service.findById('payout-1', 'admin-1', 'ADMIN');
      expect(result.id).toBe('payout-1');
    });
  });

  describe('markCompleted', () => {
    it('should set completedAt timestamp', async () => {
      prisma.payout.update.mockResolvedValue({
        id: 'payout-1',
        completedAt: new Date(),
      });

      const result = await service.markCompleted('payout-1');
      expect(result.completedAt).toBeDefined();
    });
  });
});
