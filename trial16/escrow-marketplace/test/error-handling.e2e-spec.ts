import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionService } from '../src/transaction/transaction.service';
import { DisputeService } from '../src/dispute/dispute.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Error Handling (Integration)', () => {
  let transactionService: TransactionService;
  let disputeService: DisputeService;

  const mockPrisma = {
    transaction: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    dispute: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
  };

  const buyer = { sub: 'buyer-1', email: 'buyer@test.com', role: 'BUYER' };
  const seller = { sub: 'seller-1', email: 'seller@test.com', role: 'SELLER' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        DisputeService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    transactionService = module.get<TransactionService>(TransactionService);
    disputeService = module.get<DisputeService>(DisputeService);
    vi.clearAllMocks();
  });

  it('should throw NotFoundException for missing transaction', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue(null);

    await expect(transactionService.findOne('non-existent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException for invalid state transition', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: 'CANCELLED',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      buyer: {},
      seller: {},
      disputes: [],
      payouts: [],
    });

    await expect(
      transactionService.transition('txn-1', 'FUNDED' as never, buyer),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw ForbiddenException when seller tries to create transaction', async () => {
    await expect(
      transactionService.create(
        { title: 'Test', amount: 100, sellerId: 'other' },
        seller,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException when disputing non-funded transaction', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: 'PENDING',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      buyer: {},
      seller: {},
      disputes: [],
      payouts: [],
    });

    await expect(
      disputeService.create(
        { transactionId: 'txn-1', reason: 'Something went wrong with the order' },
        buyer,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException for missing dispute', async () => {
    mockPrisma.dispute.findUnique.mockResolvedValue(null);

    await expect(disputeService.findOne('non-existent')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException for non-admin resolving dispute', async () => {
    await expect(
      disputeService.resolve('dispute-1', { resolution: 'RELEASE' as never }, buyer),
    ).rejects.toThrow(ForbiddenException);
  });
});
