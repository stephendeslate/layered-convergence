// TRACED: EM-TEST-003 — Transaction service unit tests with state machine
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsService } from '../src/transactions/transactions.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: {
    transaction: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    escrowAccount: { create: jest.Mock; deleteMany: jest.Mock };
    dispute: { create: jest.Mock; deleteMany: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      escrowAccount: { create: jest.fn(), deleteMany: jest.fn() },
      dispute: { create: jest.fn(), deleteMany: jest.fn() },
      $transaction: jest.fn((fn) => fn(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  describe('create', () => {
    it('should create a transaction with an escrow account atomically', async () => {
      const dto = {
        amount: 1500,
        buyerId: 'buyer-001',
        sellerId: 'seller-001',
        listingId: 'listing-001',
        tenantId: 'tenant-001',
      };

      prisma.transaction.create.mockResolvedValue({ id: 'txn-001', ...dto, status: 'PENDING' });
      prisma.escrowAccount.create.mockResolvedValue({ id: 'escrow-001' });

      const result = await service.create(dto);

      expect(result.id).toBe('txn-001');
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions with select optimization', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);
      prisma.transaction.count.mockResolvedValue(0);

      const result = await service.findAll('tenant-001', 1, 20);

      expect(result.data).toEqual([]);
      expect(result.totalPages).toBe(0);
      const findManyArgs = prisma.transaction.findMany.mock.calls[0][0];
      expect(findManyArgs.select).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return a transaction with all relations included', async () => {
      const mockTransaction = {
        id: 'txn-001',
        status: 'PENDING',
        buyer: { id: 'b1', name: 'Buyer', email: 'b@test.com' },
        seller: { id: 's1', name: 'Seller', email: 's@test.com' },
        listing: { id: 'l1', title: 'Item', slug: 'item', price: '100.00' },
        escrowAccount: { id: 'e1', amount: '100.00' },
        disputes: [],
      };
      prisma.transaction.findFirst.mockResolvedValue(mockTransaction);

      const result = await service.findOne('txn-001', 'tenant-001');
      expect(result.buyer).toBeDefined();
      expect(result.escrowAccount).toBeDefined();
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);
      await expect(service.findOne('nonexistent', 'tenant-001')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus (state machine)', () => {
    it('should allow PENDING -> COMPLETED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: 'txn-001', status: 'PENDING' });
      prisma.transaction.update.mockResolvedValue({ id: 'txn-001', status: 'COMPLETED' });

      const result = await service.updateStatus('txn-001', 'tenant-001', { status: 'COMPLETED' });
      expect(result.status).toBe('COMPLETED');
    });

    it('should allow PENDING -> DISPUTED and create dispute record', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: 'txn-001', status: 'PENDING' });
      prisma.transaction.update.mockResolvedValue({ id: 'txn-001', status: 'DISPUTED' });
      prisma.dispute.create.mockResolvedValue({ id: 'dispute-001' });

      await service.updateStatus('txn-001', 'tenant-001', {
        status: 'DISPUTED',
        disputeReason: 'Item not as described',
      });

      expect(prisma.dispute.create).toHaveBeenCalled();
    });

    it('should allow PENDING -> FAILED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: 'txn-001', status: 'PENDING' });
      prisma.transaction.update.mockResolvedValue({ id: 'txn-001', status: 'FAILED' });

      const result = await service.updateStatus('txn-001', 'tenant-001', { status: 'FAILED' });
      expect(result.status).toBe('FAILED');
    });

    it('should allow DISPUTED -> REFUNDED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: 'txn-001', status: 'DISPUTED' });
      prisma.transaction.update.mockResolvedValue({ id: 'txn-001', status: 'REFUNDED' });

      const result = await service.updateStatus('txn-001', 'tenant-001', { status: 'REFUNDED' });
      expect(result.status).toBe('REFUNDED');
    });

    it('should reject COMPLETED -> PENDING (invalid transition)', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: 'txn-001', status: 'COMPLETED' });

      await expect(
        service.updateStatus('txn-001', 'tenant-001', { status: 'PENDING' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject FAILED -> COMPLETED (terminal state)', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: 'txn-001', status: 'FAILED' });

      await expect(
        service.updateStatus('txn-001', 'tenant-001', { status: 'COMPLETED' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete transaction and related records', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: 'txn-001', status: 'PENDING' });
      prisma.dispute.deleteMany.mockResolvedValue({ count: 0 });
      prisma.escrowAccount.deleteMany.mockResolvedValue({ count: 1 });
      prisma.transaction.delete.mockResolvedValue({ id: 'txn-001' });

      await service.remove('txn-001', 'tenant-001');

      expect(prisma.dispute.deleteMany).toHaveBeenCalled();
      expect(prisma.escrowAccount.deleteMany).toHaveBeenCalled();
      expect(prisma.transaction.delete).toHaveBeenCalled();
    });
  });
});
