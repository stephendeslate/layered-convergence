import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionStatus, Role } from '@prisma/client';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { JwtPayload } from '../auth/auth.service';

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    transaction: { findUnique: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn> };
    dispute: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let transactionService: { updateStatus: ReturnType<typeof vi.fn> };

  const buyerUser: JwtPayload = { sub: 'buyer-1', email: 'buyer@test.com', role: Role.BUYER };
  const sellerUser: JwtPayload = { sub: 'seller-1', email: 'seller@test.com', role: Role.SELLER };
  const adminUser: JwtPayload = { sub: 'admin-1', email: 'admin@test.com', role: Role.ADMIN };

  const mockTransaction = {
    id: 'txn-1',
    amount: 100,
    status: TransactionStatus.FUNDED,
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
  };

  const mockDispute = {
    id: 'dispute-1',
    transactionId: 'txn-1',
    filedById: 'buyer-1',
    reason: 'Item not as described',
    evidence: [],
    resolution: null,
    resolvedAt: null,
    transaction: mockTransaction,
    filedBy: { id: 'buyer-1', name: 'Buyer' },
  };

  beforeEach(() => {
    prisma = {
      transaction: {
        findUnique: vi.fn().mockResolvedValue(mockTransaction),
        findFirst: vi.fn(),
      },
      dispute: {
        create: vi.fn().mockResolvedValue(mockDispute),
        findMany: vi.fn().mockResolvedValue([mockDispute]),
        findUnique: vi.fn().mockResolvedValue(mockDispute),
        update: vi.fn().mockResolvedValue(mockDispute),
      },
    };
    transactionService = {
      updateStatus: vi.fn().mockResolvedValue(mockTransaction),
    };
    service = new DisputeService(
      prisma as unknown as PrismaService,
      transactionService as unknown as TransactionService,
    );
  });

  describe('create', () => {
    it('should create a dispute for a funded transaction', async () => {
      const dto = { transactionId: 'txn-1', reason: 'Item not as described' };
      const result = await service.create(dto, buyerUser);
      expect(result).toEqual(mockDispute);
      expect(transactionService.updateStatus).toHaveBeenCalledWith('txn-1', TransactionStatus.DISPUTED, buyerUser);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);
      await expect(service.create({ transactionId: 'none', reason: 'test' }, buyerUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not the buyer', async () => {
      await expect(service.create({ transactionId: 'txn-1', reason: 'test' }, sellerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if transaction is not FUNDED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ ...mockTransaction, status: TransactionStatus.PENDING });
      await expect(service.create({ transactionId: 'txn-1', reason: 'test' }, buyerUser)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all disputes for admin', async () => {
      await service.findAll(adminUser);
      expect(prisma.dispute.findMany).toHaveBeenCalledWith({
        include: { transaction: true, filedBy: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter disputes for non-admin', async () => {
      await service.findAll(buyerUser);
      expect(prisma.dispute.findMany).toHaveBeenCalledWith({
        where: { filedById: 'buyer-1' },
        include: { transaction: true, filedBy: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return dispute for admin', async () => {
      const result = await service.findOne('dispute-1', adminUser);
      expect(result).toEqual(mockDispute);
    });

    it('should return dispute for filer', async () => {
      const result = await service.findOne('dispute-1', buyerUser);
      expect(result).toEqual(mockDispute);
    });

    it('should throw NotFoundException for non-existent dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);
      await expect(service.findOne('none', buyerUser)).rejects.toThrow(NotFoundException);
    });

    it('should check participant access for non-filer non-admin', async () => {
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);
      const result = await service.findOne('dispute-1', sellerUser);
      expect(result).toEqual(mockDispute);
    });

    it('should throw ForbiddenException for non-participant', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);
      const otherUser: JwtPayload = { sub: 'other-1', email: 'other@test.com', role: Role.BUYER };
      await expect(service.findOne('dispute-1', otherUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('submitEvidence', () => {
    it('should allow buyer to submit evidence', async () => {
      const dto = { description: 'Photo of damaged item' };
      await service.submitEvidence('dispute-1', dto, buyerUser);
      expect(prisma.dispute.update).toHaveBeenCalled();
    });

    it('should allow seller to submit evidence', async () => {
      const dto = { description: 'Shipping proof' };
      await service.submitEvidence('dispute-1', dto, sellerUser);
      expect(prisma.dispute.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);
      await expect(service.submitEvidence('none', { description: 'test' }, buyerUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for resolved dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue({ ...mockDispute, resolvedAt: new Date() });
      await expect(service.submitEvidence('dispute-1', { description: 'test' }, buyerUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for non-participant', async () => {
      const otherUser: JwtPayload = { sub: 'other-1', email: 'other@test.com', role: Role.BUYER };
      await expect(service.submitEvidence('dispute-1', { description: 'test' }, otherUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('resolve', () => {
    it('should resolve dispute with RELEASED outcome', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        ...mockDispute,
        transaction: { ...mockTransaction, status: TransactionStatus.DISPUTED },
      });

      await service.resolve('dispute-1', { resolution: 'Seller wins', outcome: TransactionStatus.RELEASED }, adminUser);

      expect(transactionService.updateStatus).toHaveBeenCalledTimes(2);
    });

    it('should resolve dispute with REFUNDED outcome', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        ...mockDispute,
        transaction: { ...mockTransaction, status: TransactionStatus.DISPUTED },
      });

      await service.resolve('dispute-1', { resolution: 'Buyer wins', outcome: TransactionStatus.REFUNDED }, adminUser);

      expect(transactionService.updateStatus).toHaveBeenCalledTimes(2);
    });

    it('should throw ForbiddenException for non-admin', async () => {
      await expect(
        service.resolve('dispute-1', { resolution: 'test', outcome: TransactionStatus.RELEASED }, buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);
      await expect(
        service.resolve('none', { resolution: 'test', outcome: TransactionStatus.RELEASED }, adminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for already resolved dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue({ ...mockDispute, resolvedAt: new Date() });
      await expect(
        service.resolve('dispute-1', { resolution: 'test', outcome: TransactionStatus.RELEASED }, adminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid outcome', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        ...mockDispute,
        transaction: { ...mockTransaction, status: TransactionStatus.DISPUTED },
      });
      await expect(
        service.resolve('dispute-1', { resolution: 'test', outcome: TransactionStatus.PENDING }, adminUser),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
