import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TransactionStatus, PayoutStatus } from '@prisma/client';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContextService } from '../tenant-context/tenant-context.service';

describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: {
    transaction: { findFirst: jest.Mock };
    payout: { create: jest.Mock; findMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
  };
  let tenantContext: { setCurrentUser: jest.Mock };

  beforeEach(async () => {
    prisma = {
      transaction: { findFirst: jest.fn() },
      payout: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    };

    tenantContext = { setCurrentUser: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutService,
        { provide: PrismaService, useValue: prisma },
        { provide: TenantContextService, useValue: tenantContext },
      ],
    }).compile();

    service = module.get<PayoutService>(PayoutService);
  });

  describe('create', () => {
    it('should create a payout for completed transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.COMPLETED,
        sellerId: 'seller-1',
      });
      prisma.payout.create.mockResolvedValue({
        id: 'pay-1',
        amount: 100,
        status: PayoutStatus.PENDING,
      });

      const result = await service.create('seller-1', {
        amount: 100,
        transactionId: 'tx-1',
      });

      expect(result.status).toBe(PayoutStatus.PENDING);
    });

    it('should reject payout for non-completed transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: TransactionStatus.FUNDED,
        sellerId: 'seller-1',
      });

      await expect(
        service.create('seller-1', { amount: 100, transactionId: 'tx-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for missing transaction', async () => {
      prisma.transaction.findFirst.mockResolvedValue(null);

      await expect(
        service.create('seller-1', { amount: 100, transactionId: 'bad-tx' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should allow PENDING -> PROCESSING transition', async () => {
      prisma.payout.findFirst.mockResolvedValue({
        id: 'pay-1',
        status: PayoutStatus.PENDING,
      });
      prisma.payout.update.mockResolvedValue({
        id: 'pay-1',
        status: PayoutStatus.PROCESSING,
      });

      const result = await service.updateStatus('seller-1', 'pay-1', PayoutStatus.PROCESSING);

      expect(result.status).toBe(PayoutStatus.PROCESSING);
    });

    it('should reject invalid payout transition', async () => {
      prisma.payout.findFirst.mockResolvedValue({
        id: 'pay-1',
        status: PayoutStatus.PENDING,
      });

      await expect(
        service.updateStatus('seller-1', 'pay-1', PayoutStatus.COMPLETED),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing payout', async () => {
      prisma.payout.findFirst.mockResolvedValue(null);

      await expect(service.findOne('seller-1', 'bad-pay')).rejects.toThrow(NotFoundException);
    });
  });
});
