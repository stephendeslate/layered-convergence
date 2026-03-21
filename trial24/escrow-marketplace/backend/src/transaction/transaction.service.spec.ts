import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';

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
  let tenantContext: { setCurrentUser: jest.Mock };

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    tenantContext = { setCurrentUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      prisma.transaction.create.mockResolvedValue({ id: 'tx-1', status: 'PENDING' });

      const result = await service.create('buyer-1', {
        amount: 100,
        description: 'Test',
        sellerId: 'seller-1',
      });

      expect(result.id).toBe('tx-1');
      expect(tenantContext.setCurrentUser).toHaveBeenCalledWith('buyer-1');
    });
  });

  describe('findAll', () => {
    it('should return user transactions', async () => {
      prisma.transaction.findMany.mockResolvedValue([{ id: 'tx-1' }]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when not found', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-1', 'tx-bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should allow valid state transition', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });
      prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: TransactionStatus.FUNDED });

      const result = await service.updateStatus('buyer-1', 'tx-1', {
        status: TransactionStatus.FUNDED,
      });

      expect(result.status).toBe(TransactionStatus.FUNDED);
    });

    it('should reject invalid state transition', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.updateStatus('buyer-1', 'tx-1', { status: TransactionStatus.COMPLETED }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should forbid seller from funding', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.PENDING,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      });

      await expect(
        service.updateStatus('seller-1', 'tx-1', { status: TransactionStatus.FUNDED }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when transaction not found', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus('user-1', 'tx-bad', { status: TransactionStatus.FUNDED }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
