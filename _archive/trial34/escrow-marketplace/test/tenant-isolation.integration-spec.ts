import { Pool } from 'pg';
import { PrismaClient, TransactionStatus } from '@prisma/client';
import {
  createTestPool,
  createTestPrisma,
  cleanDatabase,
  createTestUser,
} from './helpers';

describe('Tenant Isolation (Integration)', () => {
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

  it('should isolate transactions by buyer', async () => {
    const buyer1 = await createTestUser(prisma, { email: 'buyer1@test.com', role: 'BUYER' });
    const buyer2 = await createTestUser(prisma, { email: 'buyer2@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider@test.com', role: 'PROVIDER' });

    await prisma.transaction.create({
      data: {
        buyerId: buyer1.id,
        providerId: provider.id,
        amount: 100,
        status: TransactionStatus.PENDING,
      },
    });
    await prisma.transaction.create({
      data: {
        buyerId: buyer2.id,
        providerId: provider.id,
        amount: 200,
        status: TransactionStatus.PENDING,
      },
    });

    const buyer1Txns = await prisma.transaction.findMany({
      where: { buyerId: buyer1.id },
    });
    const buyer2Txns = await prisma.transaction.findMany({
      where: { buyerId: buyer2.id },
    });

    expect(buyer1Txns).toHaveLength(1);
    expect(buyer2Txns).toHaveLength(1);
    expect(buyer1Txns[0].buyerId).toBe(buyer1.id);
    expect(buyer2Txns[0].buyerId).toBe(buyer2.id);
  });

  it('should isolate disputes by transaction ownership', async () => {
    const buyer1 = await createTestUser(prisma, { email: 'b1@test.com', role: 'BUYER' });
    const buyer2 = await createTestUser(prisma, { email: 'b2@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'p@test.com', role: 'PROVIDER' });

    const txn1 = await prisma.transaction.create({
      data: {
        buyerId: buyer1.id,
        providerId: provider.id,
        amount: 100,
        status: TransactionStatus.DISPUTED,
      },
    });
    const txn2 = await prisma.transaction.create({
      data: {
        buyerId: buyer2.id,
        providerId: provider.id,
        amount: 200,
        status: TransactionStatus.DISPUTED,
      },
    });

    await prisma.dispute.create({
      data: {
        transactionId: txn1.id,
        raisedById: buyer1.id,
        reason: 'Dispute 1',
      },
    });
    await prisma.dispute.create({
      data: {
        transactionId: txn2.id,
        raisedById: buyer2.id,
        reason: 'Dispute 2',
      },
    });

    const buyer1Disputes = await prisma.dispute.findMany({
      where: { raisedById: buyer1.id },
    });
    const buyer2Disputes = await prisma.dispute.findMany({
      where: { raisedById: buyer2.id },
    });

    expect(buyer1Disputes).toHaveLength(1);
    expect(buyer2Disputes).toHaveLength(1);
    expect(buyer1Disputes[0].reason).toBe('Dispute 1');
    expect(buyer2Disputes[0].reason).toBe('Dispute 2');
  });

  it('should isolate payouts by provider', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer@test.com', role: 'BUYER' });
    const provider1 = await createTestUser(prisma, { email: 'p1@test.com', role: 'PROVIDER' });
    const provider2 = await createTestUser(prisma, { email: 'p2@test.com', role: 'PROVIDER' });

    const txn1 = await prisma.transaction.create({
      data: {
        buyerId: buyer.id,
        providerId: provider1.id,
        amount: 100,
        status: TransactionStatus.RELEASED,
      },
    });
    const txn2 = await prisma.transaction.create({
      data: {
        buyerId: buyer.id,
        providerId: provider2.id,
        amount: 200,
        status: TransactionStatus.RELEASED,
      },
    });

    await prisma.payout.create({
      data: { providerId: provider1.id, transactionId: txn1.id, amount: 95 },
    });
    await prisma.payout.create({
      data: { providerId: provider2.id, transactionId: txn2.id, amount: 190 },
    });

    const p1Payouts = await prisma.payout.findMany({
      where: { providerId: provider1.id },
    });
    const p2Payouts = await prisma.payout.findMany({
      where: { providerId: provider2.id },
    });

    expect(p1Payouts).toHaveLength(1);
    expect(p2Payouts).toHaveLength(1);
  });

  it('should isolate webhook endpoints by user', async () => {
    const user1 = await createTestUser(prisma, { email: 'u1@test.com' });
    const user2 = await createTestUser(prisma, { email: 'u2@test.com' });

    await prisma.webhookEndpoint.create({
      data: {
        userId: user1.id,
        url: 'https://example1.com/hook',
        secret: 'secret1',
        events: ['transaction.updated'],
      },
    });
    await prisma.webhookEndpoint.create({
      data: {
        userId: user2.id,
        url: 'https://example2.com/hook',
        secret: 'secret2',
        events: ['transaction.updated'],
      },
    });

    const u1Endpoints = await prisma.webhookEndpoint.findMany({
      where: { userId: user1.id },
    });
    const u2Endpoints = await prisma.webhookEndpoint.findMany({
      where: { userId: user2.id },
    });

    expect(u1Endpoints).toHaveLength(1);
    expect(u2Endpoints).toHaveLength(1);
    expect(u1Endpoints[0].url).toBe('https://example1.com/hook');
  });
});
