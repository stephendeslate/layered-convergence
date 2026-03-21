import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: {
    transaction: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  const mockTransaction = {
    id: 'txn-1',
    amount: 100.0,
    description: 'Test item',
    status: TransactionStatus.PENDING,
    buyerId: 'buyer-1',
    sellerId: 'seller-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
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
      const dto = { amount: 100, description: 'Test item', sellerId: 'seller-1' };
      prisma.transaction.create.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.PENDING,
      });

      const result = await service.create(dto, 'buyer-1');

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: 100,
          description: 'Test item',
          buyerId: 'buyer-1',
          sellerId: 'seller-1',
          status: TransactionStatus.PENDING,
        },
      });
      expect(result.status).toBe(TransactionStatus.PENDING);
    });
  });

  describe('findAll', () => {
    it('should return transactions for the user', async () => {
      prisma.transaction.findMany.mockResolvedValue([mockTransaction]);

      const result = await service.findAll('buyer-1');

      expect(result).toHaveLength(1);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ buyerId: 'buyer-1' }, { sellerId: 'buyer-1' }],
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a transaction by ID for authorized user', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        disputes: [],
        payouts: [],
      });

      const result = await service.findOne('txn-1', 'buyer-1');

      expect(result.id).toBe('txn-1');
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne('bad-id', 'buyer-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus (state machine)', () => {
    it('should allow PENDING → FUNDED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.PENDING,
        disputes: [],
        payouts: [],
      });
      prisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.FUNDED,
      });

      const result = await service.updateStatus(
        'txn-1',
        TransactionStatus.FUNDED,
        'buyer-1',
      );

      expect(result.status).toBe(TransactionStatus.FUNDED);
    });

    it('should allow FUNDED → SHIPPED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.FUNDED,
        disputes: [],
        payouts: [],
      });
      prisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.SHIPPED,
      });

      const result = await service.updateStatus(
        'txn-1',
        TransactionStatus.SHIPPED,
        'seller-1',
      );

      expect(result.status).toBe(TransactionStatus.SHIPPED);
    });

    it('should allow SHIPPED → DELIVERED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.SHIPPED,
        disputes: [],
        payouts: [],
      });
      prisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.DELIVERED,
      });

      const result = await service.updateStatus(
        'txn-1',
        TransactionStatus.DELIVERED,
        'buyer-1',
      );

      expect(result.status).toBe(TransactionStatus.DELIVERED);
    });

    it('should allow DELIVERED → COMPLETED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.DELIVERED,
        disputes: [],
        payouts: [],
      });
      prisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.COMPLETED,
      });

      const result = await service.updateStatus(
        'txn-1',
        TransactionStatus.COMPLETED,
        'seller-1',
      );

      expect(result.status).toBe(TransactionStatus.COMPLETED);
    });

    it('should allow FUNDED → DISPUTE', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.FUNDED,
        disputes: [],
        payouts: [],
      });
      prisma.transaction.update.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.DISPUTE,
      });

      const result = await service.updateStatus(
        'txn-1',
        TransactionStatus.DISPUTE,
        'buyer-1',
      );

      expect(result.status).toBe(TransactionStatus.DISPUTE);
    });

    it('should reject invalid transition PENDING → SHIPPED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.PENDING,
        disputes: [],
        payouts: [],
      });

      await expect(
        service.updateStatus('txn-1', TransactionStatus.SHIPPED, 'buyer-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition COMPLETED → FUNDED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.COMPLETED,
        disputes: [],
        payouts: [],
      });

      await expect(
        service.updateStatus('txn-1', TransactionStatus.FUNDED, 'buyer-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid transition REFUNDED → PENDING', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.REFUNDED,
        disputes: [],
        payouts: [],
      });

      await expect(
        service.updateStatus('txn-1', TransactionStatus.PENDING, 'buyer-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
