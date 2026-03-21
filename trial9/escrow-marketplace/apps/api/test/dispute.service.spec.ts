import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeService } from '../src/modules/dispute/dispute.service';
import { TransactionService } from '../src/modules/transaction/transaction.service';
import { PrismaService } from '../src/config/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('DisputeService — State Machine', () => {
  let service: DisputeService;
  let prisma: Record<string, Record<string, ReturnType<typeof vi.fn>>>;
  let transactionService: { dispute: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn>; refund: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    prisma = {
      transaction: {
        findUniqueOrThrow: vi.fn(),
      },
      dispute: {
        create: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    };
    transactionService = {
      dispute: vi.fn(),
      release: vi.fn(),
      refund: vi.fn(),
    };
    service = new DisputeService(
      prisma as unknown as PrismaService,
      transactionService as unknown as TransactionService,
    );
  });

  it('should create dispute only for held transactions', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'held' });
    prisma.dispute.create.mockResolvedValue({ id: 'disp-1', status: 'open' });
    transactionService.dispute.mockResolvedValue({ status: 'disputed' });

    const result = await service.create('user-1', {
      transactionId: 'tx-1',
      reason: 'Service not delivered',
    });

    expect(result.status).toBe('open');
    expect(transactionService.dispute).toHaveBeenCalledWith('tx-1', 'Service not delivered');
  });

  it('should throw BadRequestException when disputing a released transaction', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({ id: 'tx-1', status: 'released' });

    await expect(
      service.create('user-1', { transactionId: 'tx-1', reason: 'Too late' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should resolve dispute in buyer favor → refund transaction', async () => {
    prisma.dispute.findUniqueOrThrow.mockResolvedValue({ id: 'disp-1', status: 'open', transactionId: 'tx-1' });
    prisma.dispute.update.mockResolvedValue({ id: 'disp-1', status: 'resolved_buyer' });
    transactionService.refund.mockResolvedValue({ status: 'refunded' });

    await service.resolve('disp-1', { resolution: 'resolved_buyer' });

    expect(transactionService.refund).toHaveBeenCalledWith('tx-1', expect.stringContaining('buyer'));
  });
});
