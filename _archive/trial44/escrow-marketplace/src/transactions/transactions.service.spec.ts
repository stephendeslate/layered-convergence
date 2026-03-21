import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: any;

  const mockTransaction = {
    id: 'txn-1',
    buyerId: 'buyer-1',
    providerId: 'provider-1',
    amount: 100,
    currency: 'USD',
    status: TransactionStatus.PENDING,
    description: 'Test transaction',
    platformFee: 5,
    holdUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      transactionStatusHistory: {
        create: vi.fn(),
        findMany: vi.fn(),
      },
      $transaction: vi.fn((fn: any) =>
        fn({
          transactionStatusHistory: { create: vi.fn() },
          transaction: { update: vi.fn().mockResolvedValue({ ...mockTransaction, status: TransactionStatus.PAYMENT_HELD }) },
        }),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction with PENDING status', async () => {
      prisma.transaction.create.mockResolvedValue(mockTransaction);

      const result = await service.create('buyer-1', {
        providerId: 'provider-1',
        amount: 100,
        description: 'Test',
      });

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          buyerId: 'buyer-1',
          status: TransactionStatus.PENDING,
        }),
      });
      expect(result).toEqual(mockTransaction);
    });

    it('should default currency to USD', async () => {
      prisma.transaction.create.mockResolvedValue(mockTransaction);

      await service.create('buyer-1', {
        providerId: 'provider-1',
        amount: 100,
      });

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ currency: 'USD' }),
      });
    });

    it('should default platformFee to 0', async () => {
      prisma.transaction.create.mockResolvedValue(mockTransaction);

      await service.create('buyer-1', {
        providerId: 'provider-1',
        amount: 100,
      });

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ platformFee: 0 }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all transactions for ADMIN', async () => {
      prisma.transaction.findMany.mockResolvedValue([mockTransaction]);

      const result = await service.findAll('admin-1', 'ADMIN');
      expect(result).toHaveLength(1);
    });

    it('should filter by userId for non-ADMIN', async () => {
      prisma.transaction.findMany.mockResolvedValue([mockTransaction]);

      await service.findAll('buyer-1', 'BUYER');
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { OR: [{ buyerId: 'buyer-1' }, { providerId: 'buyer-1' }] },
        include: expect.any(Object),
      });
    });
  });

  describe('findById', () => {
    it('should return transaction by id', async () => {
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.findById('txn-1');
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update status with valid transition', async () => {
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.updateStatus(
        'txn-1',
        TransactionStatus.PAYMENT_HELD,
        'Payment received',
        'system',
      );

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('nonexistent', TransactionStatus.PAYMENT_HELD),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on invalid transition', async () => {
      prisma.transaction.findUnique.mockResolvedValue(mockTransaction);

      await expect(
        service.updateStatus('txn-1', TransactionStatus.RELEASED),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStatusHistory', () => {
    it('should return status history ordered by createdAt', async () => {
      const history = [
        { fromStatus: 'PENDING', toStatus: 'PAYMENT_HELD', createdAt: new Date() },
      ];
      prisma.transactionStatusHistory.findMany.mockResolvedValue(history);

      const result = await service.getStatusHistory('txn-1');
      expect(result).toEqual(history);
      expect(prisma.transactionStatusHistory.findMany).toHaveBeenCalledWith({
        where: { transactionId: 'txn-1' },
        orderBy: { createdAt: 'asc' },
      });
    });
  });
});
