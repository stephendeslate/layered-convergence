import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionStatus, DisputeStatus } from '@prisma/client';
import { DisputesService } from './disputes.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

describe('DisputesService', () => {
  let service: DisputesService;
  let prisma: any;
  let transactionsService: any;

  const mockDispute = {
    id: 'dispute-1',
    transactionId: 'txn-1',
    raisedById: 'user-1',
    reason: 'Not delivered',
    evidence: null,
    status: DisputeStatus.OPEN,
    resolution: null,
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransaction = {
    id: 'txn-1',
    buyerId: 'buyer-1',
    providerId: 'provider-1',
    amount: 100,
    status: TransactionStatus.PAYMENT_HELD,
  };

  beforeEach(async () => {
    prisma = {
      dispute: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    transactionsService = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputesService,
        { provide: PrismaService, useValue: prisma },
        { provide: TransactionsService, useValue: transactionsService },
      ],
    }).compile();

    service = module.get<DisputesService>(DisputesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dispute and update transaction status', async () => {
      transactionsService.findById.mockResolvedValue(mockTransaction);
      prisma.dispute.create.mockResolvedValue(mockDispute);
      transactionsService.updateStatus.mockResolvedValue({});

      const result = await service.create('user-1', {
        transactionId: 'txn-1',
        reason: 'Not delivered',
      });

      expect(prisma.dispute.create).toHaveBeenCalled();
      expect(transactionsService.updateStatus).toHaveBeenCalledWith(
        'txn-1',
        TransactionStatus.DISPUTED,
        expect.stringContaining('Not delivered'),
        'user-1',
      );
      expect(result).toEqual(mockDispute);
    });

    it('should throw BadRequestException for non-disputable status', async () => {
      transactionsService.findById.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.RELEASED,
      });

      await expect(
        service.create('user-1', {
          transactionId: 'txn-1',
          reason: 'Late',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow dispute for DELIVERED transactions', async () => {
      transactionsService.findById.mockResolvedValue({
        ...mockTransaction,
        status: TransactionStatus.DELIVERED,
      });
      prisma.dispute.create.mockResolvedValue(mockDispute);
      transactionsService.updateStatus.mockResolvedValue({});

      await expect(
        service.create('user-1', {
          transactionId: 'txn-1',
          reason: 'Quality issue',
        }),
      ).resolves.toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all disputes with relations', async () => {
      prisma.dispute.findMany.mockResolvedValue([mockDispute]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findById', () => {
    it('should return dispute by id', async () => {
      prisma.dispute.findUnique.mockResolvedValue(mockDispute);

      const result = await service.findById('dispute-1');
      expect(result).toEqual(mockDispute);
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resolve', () => {
    it('should resolve in buyer favor and refund', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        ...mockDispute,
        status: DisputeStatus.OPEN,
      });
      transactionsService.updateStatus.mockResolvedValue({});
      prisma.dispute.update.mockResolvedValue({
        ...mockDispute,
        status: DisputeStatus.RESOLVED_BUYER,
      });

      const result = await service.resolve(
        'dispute-1',
        { resolution: 'RESOLVED_BUYER', reason: 'Buyer is right' },
        'admin-1',
      );

      expect(transactionsService.updateStatus).toHaveBeenCalledWith(
        'txn-1',
        TransactionStatus.REFUNDED,
        expect.any(String),
        'admin-1',
      );
    });

    it('should resolve in provider favor and release', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        ...mockDispute,
        status: DisputeStatus.OPEN,
      });
      transactionsService.updateStatus.mockResolvedValue({});
      prisma.dispute.update.mockResolvedValue({
        ...mockDispute,
        status: DisputeStatus.RESOLVED_PROVIDER,
      });

      await service.resolve(
        'dispute-1',
        { resolution: 'RESOLVED_PROVIDER', reason: 'Provider delivered' },
        'admin-1',
      );

      expect(transactionsService.updateStatus).toHaveBeenCalledWith(
        'txn-1',
        TransactionStatus.RELEASED,
        expect.any(String),
        'admin-1',
      );
    });

    it('should reject resolving already resolved disputes', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        ...mockDispute,
        status: DisputeStatus.RESOLVED_BUYER,
      });

      await expect(
        service.resolve(
          'dispute-1',
          { resolution: 'RESOLVED_BUYER', reason: 'Test' },
          'admin-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
