import { Test, TestingModule } from '@nestjs/testing';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TransactionStatus, Role } from '@prisma/client';

// [TRACED:TS-004] Unit tests for PayoutService payout creation and validation
describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: {
    payout: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock; findFirst: jest.Mock };
    transaction: { findUnique: jest.Mock };
    setRlsContext: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      payout: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      transaction: {
        findUnique: jest.fn(),
      },
      setRlsContext: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayoutService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PayoutService>(PayoutService);
  });

  describe('create', () => {
    it('should create a payout for a delivered transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        sellerId: 'seller-1',
        amount: 100.50,
        status: TransactionStatus.DELIVERED,
      });
      prisma.payout.findFirst.mockResolvedValue(null);
      prisma.payout.create.mockResolvedValue({
        id: 'payout-1',
        recipientId: 'seller-1',
        transactionId: 'tx-1',
        amount: 100.50,
        status: 'PENDING',
      });

      const result = await service.create('seller-1', Role.SELLER, {
        transactionId: 'tx-1',
      });

      expect(result.id).toBe('payout-1');
    });

    it('should reject non-sellers from creating payouts', async () => {
      await expect(
        service.create('buyer-1', Role.BUYER, { transactionId: 'tx-1' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject payout for non-delivered transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        sellerId: 'seller-1',
        status: TransactionStatus.PENDING,
      });

      await expect(
        service.create('seller-1', Role.SELLER, { transactionId: 'tx-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate payout', async () => {
      prisma.transaction.findUnique.mockResolvedValue({
        id: 'tx-1',
        sellerId: 'seller-1',
        amount: 100,
        status: TransactionStatus.DELIVERED,
      });
      prisma.payout.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create('seller-1', Role.SELLER, { transactionId: 'tx-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when payout not found', async () => {
      prisma.payout.findUnique.mockResolvedValue(null);
      await expect(service.findOne('user-1', 'payout-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      prisma.payout.findUnique.mockResolvedValue({
        id: 'payout-1',
        recipientId: 'other-user',
      });
      await expect(service.findOne('user-1', 'payout-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
