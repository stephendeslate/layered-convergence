import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionService } from '../src/modules/transaction/transaction.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('TransactionService - State Machine', () => {
  let service: TransactionService;
  let prisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;

  beforeEach(() => {
    prisma = {
      transaction: {
        create: vi.fn().mockResolvedValue({ id: 'tx1', status: 'pending' }),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: 'tx1', status: 'held' }),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        groupBy: vi.fn().mockResolvedValue([]),
        aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 0 } }),
      },
      transactionStateHistory: {
        create: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn().mockImplementation((fn: (tx: unknown) => unknown) =>
        fn({
          transaction: { update: vi.fn().mockResolvedValue({ id: 'tx1', status: 'held' }) },
          transactionStateHistory: { create: vi.fn().mockResolvedValue({}) },
        }),
      ),
    };
    service = new TransactionService(prisma as unknown as PrismaService);
  });

  it('allows pending -> held transition', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'pending' });
    await expect(service.transition('tx1', 'held')).resolves.toBeDefined();
  });

  it('allows held -> released transition', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'held' });
    await expect(service.transition('tx1', 'released')).resolves.toBeDefined();
  });

  it('allows held -> disputed transition', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'held' });
    await expect(service.transition('tx1', 'disputed')).resolves.toBeDefined();
  });

  it('allows held -> refunded transition', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'held' });
    await expect(service.transition('tx1', 'refunded')).resolves.toBeDefined();
  });

  it('allows held -> expired transition', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'held' });
    await expect(service.transition('tx1', 'expired')).resolves.toBeDefined();
  });

  it('allows disputed -> released transition', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'disputed' });
    await expect(service.transition('tx1', 'released')).resolves.toBeDefined();
  });

  it('allows disputed -> refunded transition', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'disputed' });
    await expect(service.transition('tx1', 'refunded')).resolves.toBeDefined();
  });

  it('rejects invalid transition: pending -> released (throws BadRequestException)', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'pending' });
    await expect(service.transition('tx1', 'released')).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid transition: released -> held (terminal state, throws BadRequestException)', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'released' });
    await expect(service.transition('tx1', 'held')).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid transition: refunded -> released (terminal state, throws BadRequestException)', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'refunded' });
    await expect(service.transition('tx1', 'released')).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid transition: expired -> held (terminal state, throws BadRequestException)', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'expired' });
    await expect(service.transition('tx1', 'held')).rejects.toThrow(BadRequestException);
  });
});
