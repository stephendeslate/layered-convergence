import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionStatus, DisputeStatus } from '@prisma/client';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    transaction: { findFirst: jest.Mock; update: jest.Mock };
    dispute: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  };
  let tenantContext: { setCurrentUser: jest.Mock };

  beforeEach(async () => {
    prisma = {
      transaction: { findFirst: jest.fn(), update: jest.fn() },
      dispute: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    };

    tenantContext = { setCurrentUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  describe('create', () => {
    it('should create a dispute for funded transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.FUNDED,
        buyerId: 'buyer-1',
      });
      prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: TransactionStatus.DISPUTE });
      prisma.dispute.create.mockResolvedValue({ id: 'disp-1', status: DisputeStatus.OPEN });

      const result = await service.create('buyer-1', {
        reason: 'Item not as described',
        transactionId: 'tx-1',
      });

      expect(result.status).toBe(DisputeStatus.OPEN);
    });

    it('should reject dispute for pending transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
      });

      await expect(
        service.create('buyer-1', { reason: 'Test', transactionId: 'tx-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.create('buyer-1', { reason: 'Test', transactionId: 'bad-tx' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('resolve', () => {
    it('should resolve an open dispute', async () => {
      prisma.dispute.findFirst.mockResolvedValue({
        id: 'disp-1',
        status: DisputeStatus.OPEN,
      });
      prisma.dispute.update.mockResolvedValue({
        id: 'disp-1',
        status: DisputeStatus.RESOLVED,
      });

      const result = await service.resolve('buyer-1', 'disp-1');

      expect(result.status).toBe(DisputeStatus.RESOLVED);
    });

    it('should reject resolving already resolved dispute', async () => {
      prisma.dispute.findFirst.mockResolvedValue({
        id: 'disp-1',
        status: DisputeStatus.RESOLVED,
      });

      await expect(service.resolve('buyer-1', 'disp-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return disputes for user', async () => {
      prisma.dispute.findMany.mockResolvedValue([{ id: 'disp-1' }]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(1);
      expect(tenantContext.setCurrentUser).toHaveBeenCalledWith('user-1');
    });
  });
});
