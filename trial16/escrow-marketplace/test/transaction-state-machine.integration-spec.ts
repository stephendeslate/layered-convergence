import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionService, VALID_TRANSITIONS } from '../src/transaction/transaction.service';
import { TransactionModule } from '../src/transaction/transaction.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

describe('Transaction State Machine Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let transactionService: TransactionService;

  let buyerId: string;
  let sellerId: string;
  let adminId: string;

  const buyerUser = { sub: '', email: 'integ-buyer@test.com', role: 'BUYER' };
  const sellerUser = { sub: '', email: 'integ-seller@test.com', role: 'SELLER' };
  const adminUser = { sub: '', email: 'integ-admin@test.com', role: 'ADMIN' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        TransactionModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    transactionService = moduleFixture.get<TransactionService>(TransactionService);

    // Create test users
    const buyer = await prisma.user.create({
      data: {
        email: 'integ-buyer@test.com',
        name: 'Integration Buyer',
        passwordHash: 'hashed',
        role: 'BUYER',
      },
    });
    const seller = await prisma.user.create({
      data: {
        email: 'integ-seller@test.com',
        name: 'Integration Seller',
        passwordHash: 'hashed',
        role: 'SELLER',
      },
    });
    const admin = await prisma.user.create({
      data: {
        email: 'integ-admin@test.com',
        name: 'Integration Admin',
        passwordHash: 'hashed',
        role: 'ADMIN',
      },
    });

    buyerId = buyer.id;
    sellerId = seller.id;
    adminId = admin.id;

    buyerUser.sub = buyerId;
    sellerUser.sub = sellerId;
    adminUser.sub = adminId;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.dispute.deleteMany({});
    await prisma.payout.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'integ-buyer@test.com',
            'integ-seller@test.com',
            'integ-admin@test.com',
          ],
        },
      },
    });
    await app.close();
  });

  async function createTestTransaction(overrides = {}) {
    return prisma.transaction.create({
      data: {
        title: 'Integration Test Transaction',
        amount: 100,
        platformFee: 2.5,
        buyerId,
        sellerId,
        status: 'PENDING',
        ...overrides,
      },
    });
  }

  it('should complete full lifecycle: PENDING -> FUNDED -> SHIPPED -> DELIVERED -> RELEASED', async () => {
    const txn = await createTestTransaction();

    const funded = await transactionService.transition(txn.id, 'FUNDED' as never, buyerUser);
    expect(funded.status).toBe('FUNDED');

    const shipped = await transactionService.transition(txn.id, 'SHIPPED' as never, sellerUser);
    expect(shipped.status).toBe('SHIPPED');

    const delivered = await transactionService.transition(txn.id, 'DELIVERED' as never, buyerUser);
    expect(delivered.status).toBe('DELIVERED');

    const released = await transactionService.transition(txn.id, 'RELEASED' as never, buyerUser);
    expect(released.status).toBe('RELEASED');
  });

  it('should handle PENDING -> CANCELLED', async () => {
    const txn = await createTestTransaction();

    const cancelled = await transactionService.transition(txn.id, 'CANCELLED' as never, buyerUser);
    expect(cancelled.status).toBe('CANCELLED');
  });

  it('should handle FUNDED -> CANCELLED by seller', async () => {
    const txn = await createTestTransaction({ status: 'FUNDED' });

    const cancelled = await transactionService.transition(txn.id, 'CANCELLED' as never, sellerUser);
    expect(cancelled.status).toBe('CANCELLED');
  });

  it('should handle dispute flow: FUNDED -> DISPUTED -> RESOLVED -> RELEASED', async () => {
    const txn = await createTestTransaction({ status: 'FUNDED' });

    const disputed = await transactionService.transition(txn.id, 'DISPUTED' as never, buyerUser);
    expect(disputed.status).toBe('DISPUTED');

    const resolved = await transactionService.transition(txn.id, 'RESOLVED' as never, adminUser);
    expect(resolved.status).toBe('RESOLVED');

    const released = await transactionService.transition(txn.id, 'RELEASED' as never, adminUser);
    expect(released.status).toBe('RELEASED');
  });

  it('should handle dispute refund flow: FUNDED -> DISPUTED -> RESOLVED -> REFUNDED', async () => {
    const txn = await createTestTransaction({ status: 'FUNDED' });

    await transactionService.transition(txn.id, 'DISPUTED' as never, buyerUser);
    await transactionService.transition(txn.id, 'RESOLVED' as never, adminUser);

    const refunded = await transactionService.transition(txn.id, 'REFUNDED' as never, adminUser);
    expect(refunded.status).toBe('REFUNDED');
  });

  it('should reject invalid transition: PENDING -> RELEASED', async () => {
    const txn = await createTestTransaction();

    await expect(
      transactionService.transition(txn.id, 'RELEASED' as never, buyerUser),
    ).rejects.toThrow('Cannot transition');
  });

  it('should reject invalid transition: RELEASED -> FUNDED', async () => {
    const txn = await createTestTransaction({ status: 'RELEASED' });

    await expect(
      transactionService.transition(txn.id, 'FUNDED' as never, buyerUser),
    ).rejects.toThrow('Cannot transition');
  });

  it('should reject seller funding a transaction (wrong role)', async () => {
    const txn = await createTestTransaction();

    await expect(
      transactionService.transition(txn.id, 'FUNDED' as never, sellerUser),
    ).rejects.toThrow();
  });

  it('should reject buyer shipping a transaction (wrong role)', async () => {
    const txn = await createTestTransaction({ status: 'FUNDED' });

    await expect(
      transactionService.transition(txn.id, 'SHIPPED' as never, buyerUser),
    ).rejects.toThrow();
  });

  it('should reject non-participant accessing transaction', async () => {
    const otherBuyer = await prisma.user.create({
      data: {
        email: 'other-buyer-integ@test.com',
        name: 'Other',
        passwordHash: 'hashed',
        role: 'BUYER',
      },
    });

    const txn = await createTestTransaction();

    await expect(
      transactionService.transition(txn.id, 'FUNDED' as never, {
        sub: otherBuyer.id,
        email: 'other-buyer-integ@test.com',
        role: 'BUYER',
      }),
    ).rejects.toThrow();

    await prisma.user.delete({ where: { id: otherBuyer.id } });
  });

  it('should reject buyer resolving a dispute (admin only)', async () => {
    const txn = await createTestTransaction({ status: 'DISPUTED' });

    await expect(
      transactionService.transition(txn.id, 'RESOLVED' as never, buyerUser),
    ).rejects.toThrow();
  });

  it('should handle SHIPPED -> DISPUTED by buyer', async () => {
    const txn = await createTestTransaction({ status: 'SHIPPED' });

    const disputed = await transactionService.transition(txn.id, 'DISPUTED' as never, buyerUser);
    expect(disputed.status).toBe('DISPUTED');
  });

  it('should handle DELIVERED -> DISPUTED by seller', async () => {
    const txn = await createTestTransaction({ status: 'DELIVERED' });

    const disputed = await transactionService.transition(txn.id, 'DISPUTED' as never, sellerUser);
    expect(disputed.status).toBe('DISPUTED');
  });
});
