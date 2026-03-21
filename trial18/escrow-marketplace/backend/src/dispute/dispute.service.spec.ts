import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transaction/transaction.service';

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: {
    dispute: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let transactionService: {
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
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

    transactionService = {
      findById: vi.fn(),
      updateStatus: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: prisma },
        { provide: TransactionService, useValue: transactionService },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  describe('create', () => {
    it('should create a dispute and update transaction status', async () => {
      transactionService.findById.mockResolvedValue({
        id: 'tx-1',
        status: 'FUNDED',
      });
      prisma.dispute.create.mockResolvedValue({
        id: 'dispute-1',
        reason: 'Item not as described',
        transactionId: 'tx-1',
        userId: 'user-1',
      });

      const result = await service.create('user-1', 'BUYER', {
        transactionId: 'tx-1',
        reason: 'Item not as described',
      });

      expect(result.id).toBe('dispute-1');
      expect(transactionService.updateStatus).toHaveBeenCalledWith(
        'tx-1',
        'DISPUTED',
        'user-1',
        'BUYER',
      );
    });
  });

  describe('findById', () => {
    it('should return dispute for authorized user', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        userId: 'user-1',
        transaction: {},
        user: {},
      });

      const result = await service.findById('dispute-1', 'user-1', 'BUYER');
      expect(result.id).toBe('dispute-1');
    });

    it('should throw NotFoundException for non-existent dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);

      await expect(
        service.findById('bad-id', 'user-1', 'BUYER'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        userId: 'user-1',
        transaction: {},
        user: {},
      });

      await expect(
        service.findById('dispute-1', 'other-user', 'BUYER'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('resolve', () => {
    it('should resolve a dispute', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'dispute-1',
        userId: 'user-1',
        transaction: {},
        user: {},
      });
      prisma.dispute.update.mockResolvedValue({
        id: 'dispute-1',
        resolution: 'Refund issued',
      });

      const result = await service.resolve(
        'dispute-1',
        'Refund issued',
        'user-1',
        'ADMIN',
      );
      expect(result.resolution).toBe('Refund issued');
    });
  });
});
