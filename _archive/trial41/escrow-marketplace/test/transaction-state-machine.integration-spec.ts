import { Pool } from 'pg';
import { PrismaClient, TransactionStatus } from '@prisma/client';
import {
  createTestPool,
  createTestPrisma,
  cleanDatabase,
  createTestUser,
} from './helpers';

describe('Transaction State Machine (Integration)', () => {
  let pool: Pool;
  let prisma: PrismaClient;

  beforeAll(async () => {
    pool = createTestPool();
    prisma = createTestPrisma(pool);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  beforeEach(async () => {
    await cleanDatabase(pool);
  });

  async function createTransaction(
    buyerId: string,
    providerId: string,
    status: TransactionStatus = TransactionStatus.PENDING,
  ) {
    return prisma.transaction.create({
      data: {
        buyerId,
        providerId,
        amount: 100,
        currency: 'USD',
        status,
        platformFee: 5,
      },
    });
  }

  it('should record status history when transitioning', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider@test.com', role: 'PROVIDER' });
    const txn = await createTransaction(buyer.id, provider.id);

    await prisma.transaction.update({
      where: { id: txn.id },
      data: { status: TransactionStatus.PAYMENT_HELD },
    });

    await prisma.transactionStatusHistory.create({
      data: {
        transactionId: txn.id,
        fromStatus: TransactionStatus.PENDING,
        toStatus: TransactionStatus.PAYMENT_HELD,
        reason: 'Payment received',
      },
    });

    const history = await prisma.transactionStatusHistory.findMany({
      where: { transactionId: txn.id },
    });

    expect(history).toHaveLength(1);
    expect(history[0].fromStatus).toBe(TransactionStatus.PENDING);
    expect(history[0].toStatus).toBe(TransactionStatus.PAYMENT_HELD);
  });

  it('should support full lifecycle: PENDING -> PAYMENT_HELD -> DELIVERED -> RELEASED', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer2@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider2@test.com', role: 'PROVIDER' });
    const txn = await createTransaction(buyer.id, provider.id);

    const statuses: TransactionStatus[] = [
      TransactionStatus.PAYMENT_HELD,
      TransactionStatus.DELIVERED,
      TransactionStatus.RELEASED,
    ];

    let currentStatus: TransactionStatus = TransactionStatus.PENDING;
    for (const nextStatus of statuses) {
      await prisma.transactionStatusHistory.create({
        data: {
          transactionId: txn.id,
          fromStatus: currentStatus,
          toStatus: nextStatus,
          reason: `Transition to ${nextStatus}`,
        },
      });
      await prisma.transaction.update({
        where: { id: txn.id },
        data: { status: nextStatus },
      });
      currentStatus = nextStatus;
    }

    const updated = await prisma.transaction.findUnique({ where: { id: txn.id } });
    expect(updated!.status).toBe(TransactionStatus.RELEASED);

    const history = await prisma.transactionStatusHistory.findMany({
      where: { transactionId: txn.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(history).toHaveLength(3);
  });

  it('should support dispute flow: PAYMENT_HELD -> DISPUTED -> REFUNDED', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer3@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider3@test.com', role: 'PROVIDER' });
    const txn = await createTransaction(buyer.id, provider.id, TransactionStatus.PAYMENT_HELD);

    await prisma.transaction.update({
      where: { id: txn.id },
      data: { status: TransactionStatus.DISPUTED },
    });
    await prisma.transactionStatusHistory.create({
      data: {
        transactionId: txn.id,
        fromStatus: TransactionStatus.PAYMENT_HELD,
        toStatus: TransactionStatus.DISPUTED,
        reason: 'Buyer raised dispute',
        changedBy: buyer.id,
      },
    });

    await prisma.transaction.update({
      where: { id: txn.id },
      data: { status: TransactionStatus.REFUNDED },
    });
    await prisma.transactionStatusHistory.create({
      data: {
        transactionId: txn.id,
        fromStatus: TransactionStatus.DISPUTED,
        toStatus: TransactionStatus.REFUNDED,
        reason: 'Resolved in buyer favor',
      },
    });

    const final = await prisma.transaction.findUnique({ where: { id: txn.id } });
    expect(final!.status).toBe(TransactionStatus.REFUNDED);

    const history = await prisma.transactionStatusHistory.findMany({
      where: { transactionId: txn.id },
    });
    expect(history).toHaveLength(2);
    expect(history[0].changedBy).toBe(buyer.id);
  });

  it('should create milestones for a transaction', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer4@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider4@test.com', role: 'PROVIDER' });
    const txn = await createTransaction(buyer.id, provider.id);

    await prisma.milestone.create({
      data: {
        transactionId: txn.id,
        title: 'Phase 1',
        amount: 50,
      },
    });
    await prisma.milestone.create({
      data: {
        transactionId: txn.id,
        title: 'Phase 2',
        amount: 50,
      },
    });

    const milestones = await prisma.milestone.findMany({
      where: { transactionId: txn.id },
    });
    expect(milestones).toHaveLength(2);
  });
});
