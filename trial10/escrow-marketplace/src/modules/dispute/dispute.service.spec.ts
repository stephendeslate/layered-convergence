import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisputeService } from './dispute.service';
import { TransactionService } from '../transaction/transaction.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('DisputeService', () => {
  let service: DisputeService;
  let prisma: any;
  let transactionService: any;

  beforeEach(() => {
    prisma = {
      transaction: {
        findUniqueOrThrow: vi.fn(),
      },
      dispute: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        update: vi.fn(),
      },
    };
    transactionService = {
      transition: vi.fn(),
      refund: vi.fn(),
      release: vi.fn(),
    };
    service = new DisputeService(
      prisma as unknown as PrismaService,
      transactionService as unknown as TransactionService,
    );
  });

  it('should create a dispute for a held transaction', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'held',
    });
    prisma.dispute.create.mockResolvedValue({
      id: 'disp1',
      transactionId: 'tx1',
      status: 'open',
    });

    const result = await service.create('user1', {
      transactionId: 'tx1',
      reason: 'Service not as described',
    });

    expect(result.status).toBe('open');
    expect(transactionService.transition).toHaveBeenCalledWith(
      'tx1',
      'disputed',
      'Service not as described',
    );
  });

  it('should reject dispute for non-held transaction', async () => {
    prisma.transaction.findUniqueOrThrow.mockResolvedValue({
      id: 'tx1',
      status: 'released',
    });

    await expect(
      service.create('user1', { transactionId: 'tx1', reason: 'Not as described' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should resolve dispute in buyer favor with refund', async () => {
    prisma.dispute.findUniqueOrThrow.mockResolvedValue({
      id: 'disp1',
      transactionId: 'tx1',
      status: 'open',
    });
    prisma.dispute.update.mockResolvedValue({
      id: 'disp1',
      status: 'resolved_buyer',
    });

    const result = await service.resolve('disp1', {
      resolution: 'Buyer evidence confirmed',
      outcome: 'buyer',
    });

    expect(transactionService.refund).toHaveBeenCalled();
    expect(result.status).toBe('resolved_buyer');
  });
});
