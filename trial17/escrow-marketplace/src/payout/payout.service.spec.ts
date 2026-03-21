import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: {
    transaction: {
      findUnique: ReturnType<typeof vi.fn>;
    };
    payout: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    setRLSContext: ReturnType<typeof vi.fn>;
  };

  const sellerUser = { sub: 'seller-1', email: 'seller@test.com', role: 'SELLER' };
  const buyerUser = { sub: 'buyer-1', email: 'buyer@test.com', role: 'BUYER' };
  const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN' };

  beforeEach(async () => {
    prisma = {
      transaction: {
        findUnique: vi.fn(),
      },
      payout: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      setRLSContext: vi.fn().mockResolvedValue(undefined),
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
    it('should create a payout for RELEASED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        sellerId: 'seller-1',
        amount: { toString: () => '100.00' },
        platformFee: { toString: () => '2.50' },
        seller: {},
      });
      prisma.payout.findFirst.mockResolvedValue(null);
      prisma.payout.create.mockResolvedValue({
        id: 'payout-1',
        amount: '97.50',
        status: 'PENDING',
      });

      const result = await service.create({ transactionId: 'txn-1' }, sellerUser);
      expect(result.id).toBe('payout-1');
      expect(prisma.setRLSContext).toHaveBeenCalledWith('seller-1', 'SELLER');
    });

    it('should reject payout for non-RELEASED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        sellerId: 'seller-1',
        seller: {},
      });

      await expect(
        service.create({ transactionId: 'txn-1' }, sellerUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject non-seller non-admin creating payout', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        sellerId: 'seller-1',
        seller: {},
      });

      await expect(
        service.create({ transactionId: 'txn-1' }, buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject duplicate payout', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        sellerId: 'seller-1',
        amount: { toString: () => '100.00' },
        platformFee: { toString: () => '2.50' },
        seller: {},
      });
      prisma.payout.findFirst.mockResolvedValue({ id: 'existing-payout' });

      await expect(
        service.create({ transactionId: 'txn-1' }, sellerUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ transactionId: 'bad-id' }, sellerUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all payouts for admin', async () => {
      prisma.payout.findMany.mockResolvedValue([{ id: 'p1' }]);

      const result = await service.findAll(adminUser);
      expect(result).toHaveLength(1);
    });

    it('should filter by userId for non-admin', async () => {
      prisma.payout.findMany.mockResolvedValue([]);

      await service.findAll(sellerUser);

      expect(prisma.payout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'seller-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a payout by id', async () => {
      prisma.payout.findUnique.mockResolvedValue({ id: 'p1' });

      const result = await service.findOne('p1');
      expect(result.id).toBe('p1');
    });

    it('should throw NotFoundException for missing payout', async () => {
      prisma.payout.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update payout status', async () => {
      prisma.payout.update.mockResolvedValue({ id: 'p1', status: 'COMPLETED' });

      const result = await service.updateStatus('p1', 'COMPLETED', 'stripe-123');
      expect(result.status).toBe('COMPLETED');
    });
  });
});
