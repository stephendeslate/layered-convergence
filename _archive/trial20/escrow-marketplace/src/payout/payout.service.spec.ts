import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PayoutService } from './payout.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayoutService', () => {
  let service: PayoutService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      payout: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        PayoutService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PayoutService);
  });

  describe('create', () => {
    it('should create a payout', async () => {
      prisma.payout.create.mockResolvedValue({
        id: 'p1',
        amount: 500,
        transactionId: 't1',
        userId: 'u1',
      });

      const result = await service.create({
        transactionId: 't1',
        userId: 'u1',
        amount: 500,
      });

      expect(result.id).toBe('p1');
      expect(result.amount).toBe(500);
    });

    it('should include transaction and user relations', async () => {
      prisma.payout.create.mockResolvedValue({ id: 'p1' });

      await service.create({ transactionId: 't1', userId: 'u1', amount: 100 });

      expect(prisma.payout.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { transaction: true, user: true },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all payouts', async () => {
      prisma.payout.findMany.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return payout by id', async () => {
      prisma.payout.findUnique.mockResolvedValue({ id: 'p1' });
      const result = await service.findOne('p1');
      expect(result.id).toBe('p1');
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.payout.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUser', () => {
    it('should filter by userId', async () => {
      prisma.payout.findMany.mockResolvedValue([]);
      await service.findByUser('u1');
      expect(prisma.payout.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
        }),
      );
    });
  });
});
