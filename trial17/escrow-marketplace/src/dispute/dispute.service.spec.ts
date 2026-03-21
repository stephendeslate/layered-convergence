import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { TransactionService } from '../transaction/transaction.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    dispute: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    setRLSContext: ReturnType<typeof vi.fn>;
  };
  let transactionService: {
    findOne: ReturnType<typeof vi.fn>;
    transition: ReturnType<typeof vi.fn>;
  };

  const buyerUser = { sub: 'buyer-1', email: 'buyer@test.com', role: 'BUYER' };
  const sellerUser = { sub: 'seller-1', email: 'seller@test.com', role: 'SELLER' };
  const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN' };

  beforeEach(async () => {
    prisma = {
      dispute: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      setRLSContext: vi.fn().mockResolvedValue(undefined),
    };

    transactionService = {
      findOne: vi.fn(),
      transition: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: prisma },
        { provide: TransactionService, useValue: transactionService },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  describe('create', () => {
    it('should create a dispute for buyer on FUNDED transaction', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.create.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'txn-1',
        reason: 'Item not as described',
      });

      const result = await service.create(
        { transactionId: 'txn-1', reason: 'Item not as described' },
        buyerUser,
      );

      expect(result.id).toBe('dispute-1');
      expect(prisma.setRLSContext).toHaveBeenCalledWith('buyer-1', 'BUYER');
    });

    it('should reject admin filing a dispute', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.create(
          { transactionId: 'txn-1', reason: 'Test' },
          adminUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject non-participant filing a dispute', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        buyerId: 'other-buyer',
        sellerId: 'other-seller',
      });

      await expect(
        service.create(
          { transactionId: 'txn-1', reason: 'Test' },
          buyerUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject dispute on non-disputable status', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'PENDING',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.create(
          { transactionId: 'txn-1', reason: 'Test' },
          buyerUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow seller to file a dispute on SHIPPED', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'SHIPPED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.create.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'txn-1',
      });

      const result = await service.create(
        { transactionId: 'txn-1', reason: 'Issue with shipping' },
        sellerUser,
      );

      expect(result.id).toBe('dispute-1');
    });
  });

  describe('findAll', () => {
    it('should return all disputes for admin', async () => {
      prisma.dispute.findMany.mockResolvedValue([{ id: 'd1' }, { id: 'd2' }]);

      const result = await service.findAll(adminUser);
      expect(result).toHaveLength(2);
    });

    it('should filter by filedById for non-admin', async () => {
      prisma.dispute.findMany.mockResolvedValue([]);

      await service.findAll(buyerUser);

      expect(prisma.dispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { filedById: 'buyer-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dispute by id', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        transaction: { buyer: {}, seller: {} },
        filedBy: {},
      });

      const result = await service.findOne('dispute-1');
      expect(result.id).toBe('dispute-1');
    });

    it('should throw NotFoundException for missing dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('resolve', () => {
    it('should allow admin to resolve a dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'txn-1',
        transaction: { status: 'DISPUTED', buyer: {}, seller: {} },
        filedBy: {},
      });
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.update.mockResolvedValue({
        id: 'dispute-1',
        resolution: 'Resolved in favor of buyer',
      });

      const result = await service.resolve(
        'dispute-1',
        { resolution: 'Resolved in favor of buyer' },
        adminUser,
      );

      expect(result.resolution).toBe('Resolved in favor of buyer');
    });

    it('should reject non-admin resolving a dispute', async () => {
      await expect(
        service.resolve(
          'dispute-1',
          { resolution: 'Test' },
          buyerUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject resolving non-DISPUTED transaction', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'txn-1',
        transaction: { status: 'FUNDED', buyer: {}, seller: {} },
        filedBy: {},
      });

      await expect(
        service.resolve(
          'dispute-1',
          { resolution: 'Test' },
          adminUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
