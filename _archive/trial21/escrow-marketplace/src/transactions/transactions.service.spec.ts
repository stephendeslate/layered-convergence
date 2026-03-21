import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
        groupBy: vi.fn(),
        aggregate: vi.fn(),
      },
      transactionStateHistory: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
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
    it('should create a transaction', async () => {
      const dto = { amount: 1000, providerId: 'p1' };
      prisma.transaction.create.mockResolvedValue({ id: '1', ...dto, status: 'CREATED' });

      const result = await service.create('buyer-1', 'tenant-1', dto);

      expect(result.status).toBe('CREATED');
      expect(prisma.transaction.create).toHaveBeenCalled();
    });

    it('should set default currency to usd', async () => {
      const dto = { amount: 1000, providerId: 'p1' };
      prisma.transaction.create.mockResolvedValue({ id: '1', currency: 'usd' });

      await service.create('buyer-1', 'tenant-1', dto);

      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currency: 'usd' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all transactions for tenant', async () => {
      prisma.transaction.findMany.mockResolvedValue([{ id: '1' }]);

      const result = await service.findAll('tenant-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return transaction if found', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: '1', tenantId: 't1' });

      const result = await service.findOne('1', 't1');

      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 't1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('transition', () => {
    it('should throw BadRequestException for invalid transition', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: '1',
        status: 'CREATED',
        tenantId: 't1',
      });

      await expect(
        service.transition('1', 't1', { toStatus: 'RELEASED' as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should transition from CREATED to HELD', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: '1',
        status: 'CREATED',
        tenantId: 't1',
      });
      const updated = { id: '1', status: 'HELD' };
      prisma.$transaction.mockResolvedValue([updated, {}]);

      const result = await service.transition('1', 't1', { toStatus: 'HELD' as any });

      expect(result.status).toBe('HELD');
    });

    it('should include reason in state history', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: '1',
        status: 'HELD',
        tenantId: 't1',
      });
      prisma.$transaction.mockResolvedValue([{ id: '1', status: 'RELEASED' }, {}]);

      await service.transition('1', 't1', { toStatus: 'RELEASED' as any, reason: 'Delivery confirmed' }, 'user-1');

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('findByBuyer', () => {
    it('should return transactions for buyer', async () => {
      prisma.transaction.findMany.mockResolvedValue([{ id: '1' }]);

      const result = await service.findByBuyer('buyer-1', 't1');

      expect(result).toHaveLength(1);
    });
  });

  describe('findByProvider', () => {
    it('should return transactions for provider', async () => {
      prisma.transaction.findMany.mockResolvedValue([{ id: '1' }]);

      const result = await service.findByProvider('provider-1', 't1');

      expect(result).toHaveLength(1);
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      prisma.transaction.count.mockResolvedValue(10);
      prisma.transaction.groupBy.mockResolvedValue([
        { status: 'HELD', _count: 5 },
      ]);
      prisma.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 50000, platformFee: 5000 },
      });

      const result = await service.getAnalytics('t1');

      expect(result.totalTransactions).toBe(10);
      expect(result.totalVolume).toBe(50000);
      expect(result.totalFees).toBe(5000);
    });

    it('should handle zero transactions', async () => {
      prisma.transaction.count.mockResolvedValue(0);
      prisma.transaction.groupBy.mockResolvedValue([]);
      prisma.transaction.aggregate.mockResolvedValue({
        _sum: { amount: null, platformFee: null },
      });

      const result = await service.getAnalytics('t1');

      expect(result.totalTransactions).toBe(0);
      expect(result.totalVolume).toBe(0);
      expect(result.totalFees).toBe(0);
    });
  });
});
