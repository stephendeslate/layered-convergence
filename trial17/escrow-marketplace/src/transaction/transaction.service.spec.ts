import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { TransactionService, VALID_TRANSITIONS, TRANSITION_PERMISSIONS } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: {
    transaction: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
    setRLSContext: ReturnType<typeof vi.fn>;
  };

  const buyerUser = { sub: 'buyer-1', email: 'buyer@test.com', role: 'BUYER' };
  const sellerUser = { sub: 'seller-1', email: 'seller@test.com', role: 'SELLER' };
  const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN' };

  const baseTxn = {
    id: 'txn-1',
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    buyer: {},
    seller: {},
    disputes: [],
    payouts: [],
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        groupBy: vi.fn(),
      },
      setRLSContext: vi.fn().mockResolvedValue(undefined),
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
    it('should create a transaction for a buyer', async () => {
      prisma.transaction.create.mockResolvedValue({
        id: 'txn-1',
        title: 'Test Item',
        amount: 100,
        status: 'PENDING',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      const result = await service.create(
        { title: 'Test Item', amount: 100, sellerId: 'seller-1' },
        buyerUser,
      );

      expect(result.id).toBe('txn-1');
      expect(result.status).toBe('PENDING');
    });

    it('should call setRLSContext before creating', async () => {
      prisma.transaction.create.mockResolvedValue({ id: 'txn-1' });

      await service.create(
        { title: 'Item', amount: 50, sellerId: 'seller-1' },
        buyerUser,
      );

      expect(prisma.setRLSContext).toHaveBeenCalledWith('buyer-1', 'BUYER');
    });

    it('should reject non-buyer creating transaction', async () => {
      await expect(
        service.create(
          { title: 'Test Item', amount: 100, sellerId: 'seller-1' },
          sellerUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject admin creating transaction', async () => {
      await expect(
        service.create(
          { title: 'Test Item', amount: 100, sellerId: 'seller-1' },
          adminUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass buyer id from user payload', async () => {
      prisma.transaction.create.mockResolvedValue({ id: 'txn-1' });

      await service.create(
        { title: 'Item', amount: 50, sellerId: 'seller-1' },
        buyerUser,
      );

      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            buyerId: 'buyer-1',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        title: 'Test',
        buyer: {},
        seller: {},
        disputes: [],
        payouts: [],
      });

      const result = await service.findOne('txn-1');
      expect(result.id).toBe('txn-1');
    });

    it('should throw NotFoundException for missing transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should include buyer and seller relations', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'txn-1',
        buyer: { id: 'b1' },
        seller: { id: 's1' },
        disputes: [],
        payouts: [],
      });

      const result = await service.findOne('txn-1');
      expect(result.buyer).toBeDefined();
      expect(result.seller).toBeDefined();
    });
  });

  describe('findOneWithAccess', () => {
    it('should allow buyer to access own transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'PENDING' });

      const result = await service.findOneWithAccess('txn-1', buyerUser);
      expect(result.id).toBe('txn-1');
    });

    it('should allow seller to access own transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'PENDING' });

      const result = await service.findOneWithAccess('txn-1', sellerUser);
      expect(result.id).toBe('txn-1');
    });

    it('should allow admin to access any transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'PENDING' });

      const result = await service.findOneWithAccess('txn-1', adminUser);
      expect(result.id).toBe('txn-1');
    });

    it('should reject non-participant non-admin', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        ...baseTxn,
        buyerId: 'other-buyer',
        sellerId: 'other-seller',
        status: 'PENDING',
      });

      await expect(
        service.findOneWithAccess('txn-1', buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('transition - valid transitions', () => {
    it('should allow buyer to fund a PENDING transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'PENDING' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'FUNDED' });

      const result = await service.transition('txn-1', 'FUNDED' as never, buyerUser);
      expect(result.status).toBe('FUNDED');
    });

    it('should allow buyer to cancel a PENDING transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'PENDING' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'CANCELLED' });

      const result = await service.transition('txn-1', 'CANCELLED' as never, buyerUser);
      expect(result.status).toBe('CANCELLED');
    });

    it('should allow seller to ship a FUNDED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'FUNDED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'SHIPPED' });

      const result = await service.transition('txn-1', 'SHIPPED' as never, sellerUser);
      expect(result.status).toBe('SHIPPED');
    });

    it('should allow buyer to confirm delivery', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'SHIPPED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'DELIVERED' });

      const result = await service.transition('txn-1', 'DELIVERED' as never, buyerUser);
      expect(result.status).toBe('DELIVERED');
    });

    it('should allow buyer to release a DELIVERED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'DELIVERED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'RELEASED' });

      const result = await service.transition('txn-1', 'RELEASED' as never, buyerUser);
      expect(result.status).toBe('RELEASED');
    });

    it('should allow buyer to dispute a FUNDED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'FUNDED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'DISPUTED' });

      const result = await service.transition('txn-1', 'DISPUTED' as never, buyerUser);
      expect(result.status).toBe('DISPUTED');
    });

    it('should allow seller to dispute a SHIPPED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'SHIPPED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'DISPUTED' });

      const result = await service.transition('txn-1', 'DISPUTED' as never, sellerUser);
      expect(result.status).toBe('DISPUTED');
    });

    it('should allow admin to resolve a DISPUTED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'DISPUTED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'RESOLVED' });

      const result = await service.transition('txn-1', 'RESOLVED' as never, adminUser);
      expect(result.status).toBe('RESOLVED');
    });

    it('should allow admin to release a RESOLVED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'RESOLVED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'RELEASED' });

      const result = await service.transition('txn-1', 'RELEASED' as never, adminUser);
      expect(result.status).toBe('RELEASED');
    });

    it('should allow admin to refund a RESOLVED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'RESOLVED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'REFUNDED' });

      const result = await service.transition('txn-1', 'REFUNDED' as never, adminUser);
      expect(result.status).toBe('REFUNDED');
    });

    it('should allow seller to cancel a FUNDED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'FUNDED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'CANCELLED' });

      const result = await service.transition('txn-1', 'CANCELLED' as never, sellerUser);
      expect(result.status).toBe('CANCELLED');
    });

    it('should allow admin to cancel a FUNDED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'FUNDED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'CANCELLED' });

      const result = await service.transition('txn-1', 'CANCELLED' as never, adminUser);
      expect(result.status).toBe('CANCELLED');
    });

    it('should allow buyer to dispute a DELIVERED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'DELIVERED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'DISPUTED' });

      const result = await service.transition('txn-1', 'DISPUTED' as never, buyerUser);
      expect(result.status).toBe('DISPUTED');
    });

    it('should allow admin to refund a CANCELLED transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'CANCELLED' });
      prisma.transaction.update.mockResolvedValue({ ...baseTxn, status: 'REFUNDED' });

      const result = await service.transition('txn-1', 'REFUNDED' as never, adminUser);
      expect(result.status).toBe('REFUNDED');
    });
  });

  describe('transition - invalid transitions', () => {
    it('should reject PENDING -> RELEASED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'PENDING' });

      await expect(
        service.transition('txn-1', 'RELEASED' as never, buyerUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject PENDING -> SHIPPED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'PENDING' });

      await expect(
        service.transition('txn-1', 'SHIPPED' as never, sellerUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject PENDING -> DELIVERED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'PENDING' });

      await expect(
        service.transition('txn-1', 'DELIVERED' as never, buyerUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject PENDING -> DISPUTED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'PENDING' });

      await expect(
        service.transition('txn-1', 'DISPUTED' as never, buyerUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject RELEASED -> anything (terminal state)', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'RELEASED' });

      await expect(
        service.transition('txn-1', 'FUNDED' as never, buyerUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject REFUNDED -> anything (terminal state)', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'REFUNDED' });

      await expect(
        service.transition('txn-1', 'RELEASED' as never, adminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject FUNDED -> RELEASED (must go through DELIVERED)', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'FUNDED' });

      await expect(
        service.transition('txn-1', 'RELEASED' as never, buyerUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject SHIPPED -> FUNDED (backward transition)', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'SHIPPED' });

      await expect(
        service.transition('txn-1', 'FUNDED' as never, buyerUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject DISPUTED -> RELEASED (must go through RESOLVED)', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'DISPUTED' });

      await expect(
        service.transition('txn-1', 'RELEASED' as never, adminUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('transition - role-based permission checks', () => {
    it('should reject seller funding a transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'PENDING' });

      await expect(
        service.transition('txn-1', 'FUNDED' as never, sellerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject buyer shipping a transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'FUNDED' });

      await expect(
        service.transition('txn-1', 'SHIPPED' as never, buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject seller confirming delivery', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'SHIPPED' });

      await expect(
        service.transition('txn-1', 'DELIVERED' as never, sellerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject buyer resolving a dispute', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'DISPUTED' });

      await expect(
        service.transition('txn-1', 'RESOLVED' as never, buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject seller resolving a dispute', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'DISPUTED' });

      await expect(
        service.transition('txn-1', 'RESOLVED' as never, sellerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject buyer refunding', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...baseTxn, status: 'RESOLVED' });

      await expect(
        service.transition('txn-1', 'REFUNDED' as never, buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject non-participant buyer', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        ...baseTxn,
        status: 'PENDING',
        buyerId: 'other-buyer',
        sellerId: 'other-seller',
      });

      await expect(
        service.transition('txn-1', 'FUNDED' as never, buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return all transactions for admin', async () => {
      prisma.transaction.findMany.mockResolvedValue([{ id: 'txn-1' }, { id: 'txn-2' }]);

      const result = await service.findAll(adminUser);
      expect(result).toHaveLength(2);
    });

    it('should filter by status', async () => {
      prisma.transaction.findMany.mockResolvedValue([{ id: 'txn-1', status: 'FUNDED' }]);

      const result = await service.findAll(buyerUser, 'FUNDED' as never);
      expect(result).toHaveLength(1);
    });

    it('should scope to user for non-admin', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);

      await service.findAll(buyerUser);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [{ buyerId: 'buyer-1' }, { sellerId: 'buyer-1' }],
          }),
        }),
      );
    });
  });

  describe('getStatusCounts', () => {
    it('should return grouped counts for admin', async () => {
      prisma.transaction.groupBy.mockResolvedValue([
        { status: 'PENDING', _count: { status: 3 } },
        { status: 'FUNDED', _count: { status: 2 } },
      ]);

      const result = await service.getStatusCounts('admin-1', 'ADMIN');
      expect(result).toEqual({ PENDING: 3, FUNDED: 2 });
    });

    it('should return empty object for no transactions', async () => {
      prisma.transaction.groupBy.mockResolvedValue([]);

      const result = await service.getStatusCounts('buyer-1', 'BUYER');
      expect(result).toEqual({});
    });

    it('should scope to user for non-admin', async () => {
      prisma.transaction.groupBy.mockResolvedValue([]);

      await service.getStatusCounts('seller-1', 'SELLER');

      expect(prisma.transaction.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ buyerId: 'seller-1' }, { sellerId: 'seller-1' }],
          },
        }),
      );
    });
  });

  describe('VALID_TRANSITIONS map', () => {
    it('should have entries for all 9 states', () => {
      const states = [
        'PENDING', 'FUNDED', 'SHIPPED', 'DELIVERED', 'RELEASED',
        'CANCELLED', 'DISPUTED', 'RESOLVED', 'REFUNDED',
      ];
      for (const state of states) {
        expect(VALID_TRANSITIONS).toHaveProperty(state);
      }
    });

    it('should have terminal states with correct transitions', () => {
      expect(VALID_TRANSITIONS.RELEASED).toHaveLength(0);
      expect(VALID_TRANSITIONS.REFUNDED).toHaveLength(0);
    });

    it('should allow CANCELLED -> REFUNDED', () => {
      expect(VALID_TRANSITIONS.CANCELLED).toContain('REFUNDED');
    });
  });

  describe('TRANSITION_PERMISSIONS map', () => {
    it('should have entries for all 9 states', () => {
      const states = [
        'PENDING', 'FUNDED', 'SHIPPED', 'DELIVERED', 'RELEASED',
        'CANCELLED', 'DISPUTED', 'RESOLVED', 'REFUNDED',
      ];
      for (const state of states) {
        expect(TRANSITION_PERMISSIONS).toHaveProperty(state);
      }
    });

    it('should allow only ADMIN to resolve and refund', () => {
      expect(TRANSITION_PERMISSIONS.RESOLVED).toEqual(['ADMIN']);
      expect(TRANSITION_PERMISSIONS.REFUNDED).toEqual(['ADMIN']);
    });
  });
});
