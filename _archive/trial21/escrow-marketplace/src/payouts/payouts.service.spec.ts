import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayoutsService', () => {
  let service: PayoutsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      transaction: {
        findFirst: vi.fn(),
      },
      payout: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PayoutsService>(PayoutsService);
  });

  describe('create', () => {
    it('should create payout for RELEASED transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 't1',
        status: 'RELEASED',
        providerId: 'p1',
      });
      prisma.payout.findUnique.mockResolvedValue(null);
      prisma.payout.create.mockResolvedValue({ id: 'pay1', status: 'PENDING' });

      const result = await service.create('user-1', 'tenant-1', {
        transactionId: 't1',
        amount: 900,
      });

      expect(result.status).toBe('PENDING');
    });

    it('should throw NotFoundException if transaction not found', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.create('user-1', 'tenant-1', {
          transactionId: 't1',
          amount: 900,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if transaction not RELEASED', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 't1',
        status: 'HELD',
      });

      await expect(
        service.create('user-1', 'tenant-1', {
          transactionId: 't1',
          amount: 900,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if payout already exists', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 't1',
        status: 'RELEASED',
        providerId: 'p1',
      });
      prisma.payout.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create('user-1', 'tenant-1', {
          transactionId: 't1',
          amount: 900,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return payouts for tenant', async () => {
      prisma.payout.findMany.mockResolvedValue([{ id: 'pay1' }]);

      const result = await service.findAll('tenant-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return payout if found', async () => {
      prisma.payout.findFirst.mockResolvedValue({ id: 'pay1' });

      const result = await service.findOne('pay1', 'tenant-1');

      expect(result.id).toBe('pay1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.payout.findFirst.mockResolvedValue(null);

      await expect(service.findOne('pay1', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return payouts for user', async () => {
      prisma.payout.findMany.mockResolvedValue([{ id: 'pay1' }]);

      const result = await service.findByUser('user-1', 'tenant-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('updateStatus', () => {
    it('should update payout status', async () => {
      prisma.payout.findFirst.mockResolvedValue({ id: 'pay1' });
      prisma.payout.update.mockResolvedValue({ id: 'pay1', status: 'COMPLETED' });

      const result = await service.updateStatus('pay1', 'tenant-1', 'COMPLETED' as any);

      expect(result.status).toBe('COMPLETED');
    });

    it('should update with stripeTransferId', async () => {
      prisma.payout.findFirst.mockResolvedValue({ id: 'pay1' });
      prisma.payout.update.mockResolvedValue({
        id: 'pay1',
        status: 'PROCESSING',
        stripeTransferId: 'tr_123',
      });

      const result = await service.updateStatus('pay1', 'tenant-1', 'PROCESSING' as any, 'tr_123');

      expect(result.stripeTransferId).toBe('tr_123');
    });
  });
});
