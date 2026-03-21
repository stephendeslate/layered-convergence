import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionService } from '../src/transaction/transaction.service';
import { TransactionStatus } from '../src/transaction/dto/transition-transaction.dto';
import {
  createTestApp,
  cleanDatabase,
  createTestUsers,
} from './helpers/test-app';

describe('Transaction State Machine Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let transactionService: TransactionService;
  let buyer: any;
  let provider: any;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    transactionService = app.get(TransactionService);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    const users = await createTestUsers(prisma);
    buyer = users.buyer;
    provider = users.provider;
  });

  it('should create transaction in PENDING state', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 100,
      providerId: provider.id,
    });

    expect(tx.status).toBe('PENDING');
  });

  it('should transition PENDING -> FUNDED', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 100,
      providerId: provider.id,
    });

    const result = await transactionService.transition(
      tx.id,
      TransactionStatus.FUNDED,
    );
    expect(result.status).toBe('FUNDED');
  });

  it('should transition PENDING -> EXPIRED', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 50,
      providerId: provider.id,
    });

    const result = await transactionService.transition(
      tx.id,
      TransactionStatus.EXPIRED,
    );
    expect(result.status).toBe('EXPIRED');
  });

  it('should transition FUNDED -> DELIVERED -> RELEASED', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 200,
      providerId: provider.id,
    });

    await transactionService.transition(tx.id, TransactionStatus.FUNDED);
    await transactionService.transition(tx.id, TransactionStatus.DELIVERED);
    const result = await transactionService.transition(
      tx.id,
      TransactionStatus.RELEASED,
    );

    expect(result.status).toBe('RELEASED');
  });

  it('should transition FUNDED -> DISPUTED -> REFUNDED', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 150,
      providerId: provider.id,
    });

    await transactionService.transition(tx.id, TransactionStatus.FUNDED);
    await transactionService.transition(tx.id, TransactionStatus.DISPUTED);
    const result = await transactionService.transition(
      tx.id,
      TransactionStatus.REFUNDED,
    );

    expect(result.status).toBe('REFUNDED');
  });

  it('should transition DISPUTED -> RELEASED', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 300,
      providerId: provider.id,
    });

    await transactionService.transition(tx.id, TransactionStatus.FUNDED);
    await transactionService.transition(tx.id, TransactionStatus.DISPUTED);
    const result = await transactionService.transition(
      tx.id,
      TransactionStatus.RELEASED,
    );

    expect(result.status).toBe('RELEASED');
  });

  it('should reject invalid transition PENDING -> RELEASED', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 100,
      providerId: provider.id,
    });

    await expect(
      transactionService.transition(tx.id, TransactionStatus.RELEASED),
    ).rejects.toThrow('Invalid transition from PENDING to RELEASED');
  });

  it('should reject invalid transition RELEASED -> FUNDED', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 100,
      providerId: provider.id,
    });

    await transactionService.transition(tx.id, TransactionStatus.FUNDED);
    await transactionService.transition(tx.id, TransactionStatus.DELIVERED);
    await transactionService.transition(tx.id, TransactionStatus.RELEASED);

    await expect(
      transactionService.transition(tx.id, TransactionStatus.FUNDED),
    ).rejects.toThrow('Invalid transition from RELEASED to FUNDED');
  });

  it('should reject invalid transition EXPIRED -> FUNDED', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 100,
      providerId: provider.id,
    });

    await transactionService.transition(tx.id, TransactionStatus.EXPIRED);

    await expect(
      transactionService.transition(tx.id, TransactionStatus.FUNDED),
    ).rejects.toThrow('Invalid transition from EXPIRED to FUNDED');
  });

  it('should record state history entries', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 100,
      providerId: provider.id,
    });

    await transactionService.transition(tx.id, TransactionStatus.FUNDED);
    await transactionService.transition(tx.id, TransactionStatus.DELIVERED);

    const history = await prisma.transactionStateHistory.findMany({
      where: { transactionId: tx.id },
      orderBy: { changedAt: 'asc' },
    });

    expect(history).toHaveLength(2);
    expect(history[0].fromStatus).toBe('PENDING');
    expect(history[0].toStatus).toBe('FUNDED');
    expect(history[1].fromStatus).toBe('FUNDED');
    expect(history[1].toStatus).toBe('DELIVERED');
  });
});
