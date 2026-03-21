import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TransactionService } from '../src/transaction/transaction.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tenant Isolation (Integration)', () => {
  let service: TransactionService;

  const mockPrisma = {
    transaction: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
  };

  const buyerA = { sub: 'buyer-a', email: 'a@test.com', role: 'BUYER' };
  const buyerB = { sub: 'buyer-b', email: 'b@test.com', role: 'BUYER' };
  const adminUser = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    vi.clearAllMocks();
  });

  it('should prevent buyer B from funding buyer A transaction', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: 'PENDING',
      buyerId: 'buyer-a',
      sellerId: 'seller-1',
      buyer: {},
      seller: {},
      disputes: [],
      payouts: [],
    });

    await expect(
      service.transition('txn-1', 'FUNDED' as never, buyerB),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should scope findAll to user transactions only', async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    await service.findAll(buyerA);

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ buyerId: 'buyer-a' }, { sellerId: 'buyer-a' }],
        }),
      }),
    );
  });

  it('should allow admin to see all transactions', async () => {
    mockPrisma.transaction.findMany.mockResolvedValue([]);

    await service.findAll(adminUser);

    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      }),
    );
  });

  it('should prevent non-participant from cancelling', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: 'PENDING',
      buyerId: 'buyer-a',
      sellerId: 'seller-1',
      buyer: {},
      seller: {},
      disputes: [],
      payouts: [],
    });

    await expect(
      service.transition('txn-1', 'CANCELLED' as never, buyerB),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow participant to access their transaction', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: 'PENDING',
      buyerId: 'buyer-a',
      sellerId: 'seller-1',
      buyer: {},
      seller: {},
      disputes: [],
      payouts: [],
    });

    const result = await service.findOneWithAccess('txn-1', buyerA);
    expect(result.id).toBe('txn-1');
  });

  it('should reject non-participant from accessing transaction', async () => {
    mockPrisma.transaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      status: 'PENDING',
      buyerId: 'buyer-a',
      sellerId: 'seller-1',
      buyer: {},
      seller: {},
      disputes: [],
      payouts: [],
    });

    await expect(
      service.findOneWithAccess('txn-1', buyerB),
    ).rejects.toThrow(ForbiddenException);
  });
});
