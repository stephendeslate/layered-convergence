import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionsService } from '../src/transactions/transactions.service';
import { PrismaService } from '../src/prisma.service';

// TRACED: EM-TEST-001 — Unit tests for transactions service
// TRACED: EM-TEST-007 — Transaction state machine tests

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: {
    transaction: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
    listing: { findFirst: jest.Mock; update: jest.Mock };
    escrowAccount: { create: jest.Mock };
    $transaction: jest.Mock;
  };

  const tenantId = '550e8400-e29b-41d4-a716-446655440000';
  const buyerUser = {
    sub: 'buyer-id',
    role: 'BUYER',
    tenantId,
    email: 'buyer@example.com',
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      listing: { findFirst: jest.fn(), update: jest.fn() },
      escrowAccount: { create: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  describe('findAll', () => {
    it('should return paginated transactions for user', async () => {
      const transactions = [{ id: '1', amount: '100.00', status: 'PENDING' }];
      prisma.transaction.findMany.mockResolvedValue(transactions);
      prisma.transaction.count.mockResolvedValue(1);

      const result = await service.findAll(buyerUser.sub, tenantId, 1, 20);

      expect(result.data).toEqual(transactions);
      expect(result.total).toBe(1);
    });

    it('should cap pageSize at MAX_PAGE_SIZE', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);

      await service.findAll(buyerUser.sub, tenantId, 1, 500);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('create', () => {
    it('should create a transaction with escrow', async () => {
      const listing = {
        id: 'listing-id',
        price: '299.99',
        sellerId: 'seller-id',
        tenantId,
        status: 'ACTIVE',
      };
      prisma.listing.findFirst.mockResolvedValue(listing);

      const createdTx = {
        id: 'tx-id',
        amount: '299.99',
        status: 'PENDING',
        buyerId: buyerUser.sub,
        sellerId: 'seller-id',
        listingId: 'listing-id',
        tenantId,
      };
      prisma.$transaction.mockImplementation(async (fn: Function) => {
        return fn({
          transaction: { create: jest.fn().mockResolvedValue(createdTx) },
          escrowAccount: { create: jest.fn().mockResolvedValue({}) },
          listing: { update: jest.fn().mockResolvedValue({}) },
        });
      });

      const result = await service.create({ listingId: 'listing-id' }, buyerUser);
      expect(result.status).toBe('PENDING');
    });

    it('should throw NotFoundException for non-existent listing', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ listingId: 'nonexistent' }, buyerUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prevent buying own listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'listing-id',
        price: '100.00',
        sellerId: buyerUser.sub,
        tenantId,
        status: 'ACTIVE',
      });

      await expect(
        service.create({ listingId: 'listing-id' }, buyerUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should allow valid state transition PENDING -> COMPLETED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-id',
        status: 'PENDING',
        tenantId,
      });
      prisma.transaction.update.mockResolvedValue({
        id: 'tx-id',
        status: 'COMPLETED',
      });

      const result = await service.updateStatus(
        'tx-id',
        { status: 'COMPLETED' as const },
        buyerUser,
      );

      expect(result.status).toBe('COMPLETED');
    });

    it('should allow valid state transition PENDING -> DISPUTED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-id',
        status: 'PENDING',
        tenantId,
      });
      prisma.transaction.update.mockResolvedValue({
        id: 'tx-id',
        status: 'DISPUTED',
      });

      const result = await service.updateStatus(
        'tx-id',
        { status: 'DISPUTED' as const },
        buyerUser,
      );

      expect(result.status).toBe('DISPUTED');
    });

    it('should reject invalid state transition COMPLETED -> PENDING', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-id',
        status: 'COMPLETED',
        tenantId,
      });

      await expect(
        service.updateStatus(
          'tx-id',
          { status: 'PENDING' as const },
          buyerUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid state transition FAILED -> COMPLETED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-id',
        status: 'FAILED',
        tenantId,
      });

      await expect(
        service.updateStatus(
          'tx-id',
          { status: 'COMPLETED' as const },
          buyerUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus(
          'nonexistent',
          { status: 'COMPLETED' as const },
          buyerUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
