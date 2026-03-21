import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionService } from '../src/transaction/transaction.service';
import { PayoutService } from '../src/payout/payout.service';
import {
  createTestApp,
  cleanDatabase,
} from './helpers/test-app';

describe('Tenant Isolation Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let transactionService: TransactionService;
  let payoutService: PayoutService;

  let buyerA: any;
  let providerA: any;
  let buyerB: any;
  let providerB: any;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    transactionService = app.get(TransactionService);
    payoutService = app.get(PayoutService);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    buyerA = await prisma.user.create({
      data: { email: 'buyerA@test.com', password: 'pass123', role: 'BUYER' },
    });
    providerA = await prisma.user.create({
      data: {
        email: 'providerA@test.com',
        password: 'pass123',
        role: 'PROVIDER',
      },
    });
    buyerB = await prisma.user.create({
      data: { email: 'buyerB@test.com', password: 'pass123', role: 'BUYER' },
    });
    providerB = await prisma.user.create({
      data: {
        email: 'providerB@test.com',
        password: 'pass123',
        role: 'PROVIDER',
      },
    });
  });

  it('should isolate transactions by user', async () => {
    await transactionService.create(buyerA.id, {
      amount: 100,
      providerId: providerA.id,
    });
    await transactionService.create(buyerA.id, {
      amount: 200,
      providerId: providerA.id,
    });
    await transactionService.create(buyerB.id, {
      amount: 300,
      providerId: providerB.id,
    });

    const txA = await transactionService.findByUser(buyerA.id);
    const txB = await transactionService.findByUser(buyerB.id);

    expect(txA).toHaveLength(2);
    expect(txB).toHaveLength(1);
  });

  it('should not let buyer A see buyer B transactions via findByUser', async () => {
    await transactionService.create(buyerB.id, {
      amount: 500,
      providerId: providerB.id,
    });

    const txA = await transactionService.findByUser(buyerA.id);
    expect(txA).toHaveLength(0);
  });

  it('should isolate payouts by user', async () => {
    const tx = await transactionService.create(buyerA.id, {
      amount: 100,
      providerId: providerA.id,
    });

    await payoutService.create({
      transactionId: tx.id,
      userId: providerA.id,
      amount: 100,
    });

    const payoutsA = await payoutService.findByUser(providerA.id);
    const payoutsB = await payoutService.findByUser(providerB.id);

    expect(payoutsA).toHaveLength(1);
    expect(payoutsB).toHaveLength(0);
  });

  it('should isolate stripe accounts per user', async () => {
    await prisma.stripeConnectedAccount.create({
      data: {
        userId: providerA.id,
        stripeAccountId: 'acct_A',
      },
    });

    const accountA = await prisma.stripeConnectedAccount.findUnique({
      where: { userId: providerA.id },
    });
    const accountB = await prisma.stripeConnectedAccount.findUnique({
      where: { userId: providerB.id },
    });

    expect(accountA).not.toBeNull();
    expect(accountB).toBeNull();
  });

  it('should show provider their own transactions', async () => {
    await transactionService.create(buyerA.id, {
      amount: 100,
      providerId: providerA.id,
    });
    await transactionService.create(buyerB.id, {
      amount: 200,
      providerId: providerA.id,
    });

    const provATx = await transactionService.findByUser(providerA.id);
    expect(provATx).toHaveLength(2);

    const provBTx = await transactionService.findByUser(providerB.id);
    expect(provBTx).toHaveLength(0);
  });

  it('should enforce unique email constraint', async () => {
    await expect(
      prisma.user.create({
        data: {
          email: 'buyerA@test.com',
          password: 'other',
          role: 'BUYER',
        },
      }),
    ).rejects.toThrow();
  });

  it('should enforce unique stripeAccountId constraint', async () => {
    await prisma.stripeConnectedAccount.create({
      data: { userId: providerA.id, stripeAccountId: 'acct_same' },
    });

    await expect(
      prisma.stripeConnectedAccount.create({
        data: { userId: providerB.id, stripeAccountId: 'acct_same' },
      }),
    ).rejects.toThrow();
  });
});
