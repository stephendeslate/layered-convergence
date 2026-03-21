import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '../src/modules/transaction/transaction.service';
import { PrismaService } from '../src/config/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('TransactionService — State Machine', () => {
  let service: TransactionService;
  let prisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;

  beforeEach(() => {
    prisma = {
      transaction: {
        create: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn().mockResolvedValue(0),
        aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 0, platformFee: 0 } }),
      },
      transactionStateHistory: {
        create: vi.fn(),
      },
    };
    service = new TransactionService(prisma as unknown as PrismaService);
  });

  it('should create a transaction in held state', async () => {
    prisma.transaction.create.mockResolvedValue({
      id: 'tx-1', status: 'held', amount: 10000, platformFee: 500,
    });

    const result = await service.create('buyer-1', {
      providerId: 'provider-1',
      amount: 10000,
    });

    expect(result.status).toBe('held');
    expect(prisma.transactionStateHistory.create).toHaveBeenCalled();
  });

  it('should transition held → released', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'held' });
    prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'released' });

    const result = await service.release('tx-1');
    expect(result.status).toBe('released');
  });

  it('should transition held → disputed', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'held' });
    prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'disputed' });

    const result = await service.dispute('tx-1');
    expect(result.status).toBe('disputed');
  });

  it('should transition disputed → refunded', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'disputed' });
    prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'refunded' });

    const result = await service.refund('tx-1');
    expect(result.status).toBe('refunded');
  });

  it('should transition disputed → released (resolved in provider favor)', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'disputed' });
    prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'released' });

    const result = await service.release('tx-1', 'Resolved in provider favor');
    expect(result.status).toBe('released');
  });

  it('should throw BadRequestException for invalid transition held → refunded', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'held' });

    await expect(service.refund('tx-1')).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for invalid transition released → disputed', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'released' });

    await expect(service.dispute('tx-1')).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException for transition from expired state', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'expired' });

    await expect(service.release('tx-1')).rejects.toThrow(BadRequestException);
  });

  it('should calculate 5% platform fee', async () => {
    prisma.transaction.create.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ ...data, id: 'tx-1' }),
    );

    await service.create('buyer-1', { providerId: 'provider-1', amount: 10000 });

    expect(prisma.transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ platformFee: 500 }),
      }),
    );
  });

  it('should record state history on transition', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'held' });
    prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'released' });

    await service.release('tx-1', 'Delivery confirmed');

    expect(prisma.transactionStateHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        transactionId: 'tx-1',
        fromState: 'held',
        toState: 'released',
      }),
    });
  });

  it('should transition held → expired', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'held' });
    prisma.transaction.update.mockResolvedValue({ id: 'tx-1', status: 'expired' });

    const result = await service.expire('tx-1');
    expect(result.status).toBe('expired');
  });
});
