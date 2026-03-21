import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionService } from '../transaction/transaction.service';

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: any;
  let transactionService: any;

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
      transition: vi.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: PrismaService, useValue: prisma },
        { provide: TransactionService, useValue: transactionService },
      ],
    }).compile();

    service = module.get(DisputeService);
  });

  describe('create', () => {
    it('should transition transaction to DISPUTED and create dispute', async () => {
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.create.mockResolvedValue({
        id: 'd1',
        transactionId: 't1',
        reason: 'Item not as described',
      });

      const result = await service.create('u1', {
        transactionId: 't1',
        reason: 'Item not as described',
      });

      expect(transactionService.transition).toHaveBeenCalledWith('t1', 'DISPUTED');
      expect(result.id).toBe('d1');
    });

    it('should pass userId when creating dispute', async () => {
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.create.mockResolvedValue({ id: 'd1' });

      await service.create('user-99', {
        transactionId: 't1',
        reason: 'Bad quality item',
      });

      expect(prisma.dispute.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userId: 'user-99' }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all disputes', async () => {
      prisma.dispute.findMany.mockResolvedValue([{ id: 'd1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return dispute by id', async () => {
      prisma.dispute.findUnique.mockResolvedValue({ id: 'd1' });
      const result = await service.findOne('d1');
      expect(result.id).toBe('d1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.dispute.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('resolve', () => {
    it('should resolve with REFUNDED', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'd1',
        transactionId: 't1',
      });
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.update.mockResolvedValue({ id: 'd1', resolved: true });

      const result = await service.resolve('d1', 'REFUNDED' as any);
      expect(transactionService.transition).toHaveBeenCalledWith('t1', 'REFUNDED');
      expect(result.resolved).toBe(true);
    });

    it('should resolve with RELEASED', async () => {
      prisma.dispute.findUnique.mockResolvedValue({
        id: 'd1',
        transactionId: 't1',
      });
      transactionService.transition.mockResolvedValue({});
      prisma.dispute.update.mockResolvedValue({ id: 'd1', resolved: true });

      await service.resolve('d1', 'RELEASED' as any);
      expect(transactionService.transition).toHaveBeenCalledWith('t1', 'RELEASED');
    });
  });
});
