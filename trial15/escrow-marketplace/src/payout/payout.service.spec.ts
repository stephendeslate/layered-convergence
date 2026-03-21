import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus, Role } from '@prisma/client';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtPayload } from '../auth/auth.service';

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

  const sellerUser: JwtPayload = { sub: 'seller-1', email: 'seller@test.com', role: Role.SELLER };
  const buyerUser: JwtPayload = { sub: 'buyer-1', email: 'buyer@test.com', role: Role.BUYER };
  const adminUser: JwtPayload = { sub: 'admin-1', email: 'admin@test.com', role: Role.ADMIN };

  const mockTransaction = {
    id: 'txn-1',
    amount: 100,
    currency: 'USD',
    status: TransactionStatus.RELEASED,
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    seller: { id: 'seller-1', name: 'Seller' },
  };

  const mockPayout = {
    id: 'payout-1',
    transactionId: 'txn-1',
    userId: 'seller-1',
    amount: 100,
    currency: 'USD',
    status: 'pending',
    transaction: mockTransaction,
    user: { id: 'seller-1', name: 'Seller' },
  };

  beforeEach(() => {
    prisma = {
      transaction: {
        findUnique: vi.fn().mockResolvedValue(mockTransaction),
      },
      payout: {
        create: vi.fn().mockResolvedValue(mockPayout),
        findMany: vi.fn().mockResolvedValue([mockPayout]),
        findUnique: vi.fn().mockResolvedValue(mockPayout),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({ ...mockPayout, status: 'completed' }),
      },
    };
    service = new PayoutService(prisma as unknown as PrismaService);
  });

  describe('createPayout', () => {
    it('should create a payout for released transaction', async () => {
      const result = await service.createPayout('txn-1', sellerUser);
      expect(result).toEqual(mockPayout);
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
      await expect(service.createPayout('none', sellerUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-released transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...mockTransaction, status: TransactionStatus.PENDING });
      await expect(service.createPayout('txn-1', sellerUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for non-seller non-admin', async () => {
      await expect(service.createPayout('txn-1', buyerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException for duplicate payout', async () => {
      prisma.payout.findFirst.mockResolvedValue(mockPayout);
      await expect(service.createPayout('txn-1', sellerUser)).rejects.toThrow(BadRequestException);
    });

    it('should allow admin to create payout', async () => {
      const result = await service.createPayout('txn-1', adminUser);
      expect(result).toEqual(mockPayout);
    });
  });

  describe('findAll', () => {
    it('should return all payouts for admin', async () => {
      await service.findAll(adminUser);
      expect(prisma.payout.findMany).toHaveBeenCalledWith({
        include: { transaction: true, user: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter payouts for non-admin', async () => {
      await service.findAll(sellerUser);
      expect(prisma.payout.findMany).toHaveBeenCalledWith({
        where: { userId: 'seller-1' },
        include: { transaction: true, user: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a payout for the owner', async () => {
      const result = await service.findOne('payout-1', sellerUser);
      expect(result).toEqual(mockPayout);
    });

    it('should throw NotFoundException for non-existent payout', async () => {
      prisma.payout.findUnique.mockResolvedValue(null);
      await expect(service.findOne('none', sellerUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-owner non-admin', async () => {
      await expect(service.findOne('payout-1', buyerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to view any payout', async () => {
      const result = await service.findOne('payout-1', adminUser);
      expect(result).toEqual(mockPayout);
    });
  });

  describe('updateStatus', () => {
    it('should update payout status as admin', async () => {
      const result = await service.updateStatus('payout-1', 'completed', 'po_123', adminUser);
      expect(result.status).toBe('completed');
    });

    it('should throw ForbiddenException for non-admin', async () => {
      await expect(service.updateStatus('payout-1', 'completed', 'po_123', sellerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if payout not found', async () => {
      prisma.payout.findUnique.mockResolvedValue(null);
      await expect(service.updateStatus('none', 'completed', 'po_123', adminUser)).rejects.toThrow(NotFoundException);
    });
  });
});
