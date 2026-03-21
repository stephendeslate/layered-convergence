import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from './dto/transition-transaction.dto';

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      transaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      transactionStateHistory: {
        create: vi.fn(),
      },
      $transaction: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(TransactionService);
  });

  describe('create', () => {
    it('should create a transaction with PENDING status', async () => {
      prisma.transaction.create.mockResolvedValue({
        id: '1',
        amount: 100,
        status: 'PENDING',
        buyerId: 'buyer-1',
        providerId: 'provider-1',
      });

      const result = await service.create('buyer-1', {
        amount: 100,
        providerId: 'provider-1',
      });

      expect(result.status).toBe('PENDING');
      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PENDING' }),
        }),
      );
    });

    it('should include buyer and provider relations', async () => {
      prisma.transaction.create.mockResolvedValue({ id: '1' });

      await service.create('buyer-1', { amount: 50, providerId: 'prov-1' });

      expect(prisma.transaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { buyer: true, provider: true },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      prisma.transaction.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }]);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'PENDING' });

      const result = await service.findOne('1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should query with OR for buyerId and providerId', async () => {
      prisma.transaction.findMany.mockResolvedValue([]);

      await service.findByUser('user-1');

      expect(prisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ buyerId: 'user-1' }, { providerId: 'user-1' }],
          },
        }),
      );
    });
  });

  describe('transition', () => {
    it('should allow PENDING -> FUNDED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'PENDING' });
      prisma.$transaction.mockResolvedValue([{ id: '1', status: 'FUNDED' }, {}]);

      const result = await service.transition('1', TransactionStatus.FUNDED);
      expect(result.status).toBe('FUNDED');
    });

    it('should allow PENDING -> EXPIRED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'PENDING' });
      prisma.$transaction.mockResolvedValue([{ id: '1', status: 'EXPIRED' }, {}]);

      const result = await service.transition('1', TransactionStatus.EXPIRED);
      expect(result.status).toBe('EXPIRED');
    });

    it('should allow FUNDED -> DELIVERED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'FUNDED' });
      prisma.$transaction.mockResolvedValue([{ id: '1', status: 'DELIVERED' }, {}]);

      const result = await service.transition('1', TransactionStatus.DELIVERED);
      expect(result.status).toBe('DELIVERED');
    });

    it('should allow FUNDED -> DISPUTED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'FUNDED' });
      prisma.$transaction.mockResolvedValue([{ id: '1', status: 'DISPUTED' }, {}]);

      const result = await service.transition('1', TransactionStatus.DISPUTED);
      expect(result.status).toBe('DISPUTED');
    });

    it('should allow DELIVERED -> RELEASED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'DELIVERED' });
      prisma.$transaction.mockResolvedValue([{ id: '1', status: 'RELEASED' }, {}]);

      const result = await service.transition('1', TransactionStatus.RELEASED);
      expect(result.status).toBe('RELEASED');
    });

    it('should allow DISPUTED -> REFUNDED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'DISPUTED' });
      prisma.$transaction.mockResolvedValue([{ id: '1', status: 'REFUNDED' }, {}]);

      const result = await service.transition('1', TransactionStatus.REFUNDED);
      expect(result.status).toBe('REFUNDED');
    });

    it('should allow DISPUTED -> RELEASED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'DISPUTED' });
      prisma.$transaction.mockResolvedValue([{ id: '1', status: 'RELEASED' }, {}]);

      const result = await service.transition('1', TransactionStatus.RELEASED);
      expect(result.status).toBe('RELEASED');
    });

    it('should reject PENDING -> RELEASED', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'PENDING' });

      await expect(
        service.transition('1', TransactionStatus.RELEASED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject RELEASED -> anything', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'RELEASED' });

      await expect(
        service.transition('1', TransactionStatus.FUNDED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject REFUNDED -> anything', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'REFUNDED' });

      await expect(
        service.transition('1', TransactionStatus.PENDING),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject EXPIRED -> anything', async () => {
      prisma.transaction.findUnique.mockResolvedValue({ id: '1', status: 'EXPIRED' });

      await expect(
        service.transition('1', TransactionStatus.FUNDED),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      prisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.transition('nope', TransactionStatus.FUNDED),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getValidTransitions', () => {
    it('should return the state machine map', () => {
      const transitions = service.getValidTransitions();
      expect(transitions.PENDING).toEqual(['FUNDED', 'EXPIRED']);
      expect(transitions.RELEASED).toEqual([]);
      expect(transitions.DISPUTED).toEqual(['REFUNDED', 'RELEASED']);
    });
  });
});
