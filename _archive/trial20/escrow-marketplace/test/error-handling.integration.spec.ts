import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionService } from '../src/transaction/transaction.service';
import { DisputeService } from '../src/dispute/dispute.service';
import { WebhookService } from '../src/webhook/webhook.service';
import { StripeAccountService } from '../src/stripe-account/stripe-account.service';
import { PayoutService } from '../src/payout/payout.service';
import { TransactionStatus } from '../src/transaction/dto/transition-transaction.dto';
import {
  createTestApp,
  cleanDatabase,
  createTestUsers,
} from './helpers/test-app';

describe('Error Handling Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let transactionService: TransactionService;
  let disputeService: DisputeService;
  let webhookService: WebhookService;
  let stripeAccountService: StripeAccountService;
  let payoutService: PayoutService;
  let buyer: any;
  let provider: any;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
    transactionService = app.get(TransactionService);
    disputeService = app.get(DisputeService);
    webhookService = app.get(WebhookService);
    stripeAccountService = app.get(StripeAccountService);
    payoutService = app.get(PayoutService);
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

  it('should throw NotFoundException for non-existent transaction', async () => {
    await expect(
      transactionService.findOne('non-existent-id'),
    ).rejects.toThrow('Transaction non-existent-id not found');
  });

  it('should throw NotFoundException for non-existent dispute', async () => {
    await expect(disputeService.findOne('bad-id')).rejects.toThrow(
      'Dispute bad-id not found',
    );
  });

  it('should throw NotFoundException for non-existent payout', async () => {
    await expect(payoutService.findOne('bad-id')).rejects.toThrow(
      'Payout bad-id not found',
    );
  });

  it('should throw NotFoundException for non-existent stripe account', async () => {
    await expect(
      stripeAccountService.findByUser('no-user'),
    ).rejects.toThrow('Stripe account for user no-user not found');
  });

  it('should throw BadRequestException for invalid state transitions', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 100,
      providerId: provider.id,
    });

    await expect(
      transactionService.transition(tx.id, TransactionStatus.RELEASED),
    ).rejects.toThrow('Invalid transition from PENDING to RELEASED');
  });

  it('should throw ConflictException for duplicate webhook idempotency key', async () => {
    await webhookService.process({
      idempotencyKey: 'dup-key',
      event: 'test.event',
      payload: { test: true },
    });

    await expect(
      webhookService.process({
        idempotencyKey: 'dup-key',
        event: 'test.event',
        payload: { test: true },
      }),
    ).rejects.toThrow('Webhook with idempotency key dup-key already processed');
  });

  it('should throw when creating dispute on non-disputable transaction', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 100,
      providerId: provider.id,
    });

    await expect(
      disputeService.create(buyer.id, {
        transactionId: tx.id,
        reason: 'This is a test dispute reason',
      }),
    ).rejects.toThrow('Invalid transition from PENDING to DISPUTED');
  });

  it('should handle transition on non-existent transaction', async () => {
    await expect(
      transactionService.transition('no-tx', TransactionStatus.FUNDED),
    ).rejects.toThrow('Transaction no-tx not found');
  });

  it('should reject double transitions to terminal states', async () => {
    const tx = await transactionService.create(buyer.id, {
      amount: 100,
      providerId: provider.id,
    });

    await transactionService.transition(tx.id, TransactionStatus.FUNDED);
    await transactionService.transition(tx.id, TransactionStatus.DELIVERED);
    await transactionService.transition(tx.id, TransactionStatus.RELEASED);

    await expect(
      transactionService.transition(tx.id, TransactionStatus.RELEASED),
    ).rejects.toThrow('Invalid transition from RELEASED to RELEASED');
  });
});
