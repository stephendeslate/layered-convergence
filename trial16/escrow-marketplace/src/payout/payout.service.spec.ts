import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: {
    transaction: { findUnique: ReturnType<typeof vi.fn> };
    payout: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  const sellerUser = { sub: 'seller-1', email: 'seller@test.com', role: 'SELLER' };
  const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN' };
  const buyerUser = { sub: 'buyer-1', email: 'buyer@test.com', role: 'BUYER' };

  beforeEach(async () => {
    prisma = {
      transaction: { findUnique: vi.fn() },
      payout: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
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
    it('should create payout for released transaction as seller', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        sellerId: 'seller-1',
        amount: { toString: () => '100.00' },
        platformFee: { toString: () => '2.50' },
      });
      prisma.payout.findFirst.mockResolvedValue(null);
      prisma.payout.create.mockResolvedValue({
        id: 'payout-1',
        transactionId: 'txn-1',
        amount: 97.5,
        status: 'PENDING',
      });

      const result = await service.create({ transactionId: 'txn-1' }, sellerUser);
      expect(result.id).toBe('payout-1');
    });

    it('should create payout as admin', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        sellerId: 'seller-1',
        amount: { toString: () => '200.00' },
        platformFee: { toString: () => '5.00' },
      });
      prisma.payout.findFirst.mockResolvedValue(null);
      prisma.payout.create.mockResolvedValue({
        id: 'payout-2',
        amount: 195,
        status: 'PENDING',
      });

      const result = await service.create({ transactionId: 'txn-1' }, adminUser);
      expect(result.id).toBe('payout-2');
    });

    it('should reject payout for non-released transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        sellerId: 'seller-1',
      });

      await expect(
        service.create({ transactionId: 'txn-1' }, sellerUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate payout', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        sellerId: 'seller-1',
        amount: { toString: () => '100' },
        platformFee: { toString: () => '2.50' },
      });
      prisma.payout.findFirst.mockResolvedValue({ id: 'existing' });

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

    it('should reject buyer from creating payout', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        sellerId: 'seller-1',
      });

      await expect(
        service.create({ transactionId: 'txn-1' }, buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject non-seller from creating payout', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        sellerId: 'other-seller',
        amount: { toString: () => '100' },
        platformFee: { toString: () => '2.50' },
      });

      await expect(
        service.create({ transactionId: 'txn-1' }, sellerUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createForTransaction', () => {
    it('should create payout for released transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        sellerId: 'seller-1',
        amount: { toString: () => '100.00' },
        platformFee: { toString: () => '2.50' },
      });
      prisma.payout.findFirst.mockResolvedValue(null);
      prisma.payout.create.mockResolvedValue({
        id: 'payout-1',
        transactionId: 'txn-1',
        amount: 97.5,
        status: 'PENDING',
      });

      const result = await service.createForTransaction('txn-1');
      expect(result.id).toBe('payout-1');
      expect(result.amount).toBe(97.5);
    });

    it('should reject payout for non-released transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
      });

      await expect(service.createForTransaction('txn-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject duplicate payout', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        sellerId: 'seller-1',
        amount: { toString: () => '100' },
        platformFee: { toString: () => '2.50' },
      });
      prisma.payout.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.createForTransaction('txn-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException for missing transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(service.createForTransaction('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return payout by id', async () => {
      prisma.payout.findUnique.mockResolvedValue({
        id: 'payout-1',
        amount: 100,
      });

      const result = await service.findOne('payout-1');
      expect(result.id).toBe('payout-1');
    });

    it('should throw NotFoundException', async () => {
      prisma.payout.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all payouts for admin', async () => {
      prisma.payout.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);

      const result = await service.findAll(adminUser);
      expect(result).toHaveLength(2);
    });

    it('should return only own payouts for seller', async () => {
      prisma.payout.findMany.mockResolvedValue([{ id: 'p1' }]);

      await service.findAll(sellerUser);

      expect(prisma.payout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'seller-1' },
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update payout status', async () => {
      prisma.payout.update.mockResolvedValue({
        id: 'payout-1',
        status: 'COMPLETED',
        stripePayoutId: 'po_123',
      });

      const result = await service.updateStatus('payout-1', 'COMPLETED', 'po_123');
      expect(result.status).toBe('COMPLETED');
    });

    it('should update status without stripePayoutId', async () => {
      prisma.payout.update.mockResolvedValue({
        id: 'payout-1',
        status: 'FAILED',
      });

      const result = await service.updateStatus('payout-1', 'FAILED');
      expect(result.status).toBe('FAILED');
    });
  });
});
