import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transaction/transaction.service';

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    dispute: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
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
    it('should create a dispute for a funded transaction', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      prisma.dispute.create.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'txn-1',
        reason: 'Item not as described',
      });
      transactionService.transition.mockResolvedValue({});

      const result = await service.create(
        { transactionId: 'txn-1', reason: 'Item not as described' },
        buyerUser,
      );

      expect(result.id).toBe('dispute-1');
      expect(transactionService.transition).toHaveBeenCalledWith(
        'txn-1',
        'DISPUTED',
        buyerUser,
      );
    });

    it('should create a dispute for a shipped transaction', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'SHIPPED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      prisma.dispute.create.mockResolvedValue({
        id: 'dispute-2',
        transactionId: 'txn-1',
        reason: 'Not shipped',
      });
      transactionService.transition.mockResolvedValue({});

      const result = await service.create(
        { transactionId: 'txn-1', reason: 'Not shipped' },
        buyerUser,
      );

      expect(result.id).toBe('dispute-2');
    });

    it('should create a dispute for a delivered transaction', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'DELIVERED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      prisma.dispute.create.mockResolvedValue({
        id: 'dispute-3',
        transactionId: 'txn-1',
        reason: 'Wrong item',
      });
      transactionService.transition.mockResolvedValue({});

      const result = await service.create(
        { transactionId: 'txn-1', reason: 'Wrong item' },
        buyerUser,
      );

      expect(result.id).toBe('dispute-3');
    });

    it('should allow seller to create a dispute', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      prisma.dispute.create.mockResolvedValue({
        id: 'dispute-4',
        transactionId: 'txn-1',
        reason: 'Buyer not responding',
      });
      transactionService.transition.mockResolvedValue({});

      const result = await service.create(
        { transactionId: 'txn-1', reason: 'Buyer not responding' },
        sellerUser,
      );

      expect(result.id).toBe('dispute-4');
    });

    it('should reject dispute for PENDING transaction', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'PENDING',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.create(
          { transactionId: 'txn-1', reason: 'Reason' },
          buyerUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject dispute for RELEASED transaction', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'RELEASED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.create(
          { transactionId: 'txn-1', reason: 'Reason' },
          buyerUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject dispute for CANCELLED transaction', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'CANCELLED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.create(
          { transactionId: 'txn-1', reason: 'Reason' },
          buyerUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject dispute from non-participant', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        buyerId: 'other-buyer',
        sellerId: 'other-seller',
      });

      await expect(
        service.create(
          { transactionId: 'txn-1', reason: 'Reason' },
          buyerUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject admin filing dispute', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.create(
          { transactionId: 'txn-1', reason: 'Reason' },
          adminUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should store evidence if provided', async () => {
      transactionService.findOne.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.create.mockResolvedValue({
        id: 'dispute-5',
        evidence: 'Screenshot attached',
      });

      await service.create(
        { transactionId: 'txn-1', reason: 'Bad item', evidence: 'Screenshot attached' },
        buyerUser,
      );

      expect(prisma.dispute.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            evidence: 'Screenshot attached',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return dispute by id', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        reason: 'Test reason',
        transaction: { buyer: {}, seller: {} },
        filedBy: {},
      });

      const result = await service.findOne('dispute-1');
      expect(result.id).toBe('dispute-1');
    });

    it('should throw NotFoundException', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneWithAccess', () => {
    it('should allow filer to access dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        filedById: 'buyer-1',
        transaction: { buyerId: 'buyer-1', sellerId: 'seller-1' },
        filedBy: {},
      });

      const result = await service.findOneWithAccess('dispute-1', buyerUser);
      expect(result.id).toBe('dispute-1');
    });

    it('should allow admin to access any dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        filedById: 'buyer-1',
        transaction: { buyerId: 'buyer-1', sellerId: 'seller-1' },
        filedBy: {},
      });

      const result = await service.findOneWithAccess('dispute-1', adminUser);
      expect(result.id).toBe('dispute-1');
    });

    it('should reject non-participant', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        filedById: 'other-user',
        transaction: { buyerId: 'other-buyer', sellerId: 'other-seller' },
        filedBy: {},
      });

      await expect(
        service.findOneWithAccess('dispute-1', buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('submitEvidence', () => {
    it('should append evidence to existing', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        evidence: 'First evidence',
        filedById: 'buyer-1',
        transaction: { buyerId: 'buyer-1', sellerId: 'seller-1' },
        filedBy: {},
      });
      prisma.dispute.update.mockResolvedValue({
        id: 'dispute-1',
        evidence: 'First evidence\n---\nNew evidence',
      });

      const result = await service.submitEvidence(
        'dispute-1',
        { evidence: 'New evidence' },
        buyerUser,
      );

      expect(prisma.dispute.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            evidence: 'First evidence\n---\nNew evidence',
          }),
        }),
      );
    });

    it('should set evidence if none exists', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        evidence: null,
        filedById: 'buyer-1',
        transaction: { buyerId: 'buyer-1', sellerId: 'seller-1' },
        filedBy: {},
      });
      prisma.dispute.update.mockResolvedValue({
        id: 'dispute-1',
        evidence: 'First evidence',
      });

      await service.submitEvidence(
        'dispute-1',
        { evidence: 'First evidence' },
        buyerUser,
      );

      expect(prisma.dispute.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            evidence: 'First evidence',
          }),
        }),
      );
    });

    it('should reject admin from submitting evidence', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        filedById: 'buyer-1',
        evidence: null,
        transaction: { buyerId: 'buyer-1', sellerId: 'seller-1' },
        filedBy: {},
      });

      await expect(
        service.submitEvidence(
          'dispute-1',
          { evidence: 'Admin evidence' },
          adminUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('resolve', () => {
    it('should resolve dispute as admin', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'txn-1',
        filedById: 'buyer-1',
        transaction: {
          status: 'DISPUTED',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
        },
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

    it('should reject non-admin from resolving', async () => {
      await expect(
        service.resolve('dispute-1', { resolution: 'RELEASE' }, buyerUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject resolving when transaction is not DISPUTED', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'txn-1',
        filedById: 'buyer-1',
        transaction: {
          status: 'RESOLVED',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
        },
        filedBy: {},
      });

      await expect(
        service.resolve('dispute-1', { resolution: 'RELEASE' }, adminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should transition transaction to RESOLVED', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'txn-1',
        filedById: 'buyer-1',
        transaction: {
          status: 'DISPUTED',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
        },
        filedBy: {},
      });
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.update.mockResolvedValue({
        id: 'dispute-1',
        resolution: 'Favor buyer',
      });

      await service.resolve(
        'dispute-1',
        { resolution: 'Favor buyer' },
        adminUser,
      );

      expect(transactionService.transition).toHaveBeenCalledWith(
        'txn-1',
        'RESOLVED',
        adminUser,
      );
    });
  });

  describe('findAll', () => {
    it('should return all disputes for admin', async () => {
      prisma.dispute.findMany.mockResolvedValue([
        { id: 'd1' },
        { id: 'd2' },
      ]);

      const result = await service.findAll(adminUser);
      expect(result).toHaveLength(2);
    });

    it('should return only own disputes for buyer', async () => {
      prisma.dispute.findMany.mockResolvedValue([{ id: 'd1' }]);

      await service.findAll(buyerUser);

      expect(prisma.dispute.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { filedById: 'buyer-1' },
        }),
      );
    });
  });
});
