import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DisputeStatus } from '@prisma/client';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    dispute: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
    transaction: { findFirst: jest.Mock; update: jest.Mock };
  };

  const mockDispute = {
    id: 'dispute-1',
    reason: 'Item not as described',
    status: DisputeStatus.OPEN,
    transactionId: 'txn-1',
    filedById: 'user-1',
    resolvedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      dispute: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  describe('create', () => {
    it('should create a dispute and update transaction status', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'txn-1',
        status: 'FUNDED',
        buyerId: 'user-1',
        sellerId: 'seller-1',
      });
      prisma.dispute.create.mockResolvedValue(mockDispute);
      prisma.transaction.update.mockResolvedValue({});

      const result = await service.create(
        { reason: 'Item not as described', transactionId: 'txn-1' },
        'user-1',
      );

      expect(result.status).toBe(DisputeStatus.OPEN);
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: { status: 'DISPUTE' },
      });
    });

    it('should throw NotFoundException if transaction not found', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          { reason: 'Test', transactionId: 'bad-id' },
          'user-1',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for non-disputable status', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'txn-1',
        status: 'PENDING',
        buyerId: 'user-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.create(
          { reason: 'Test', transactionId: 'txn-1' },
          'user-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return disputes filed by the user', async () => {
      prisma.dispute.findMany.mockResolvedValue([mockDispute]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(1);
      expect(prisma.dispute.findMany).toHaveBeenCalledWith({
        where: { filedById: 'user-1' },
        include: { transaction: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('resolve', () => {
    it('should resolve an open dispute', async () => {
      prisma.dispute.findFirst.mockResolvedValue({
        ...mockDispute,
        transaction: {},
      });
      prisma.dispute.update.mockResolvedValue({
        ...mockDispute,
        status: DisputeStatus.RESOLVED,
        resolvedAt: new Date(),
      });

      const result = await service.resolve('dispute-1', 'user-1');

      expect(result.status).toBe(DisputeStatus.RESOLVED);
    });

    it('should throw BadRequestException when resolving non-open dispute', async () => {
      prisma.dispute.findFirst.mockResolvedValue({
        ...mockDispute,
        status: DisputeStatus.RESOLVED,
        transaction: {},
      });

      await expect(service.resolve('dispute-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
