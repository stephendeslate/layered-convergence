import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeService } from '../src/modules/dispute/dispute.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('DisputeService - State Machine', () => {
  let service: DisputeService;
  let prisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;

  beforeEach(() => {
    prisma = {
      transaction: {
        findUniqueOrThrow: vi.fn(),
        update: vi.fn().mockResolvedValue({}),
      },
      dispute: {
        create: vi.fn().mockResolvedValue({ id: 'd1', status: 'open' }),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: 'd1', status: 'resolved_buyer' }),
        findMany: vi.fn().mockResolvedValue([]),
      },
      transactionStateHistory: {
        create: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn().mockImplementation((fn: (tx: unknown) => unknown) =>
        fn({
          transaction: { update: vi.fn().mockResolvedValue({}) },
          dispute: {
            create: vi.fn().mockResolvedValue({ id: 'd1', status: 'open' }),
            update: vi.fn().mockResolvedValue({ id: 'd1', status: 'resolved_buyer' }),
          },
          transactionStateHistory: { create: vi.fn().mockResolvedValue({}) },
        }),
      ),
    };
    service = new DisputeService(prisma as unknown as PrismaService);
  });

  it('creates dispute only for held transactions', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'held' });
    await expect(
      service.create('user1', { transactionId: 'tx1', reason: 'Not delivered' }),
    ).resolves.toBeDefined();
  });

  it('rejects dispute for non-held transactions (throws BadRequestException)', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx1', status: 'pending' });
    await expect(
      service.create('user1', { transactionId: 'tx1', reason: 'Test' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid dispute resolution transition (throws BadRequestException)', async () => {
    prisma.dispute.findUniqueOrThrow.mockResolvedValue({ id: 'd1', status: 'resolved_buyer' });
    await expect(
      service.resolve('d1', { resolution: 'resolved_provider', reason: 'Test' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects adding evidence to resolved disputes (throws BadRequestException)', async () => {
    prisma.dispute.findUniqueOrThrow.mockResolvedValue({ id: 'd1', status: 'resolved_buyer' });
    await expect(service.addEvidence('d1', [])).rejects.toThrow(BadRequestException);
  });
});
