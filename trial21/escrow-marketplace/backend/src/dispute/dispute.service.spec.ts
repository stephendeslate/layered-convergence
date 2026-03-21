import { Test, TestingModule } from '@nestjs/testing';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TransactionStatus, DisputeStatus, Role } from '@prisma/client';

// [TRACED:TS-003] Unit tests for DisputeService dispute lifecycle
describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    dispute: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    transaction: { findUnique: jest.Mock; update: jest.Mock };
    setRlsContext: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      dispute: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      setRlsContext: jest.fn(),
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
    it('should create a dispute for a funded transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'buyer-1',
        status: TransactionStatus.FUNDED,
      });
      prisma.dispute.create.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'tx-1',
        reason: 'Item not as described',
        status: DisputeStatus.OPEN,
      });
      prisma.transaction.update.mockResolvedValue({});

      const result = await service.create('buyer-1', Role.BUYER, {
        transactionId: 'tx-1',
        reason: 'Item not as described',
      });

      expect(result.id).toBe('dispute-1');
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: { status: TransactionStatus.DISPUTED },
      });
    });

    it('should reject non-buyers from creating disputes', async () => {
      await expect(
        service.create('seller-1', Role.SELLER, {
          transactionId: 'tx-1',
          reason: 'Test',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject disputes on non-funded transactions', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        buyerId: 'buyer-1',
        status: TransactionStatus.PENDING,
      });

      await expect(
        service.create('buyer-1', Role.BUYER, {
          transactionId: 'tx-1',
          reason: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resolve', () => {
    it('should resolve an open dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        transactionId: 'tx-1',
        status: DisputeStatus.OPEN,
        transaction: { buyerId: 'buyer-1', sellerId: 'seller-1' },
      });
      prisma.dispute.update.mockResolvedValue({
        id: 'dispute-1',
        status: DisputeStatus.RESOLVED,
        resolution: 'Refund issued',
      });
      prisma.transaction.update.mockResolvedValue({});

      const result = await service.resolve('buyer-1', 'dispute-1', {
        resolution: 'Refund issued',
      });

      expect(result.status).toBe(DisputeStatus.RESOLVED);
    });

    it('should reject resolving already resolved disputes', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        status: DisputeStatus.RESOLVED,
        transaction: { buyerId: 'buyer-1' },
      });

      await expect(
        service.resolve('buyer-1', 'dispute-1', { resolution: 'Test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when dispute not found', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);
      await expect(service.findOne('user-1', 'dispute-1')).rejects.toThrow(NotFoundException);
    });
  });
});
