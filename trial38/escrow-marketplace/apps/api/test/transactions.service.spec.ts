import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionsService } from '../src/transactions/transactions.service';
import { PrismaService } from '../src/prisma/prisma.service';

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
      delete: jest.Mock;
      count: jest.Mock;
    };
    listing: {
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    escrowAccount: {
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      listing: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      escrowAccount: {
        create: jest.fn(),
      },
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
    it('should return paginated transactions with select optimization', async () => {
      const mockTxs = [{ id: '1', status: 'PENDING', amount: '100.00' }];
      prisma.transaction.findMany.mockResolvedValue(mockTxs);
      prisma.transaction.count.mockResolvedValue(1);

      const result = await service.findAll('user-1', 'tenant-1');

      expect(result.data).toEqual(mockTxs);
      expect(result.total).toBe(1);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            amount: true,
            status: true,
            listing: expect.objectContaining({
              select: expect.objectContaining({
                id: true,
                title: true,
              }),
            }),
          }),
        }),
      );
    });

    it('should respect page size limits via clampPageSize', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);

      await service.findAll('user-1', 'tenant-1', 1, 500);

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('create', () => {
    const user = {
      sub: 'buyer-1',
      role: 'BUYER',
      tenantId: 'tenant-1',
      email: 'buyer@example.com',
    };

    it('should create a transaction for an active listing', async () => {
      const listing = {
        id: 'listing-1',
        price: 100,
        sellerId: 'seller-1',
        tenantId: 'tenant-1',
        status: 'ACTIVE',
      };
      prisma.listing.findFirst.mockResolvedValue(listing);
      prisma.$transaction.mockImplementation(async (fn: Function) => {
        return fn({
          transaction: { create: jest.fn().mockResolvedValue({ id: 'tx-1', amount: 100, status: 'PENDING' }) },
          escrowAccount: { create: jest.fn().mockResolvedValue({}) },
          listing: { update: jest.fn().mockResolvedValue({}) },
        });
      });

      const result = await service.create({ listingId: 'listing-1' }, user);

      expect(result.id).toBe('tx-1');
    });

    it('should throw NotFoundException if listing not found', async () => {
      prisma.listing.findFirst.mockResolvedValue(null);

      await expect(
        service.create({ listingId: 'nonexistent' }, user),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for own listing', async () => {
      prisma.listing.findFirst.mockResolvedValue({
        id: 'listing-1',
        sellerId: 'buyer-1',
        tenantId: 'tenant-1',
        status: 'ACTIVE',
      });

      await expect(
        service.create({ listingId: 'listing-1' }, user),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    const user = {
      sub: 'user-1',
      role: 'BUYER',
      tenantId: 'tenant-1',
      email: 'user@example.com',
    };

    it('should allow valid PENDING -> COMPLETED transition', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: 'PENDING',
        tenantId: 'tenant-1',
      });
      prisma.transaction.update.mockResolvedValue({
        id: 'tx-1',
        status: 'COMPLETED',
      });

      const result = await service.updateStatus(
        'tx-1',
        { status: 'COMPLETED' as never },
        user,
      );

      expect(result.status).toBe('COMPLETED');
    });

    it('should reject invalid COMPLETED -> PENDING transition', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: 'COMPLETED',
        tenantId: 'tenant-1',
      });

      await expect(
        service.updateStatus('tx-1', { status: 'PENDING' as never }, user),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow DISPUTED -> REFUNDED transition', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: 'DISPUTED',
        tenantId: 'tenant-1',
      });
      prisma.transaction.update.mockResolvedValue({
        id: 'tx-1',
        status: 'REFUNDED',
      });

      const result = await service.updateStatus(
        'tx-1',
        { status: 'REFUNDED' as never },
        user,
      );

      expect(result.status).toBe('REFUNDED');
    });

    it('should throw NotFoundException for missing transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('nonexistent', { status: 'COMPLETED' as never }, user),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject FAILED -> COMPLETED transition', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: 'FAILED',
        tenantId: 'tenant-1',
      });

      await expect(
        service.updateStatus('tx-1', { status: 'COMPLETED' as never }, user),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    const user = {
      sub: 'buyer-1',
      role: 'BUYER',
      tenantId: 'tenant-1',
      email: 'buyer@example.com',
    };

    it('should delete a pending transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: 'PENDING',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        tenantId: 'tenant-1',
      });
      prisma.transaction.delete.mockResolvedValue({ id: 'tx-1' });

      const result = await service.remove('tx-1', user);

      expect(result).toEqual({ id: 'tx-1' });
    });

    it('should reject deletion of non-pending transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: 'COMPLETED',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        tenantId: 'tenant-1',
      });

      await expect(service.remove('tx-1', user)).rejects.toThrow(BadRequestException);
    });
  });
});
