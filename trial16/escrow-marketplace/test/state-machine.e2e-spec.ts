import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionService } from '../src/transaction/transaction.service';

describe('State Machine Lifecycle (Integration)', () => {
  let app: INestApplication;
  let transactionService: TransactionService;

  const mockPrisma = {
    transaction: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    dispute: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    payout: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    stripeAccount: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };

  const buyer = { sub: 'buyer-1', email: 'buyer@test.com', role: 'BUYER' };
  const seller = { sub: 'seller-1', email: 'seller@test.com', role: 'SELLER' };
  const admin = { sub: 'admin-1', email: 'admin@test.com', role: 'ADMIN' };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-testing';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    transactionService = moduleFixture.get<TransactionService>(TransactionService);
    vi.clearAllMocks();
  });

  it('should follow PENDING → FUNDED → SHIPPED → DELIVERED → RELEASED lifecycle', async () => {
    const baseTxn = {
      id: 'txn-1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      amount: 100,
      buyer: {},
      seller: {},
      disputes: [],
      payouts: [],
    };

    // PENDING → FUNDED (buyer)
    mockPrisma.transaction.findUnique.mockResolvedValueOnce({ ...baseTxn, status: 'PENDING' });
    mockPrisma.transaction.update.mockResolvedValueOnce({ ...baseTxn, status: 'FUNDED' });
    let result = await transactionService.transition('txn-1', 'FUNDED' as never, buyer);
    expect(result.status).toBe('FUNDED');

    // FUNDED → SHIPPED (seller)
    mockPrisma.transaction.findUnique.mockResolvedValueOnce({ ...baseTxn, status: 'FUNDED' });
    mockPrisma.transaction.update.mockResolvedValueOnce({ ...baseTxn, status: 'SHIPPED' });
    result = await transactionService.transition('txn-1', 'SHIPPED' as never, seller);
    expect(result.status).toBe('SHIPPED');

    // SHIPPED → DELIVERED (buyer)
    mockPrisma.transaction.findUnique.mockResolvedValueOnce({ ...baseTxn, status: 'SHIPPED' });
    mockPrisma.transaction.update.mockResolvedValueOnce({ ...baseTxn, status: 'DELIVERED' });
    result = await transactionService.transition('txn-1', 'DELIVERED' as never, buyer);
    expect(result.status).toBe('DELIVERED');

    // DELIVERED → RELEASED (buyer)
    mockPrisma.transaction.findUnique.mockResolvedValueOnce({ ...baseTxn, status: 'DELIVERED' });
    mockPrisma.transaction.update.mockResolvedValueOnce({ ...baseTxn, status: 'RELEASED' });
    result = await transactionService.transition('txn-1', 'RELEASED' as never, buyer);
    expect(result.status).toBe('RELEASED');
  });

  it('should follow dispute resolution lifecycle', async () => {
    const baseTxn = {
      id: 'txn-1',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      amount: 100,
      buyer: {},
      seller: {},
      disputes: [],
      payouts: [],
    };

    // FUNDED → DISPUTED (buyer)
    mockPrisma.transaction.findUnique.mockResolvedValueOnce({ ...baseTxn, status: 'FUNDED' });
    mockPrisma.transaction.update.mockResolvedValueOnce({ ...baseTxn, status: 'DISPUTED' });
    let result = await transactionService.transition('txn-1', 'DISPUTED' as never, buyer);
    expect(result.status).toBe('DISPUTED');

    // DISPUTED → RESOLVED (admin)
    mockPrisma.transaction.findUnique.mockResolvedValueOnce({ ...baseTxn, status: 'DISPUTED' });
    mockPrisma.transaction.update.mockResolvedValueOnce({ ...baseTxn, status: 'RESOLVED' });
    result = await transactionService.transition('txn-1', 'RESOLVED' as never, admin);
    expect(result.status).toBe('RESOLVED');

    // RESOLVED → REFUNDED (admin)
    mockPrisma.transaction.findUnique.mockResolvedValueOnce({ ...baseTxn, status: 'RESOLVED' });
    mockPrisma.transaction.update.mockResolvedValueOnce({ ...baseTxn, status: 'REFUNDED' });
    result = await transactionService.transition('txn-1', 'REFUNDED' as never, admin);
    expect(result.status).toBe('REFUNDED');
  });
});
