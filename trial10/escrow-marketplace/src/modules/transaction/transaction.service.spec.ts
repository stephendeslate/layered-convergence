import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('TransactionService', () => {
  let service: TransactionService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      transaction: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
      },
      transactionStateHistory: {
        create: vi.fn(),
      },
      $transaction: vi.fn((fn: Function) => fn(prisma)),
    };
    service = new TransactionService(prisma as unknown as PrismaService);
  });

  it('should create a transaction with platform fee', async () => {
    const dto = { buyerId: 'buyer1', providerId: 'provider1', amount: 10000 };
    prisma.transaction.create.mockResolvedValue({
      id: 'tx1',
      ...dto,
      platformFee: 500,
      status: 'pending',
    });

    const result = await service.create(dto);

    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 10000,
          platformFee: 500,
          status: 'pending',
        }),
      }),
    );
    expect(result.platformFee).toBe(500);
  });

  it('should transition from pending to held', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'pending',
    });
    prisma.transaction.update.mockResolvedValue({
      id: 'tx1',
      status: 'held',
      stateHistory: [],
    });

    const result = await service.hold('tx1');
    expect(result.status).toBe('held');
  });

  it('should transition from held to released', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'held',
    });
    prisma.transaction.update.mockResolvedValue({
      id: 'tx1',
      status: 'released',
      stateHistory: [],
    });

    const result = await service.release('tx1');
    expect(result.status).toBe('released');
  });

  it('should transition from held to disputed', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'held',
    });
    prisma.transaction.update.mockResolvedValue({
      id: 'tx1',
      status: 'disputed',
      stateHistory: [],
    });

    const result = await service.transition('tx1', 'disputed', 'test dispute');
    expect(result.status).toBe('disputed');
  });

  it('should reject invalid transition from pending to released', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'pending',
    });

    await expect(service.release('tx1')).rejects.toThrow(BadRequestException);
  });

  it('should reject invalid transition from released to held', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'released',
    });

    await expect(service.hold('tx1')).rejects.toThrow(BadRequestException);
  });

  it('should transition from disputed to refunded', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'disputed',
    });
    prisma.transaction.update.mockResolvedValue({
      id: 'tx1',
      status: 'refunded',
      stateHistory: [],
    });

    const result = await service.refund('tx1');
    expect(result.status).toBe('refunded');
  });

  it('should transition from disputed to released', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'disputed',
    });
    prisma.transaction.update.mockResolvedValue({
      id: 'tx1',
      status: 'released',
      stateHistory: [],
    });

    const result = await service.release('tx1');
    expect(result.status).toBe('released');
  });

  it('should transition from held to expired', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'held',
    });
    prisma.transaction.update.mockResolvedValue({
      id: 'tx1',
      status: 'expired',
      stateHistory: [],
    });

    const result = await service.expire('tx1');
    expect(result.status).toBe('expired');
  });

  it('should reject transition from refunded (terminal state)', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'refunded',
    });

    await expect(service.hold('tx1')).rejects.toThrow(BadRequestException);
  });

  it('should log state history on transition', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'pending',
    });
    prisma.transaction.update.mockResolvedValue({
      id: 'tx1',
      status: 'held',
      stateHistory: [],
    });

    await service.hold('tx1');

    expect(prisma.transactionStateHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        transactionId: 'tx1',
        fromState: 'pending',
        toState: 'held',
      }),
    });
  });

  it('should compute analytics correctly', async () => {
    prisma.transaction.findMany.mockResolvedValue([
      { amount: 10000, platformFee: 500, status: 'released' },
      { amount: 5000, platformFee: 250, status: 'disputed' },
      { amount: 3000, platformFee: 150, status: 'held' },
    ]);

    const analytics = await service.getAnalytics();
    expect(analytics.totalTransactions).toBe(3);
    expect(analytics.totalVolume).toBe(18000);
    expect(analytics.totalFees).toBe(900);
    expect(analytics.disputeCount).toBe(1);
    expect(analytics.disputeRate).toBeCloseTo(1 / 3);
  });
});
