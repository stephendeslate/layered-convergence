import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TransactionStatus, Prisma } from '@prisma/client';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: {
    transaction: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  describe('create', () => {
    it('should create a transaction with PENDING status', async () => {
      const dto = { title: 'Test', amount: 100.50, sellerId: 'seller-1' };
      prisma.transaction.create.mockResolvedValue({
        id: 'tx-1',
        ...dto,
        amount: new Prisma.Decimal(100.50),
        status: TransactionStatus.PENDING,
        buyerId: 'buyer-1',
      });

      const result = await service.create('buyer-1', dto);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          title: 'Test',
          description: undefined,
          amount: expect.any(Prisma.Decimal),
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          status: TransactionStatus.PENDING,
        },
      });
      expect(result.status).toBe(TransactionStatus.PENDING);
    });
  });

  describe('findById', () => {
    it('should return transaction for authorized user', async () => {
      const tx = {
        id: 'tx-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        status: TransactionStatus.PENDING,
        buyer: {},
        seller: {},
        disputes: [],
        payouts: [],
      };
      prisma.transaction.findUnique.mockResolvedValue(tx);

      const result = await service.findById('tx-1', 'buyer-1', 'BUYER');
      expect(result).toEqual(tx);
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.findById('bad-id', 'user-1', 'BUYER'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        buyer: {},
        seller: {},
        disputes: [],
        payouts: [],
      });

      await expect(
        service.findById('tx-1', 'other-user', 'BUYER'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow ADMIN to access any transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        buyer: {},
        seller: {},
        disputes: [],
        payouts: [],
      });

      const result = await service.findById('tx-1', 'admin-1', 'ADMIN');
      expect(result.id).toBe('tx-1');
    });
  });

  describe('updateStatus (state machine)', () => {
    it('should allow PENDING -> FUNDED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      prisma.transaction.update.mockResolvedValue({
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

    it('should allow FUNDED -> SHIPPED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.FUNDED,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      prisma.transaction.update.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.SHIPPED,
      });

      const result = await service.updateStatus(
        'tx-1',
        TransactionStatus.SHIPPED,
        'seller-1',
        'SELLER',
      );
      expect(result.status).toBe(TransactionStatus.SHIPPED);
    });

    it('should reject invalid transition PENDING -> COMPLETED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.updateStatus(
          'tx-1',
          TransactionStatus.COMPLETED,
          'buyer-1',
          'BUYER',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition COMPLETED -> PENDING', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.COMPLETED,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.updateStatus(
          'tx-1',
          TransactionStatus.PENDING,
          'buyer-1',
          'BUYER',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow FUNDED -> DISPUTED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.FUNDED,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      prisma.transaction.update.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.DISPUTED,
      });

      const result = await service.updateStatus(
        'tx-1',
        TransactionStatus.DISPUTED,
        'buyer-1',
        'BUYER',
      );
      expect(result.status).toBe(TransactionStatus.DISPUTED);
    });

    it('should allow PENDING -> CANCELLED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      prisma.transaction.update.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.CANCELLED,
      });

      const result = await service.updateStatus(
        'tx-1',
        TransactionStatus.CANCELLED,
        'buyer-1',
        'BUYER',
      );
      expect(result.status).toBe(TransactionStatus.CANCELLED);
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for each state', () => {
      expect(service.getValidTransitions(TransactionStatus.PENDING)).toContain(TransactionStatus.FUNDED);
      expect(service.getValidTransitions(TransactionStatus.PENDING)).toContain(TransactionStatus.CANCELLED);
      expect(service.getValidTransitions(TransactionStatus.COMPLETED)).toEqual([]);
      expect(service.getValidTransitions(TransactionStatus.REFUNDED)).toEqual([]);
    });
  });
});
