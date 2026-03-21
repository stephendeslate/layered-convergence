import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionService } from '../src/transaction/transaction.service';
import { DisputeService } from '../src/dispute/dispute.service';
import * as bcrypt from 'bcrypt';
import { TransactionStatus, DisputeStatus } from '@prisma/client';

describe('Transaction State Machine (integration via service layer)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let transactionService: TransactionService;
  let disputeService: DisputeService;
  let buyerId: string;
  let sellerId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'integration-test-secret-key-must-be-long';
    process.env.CORS_ORIGIN = 'http://localhost:3000';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    transactionService = app.get(TransactionService);
    disputeService = app.get(DisputeService);

    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 12);

    const buyer = await prisma.user.create({
      data: { email: 'sm-buyer@test.com', password: hashedPassword, role: 'BUYER' },
    });
    buyerId = buyer.id;

    const seller = await prisma.user.create({
      data: { email: 'sm-seller@test.com', password: hashedPassword, role: 'SELLER' },
    });
    sellerId = seller.id;
  });

  afterAll(async () => {
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('should follow happy path via service: PENDING -> FUNDED -> SHIPPED -> DELIVERED -> RELEASED', async () => {
    const tx = await transactionService.create(buyerId, {
      title: 'Happy Path Test',
      amount: 500,
      sellerId,
    });
    expect(tx.status).toBe(TransactionStatus.PENDING);

    const funded = await transactionService.updateStatus(tx.id, TransactionStatus.FUNDED, buyerId, 'BUYER');
    expect(funded.status).toBe(TransactionStatus.FUNDED);

    const shipped = await transactionService.updateStatus(tx.id, TransactionStatus.SHIPPED, sellerId, 'SELLER');
    expect(shipped.status).toBe(TransactionStatus.SHIPPED);

    const delivered = await transactionService.updateStatus(tx.id, TransactionStatus.DELIVERED, buyerId, 'BUYER');
    expect(delivered.status).toBe(TransactionStatus.DELIVERED);

    const released = await transactionService.updateStatus(tx.id, TransactionStatus.RELEASED, buyerId, 'BUYER');
    expect(released.status).toBe(TransactionStatus.RELEASED);
  });

  it('should reject invalid transition PENDING -> SHIPPED via service', async () => {
    const tx = await transactionService.create(buyerId, {
      title: 'Invalid Transition Test',
      amount: 100,
      sellerId,
    });

    await expect(
      transactionService.updateStatus(tx.id, TransactionStatus.SHIPPED, buyerId, 'BUYER'),
    ).rejects.toThrow('Cannot transition from PENDING to SHIPPED');
  });

  it('should reject invalid transition RELEASED -> FUNDED via service', async () => {
    const tx = await transactionService.create(buyerId, {
      title: 'Terminal State Test',
      amount: 50,
      sellerId,
    });

    await transactionService.updateStatus(tx.id, TransactionStatus.FUNDED, buyerId, 'BUYER');
    await transactionService.updateStatus(tx.id, TransactionStatus.SHIPPED, sellerId, 'SELLER');
    await transactionService.updateStatus(tx.id, TransactionStatus.DELIVERED, buyerId, 'BUYER');
    await transactionService.updateStatus(tx.id, TransactionStatus.RELEASED, buyerId, 'BUYER');

    await expect(
      transactionService.updateStatus(tx.id, TransactionStatus.FUNDED, buyerId, 'BUYER'),
    ).rejects.toThrow('Cannot transition from RELEASED to FUNDED');
  });

  it('should handle dispute flow via service: FUNDED -> DISPUTED -> RESOLVED -> REFUNDED', async () => {
    const tx = await transactionService.create(buyerId, {
      title: 'Dispute Flow Test',
      amount: 300,
      sellerId,
    });

    await transactionService.updateStatus(tx.id, TransactionStatus.FUNDED, buyerId, 'BUYER');

    const dispute = await disputeService.create(buyerId, 'BUYER', {
      transactionId: tx.id,
      reason: 'Item not as described',
    });
    expect(dispute.status).toBe(DisputeStatus.OPEN);

    const txAfterDispute = await transactionService.findById(tx.id, buyerId, 'BUYER');
    expect(txAfterDispute.status).toBe(TransactionStatus.DISPUTED);

    await transactionService.updateStatus(tx.id, TransactionStatus.RESOLVED, buyerId, 'BUYER');
    const refunded = await transactionService.updateStatus(tx.id, TransactionStatus.REFUNDED, buyerId, 'BUYER');
    expect(refunded.status).toBe(TransactionStatus.REFUNDED);
  });

  it('should handle dispute resolution flow via service', async () => {
    const tx = await transactionService.create(buyerId, {
      title: 'Dispute Resolution Test',
      amount: 250,
      sellerId,
    });

    await transactionService.updateStatus(tx.id, TransactionStatus.FUNDED, buyerId, 'BUYER');

    const dispute = await disputeService.create(buyerId, 'BUYER', {
      transactionId: tx.id,
      reason: 'Wrong item',
    });

    const resolved = await disputeService.resolve(dispute.id, buyerId, 'BUYER', {
      resolution: 'Refund approved',
    });
    expect(resolved.status).toBe(DisputeStatus.RESOLVED);
    expect(resolved.resolution).toBe('Refund approved');
  });

  it('should reject dispute on non-disputable status via service', async () => {
    const tx = await transactionService.create(buyerId, {
      title: 'Non-disputable Test',
      amount: 75,
      sellerId,
    });

    await expect(
      disputeService.create(buyerId, 'BUYER', {
        transactionId: tx.id,
        reason: 'Cannot dispute pending',
      }),
    ).rejects.toThrow('Cannot dispute a transaction in PENDING status');
  });
});
