import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus, Role } from '@prisma/client';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtPayload } from '../auth/auth.service';

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

  const buyerUser: JwtPayload = { sub: 'buyer-1', email: 'buyer@test.com', role: Role.BUYER };
  const sellerUser: JwtPayload = { sub: 'seller-1', email: 'seller@test.com', role: Role.SELLER };
  const adminUser: JwtPayload = { sub: 'admin-1', email: 'admin@test.com', role: Role.ADMIN };

  const mockTransaction = {
    id: 'txn-1',
    amount: 100.0,
    currency: 'USD',
    description: 'Test item',
    status: TransactionStatus.PENDING,
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    buyer: { id: 'buyer-1', name: 'Buyer' },
    seller: { id: 'seller-1', name: 'Seller' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      transaction: {
        create: vi.fn().mockResolvedValue(mockTransaction),
        findMany: vi.fn().mockResolvedValue([mockTransaction]),
        findUnique: vi.fn().mockResolvedValue(mockTransaction),
        update: vi.fn().mockResolvedValue({ ...mockTransaction, status: TransactionStatus.FUNDED }),
      },
    };
    service = new TransactionService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a transaction with PENDING status', async () => {
      const dto = { amount: 100, description: 'Test', sellerId: 'seller-1' };
      await service.create(dto, 'buyer-1');

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: TransactionStatus.PENDING,
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
        }),
        include: { buyer: true, seller: true },
      });
    });

    it('should default currency to USD', async () => {
      const dto = { amount: 50, description: 'Test', sellerId: 'seller-1' };
      await service.create(dto, 'buyer-1');

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ currency: 'USD' }),
        include: { buyer: true, seller: true },
      });
    });

    it('should use provided currency', async () => {
      const dto = { amount: 50, description: 'Test', sellerId: 'seller-1', currency: 'EUR' };
      await service.create(dto, 'buyer-1');

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ currency: 'EUR' }),
        include: { buyer: true, seller: true },
      });
    });
  });

  describe('findAll', () => {
    it('should return all transactions for admin', async () => {
      await service.findAll(adminUser);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        include: { buyer: true, seller: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter transactions for non-admin users', async () => {
      await service.findAll(buyerUser);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ buyerId: 'buyer-1' }, { sellerId: 'buyer-1' }],
        },
        include: { buyer: true, seller: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return transaction for buyer', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...mockTransaction, disputes: [] });
      const result = await service.findOne('txn-1', buyerUser);
      expect(result.id).toBe('txn-1');
    });

    it('should return transaction for seller', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...mockTransaction, disputes: [] });
      const result = await service.findOne('txn-1', sellerUser);
      expect(result.id).toBe('txn-1');
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nonexistent', buyerUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for non-participant non-admin', async () => {
      const otherUser: JwtPayload = { sub: 'other-1', email: 'other@test.com', role: Role.BUYER };
      prisma.transaction.findUnique.mockResolvedValue({ ...mockTransaction, disputes: [] });
      await expect(service.findOne('txn-1', otherUser)).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to see any transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...mockTransaction, disputes: [] });
      const result = await service.findOne('txn-1', adminUser);
      expect(result.id).toBe('txn-1');
    });
  });

  describe('validateTransition', () => {
    it('should allow PENDING → FUNDED', () => {
      expect(() => service.validateTransition(TransactionStatus.PENDING, TransactionStatus.FUNDED)).not.toThrow();
    });

    it('should allow PENDING → CANCELLED', () => {
      expect(() => service.validateTransition(TransactionStatus.PENDING, TransactionStatus.CANCELLED)).not.toThrow();
    });

    it('should allow FUNDED → SHIPPED', () => {
      expect(() => service.validateTransition(TransactionStatus.FUNDED, TransactionStatus.SHIPPED)).not.toThrow();
    });

    it('should allow FUNDED → DISPUTED', () => {
      expect(() => service.validateTransition(TransactionStatus.FUNDED, TransactionStatus.DISPUTED)).not.toThrow();
    });

    it('should allow SHIPPED → DELIVERED', () => {
      expect(() => service.validateTransition(TransactionStatus.SHIPPED, TransactionStatus.DELIVERED)).not.toThrow();
    });

    it('should allow DELIVERED → RELEASED', () => {
      expect(() => service.validateTransition(TransactionStatus.DELIVERED, TransactionStatus.RELEASED)).not.toThrow();
    });

    it('should allow DISPUTED → RESOLVED', () => {
      expect(() => service.validateTransition(TransactionStatus.DISPUTED, TransactionStatus.RESOLVED)).not.toThrow();
    });

    it('should allow RESOLVED → RELEASED', () => {
      expect(() => service.validateTransition(TransactionStatus.RESOLVED, TransactionStatus.RELEASED)).not.toThrow();
    });

    it('should allow RESOLVED → REFUNDED', () => {
      expect(() => service.validateTransition(TransactionStatus.RESOLVED, TransactionStatus.REFUNDED)).not.toThrow();
    });

    it('should reject PENDING → SHIPPED', () => {
      expect(() => service.validateTransition(TransactionStatus.PENDING, TransactionStatus.SHIPPED)).toThrow(BadRequestException);
    });

    it('should reject CANCELLED → FUNDED', () => {
      expect(() => service.validateTransition(TransactionStatus.CANCELLED, TransactionStatus.FUNDED)).toThrow(BadRequestException);
    });

    it('should reject RELEASED → any', () => {
      expect(() => service.validateTransition(TransactionStatus.RELEASED, TransactionStatus.PENDING)).toThrow(BadRequestException);
    });

    it('should reject REFUNDED → any', () => {
      expect(() => service.validateTransition(TransactionStatus.REFUNDED, TransactionStatus.PENDING)).toThrow(BadRequestException);
    });

    it('should reject FUNDED → CANCELLED', () => {
      expect(() => service.validateTransition(TransactionStatus.FUNDED, TransactionStatus.CANCELLED)).toThrow(BadRequestException);
    });

    it('should reject SHIPPED → FUNDED', () => {
      expect(() => service.validateTransition(TransactionStatus.SHIPPED, TransactionStatus.FUNDED)).toThrow(BadRequestException);
    });

    it('should include valid transitions in error message', () => {
      try {
        service.validateTransition(TransactionStatus.PENDING, TransactionStatus.SHIPPED);
      } catch (err) {
        expect((err as BadRequestException).message).toContain('FUNDED');
        expect((err as BadRequestException).message).toContain('CANCELLED');
      }
    });
  });

  describe('updateStatus', () => {
    it('should update status for valid transition', async () => {
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      await service.updateStatus('txn-1', TransactionStatus.FUNDED, buyerUser);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: { status: TransactionStatus.FUNDED },
        include: { buyer: true, seller: true },
      });
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
      await expect(service.updateStatus('nonexistent', TransactionStatus.FUNDED, buyerUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid transition', async () => {
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);
      await expect(service.updateStatus('txn-1', TransactionStatus.SHIPPED, buyerUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for wrong role', async () => {
      const fundedTxn = { ...mockTransaction, status: TransactionStatus.FUNDED };
      prisma.transaction.findUnique.mockResolvedValue(fundedTxn);
      // buyer cannot ship (only seller can)
      await expect(service.updateStatus('txn-1', TransactionStatus.SHIPPED, buyerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should include shippingInfo when shipping', async () => {
      const fundedTxn = { ...mockTransaction, status: TransactionStatus.FUNDED };
      prisma.transaction.findUnique.mockResolvedValue(fundedTxn);
      const shippingInfo = { carrier: 'USPS', trackingNumber: '12345' };

      await service.updateStatus('txn-1', TransactionStatus.SHIPPED, sellerUser, shippingInfo);

      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: { status: TransactionStatus.SHIPPED, shippingInfo },
        include: { buyer: true, seller: true },
      });
    });
  });

  describe('getValidTransitions', () => {
    it('should return valid transitions for PENDING', () => {
      const result = service.getValidTransitions(TransactionStatus.PENDING);
      expect(result).toEqual([TransactionStatus.FUNDED, TransactionStatus.CANCELLED]);
    });

    it('should return empty array for terminal states', () => {
      expect(service.getValidTransitions(TransactionStatus.RELEASED)).toEqual([]);
      expect(service.getValidTransitions(TransactionStatus.CANCELLED)).toEqual([]);
      expect(service.getValidTransitions(TransactionStatus.REFUNDED)).toEqual([]);
    });

    it('should return RESOLVED transitions', () => {
      const result = service.getValidTransitions(TransactionStatus.RESOLVED);
      expect(result).toEqual([TransactionStatus.RELEASED, TransactionStatus.REFUNDED]);
    });
  });
});
