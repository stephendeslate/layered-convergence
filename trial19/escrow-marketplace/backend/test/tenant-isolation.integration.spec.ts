import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionService } from '../src/transaction/transaction.service';
import { DisputeService } from '../src/dispute/dispute.service';
import { PayoutService } from '../src/payout/payout.service';
import * as bcrypt from 'bcrypt';
import { TransactionStatus, ForbiddenException } from '@nestjs/common';

describe('Tenant Isolation (integration via service layer)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let transactionService: TransactionService;
  let disputeService: DisputeService;
  let payoutService: PayoutService;
  let buyerAId: string;
  let sellerAId: string;
  let buyerBId: string;
  let sellerBId: string;
  let txAId: string;

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
    payoutService = app.get(PayoutService);

    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 12);

    const buyerA = await prisma.user.create({
      data: { email: 'ti-buyerA@test.com', password: hashedPassword, role: 'BUYER' },
    });
    buyerAId = buyerA.id;

    const sellerA = await prisma.user.create({
      data: { email: 'ti-sellerA@test.com', password: hashedPassword, role: 'SELLER' },
    });
    sellerAId = sellerA.id;

    const buyerB = await prisma.user.create({
      data: { email: 'ti-buyerB@test.com', password: hashedPassword, role: 'BUYER' },
    });
    buyerBId = buyerB.id;

    const sellerB = await prisma.user.create({
      data: { email: 'ti-sellerB@test.com', password: hashedPassword, role: 'SELLER' },
    });
    sellerBId = sellerB.id;

    const txA = await transactionService.create(buyerAId, {
      title: 'Tenant A Transaction',
      amount: 1000,
      sellerId: sellerAId,
    });
    txAId = txA.id;
  });

  afterAll(async () => {
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('should deny buyerB access to buyerA transaction via service', async () => {
    await expect(
      transactionService.findById(txAId, buyerBId, 'BUYER'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should deny sellerB access to tenant A transaction via service', async () => {
    await expect(
      transactionService.findById(txAId, sellerBId, 'SELLER'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should deny buyerB from updating tenant A transaction status via service', async () => {
    await expect(
      transactionService.updateStatus(txAId, 'FUNDED' as never, buyerBId, 'BUYER'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow buyerA to access own transaction via service', async () => {
    const tx = await transactionService.findById(txAId, buyerAId, 'BUYER');
    expect(tx.id).toBe(txAId);
    expect(tx.buyerId).toBe(buyerAId);
  });

  it('should allow sellerA to access their transaction via service', async () => {
    const tx = await transactionService.findById(txAId, sellerAId, 'SELLER');
    expect(tx.id).toBe(txAId);
    expect(tx.sellerId).toBe(sellerAId);
  });

  it('should deny cross-tenant dispute creation via service', async () => {
    await transactionService.updateStatus(txAId, 'FUNDED' as never, buyerAId, 'BUYER');

    await expect(
      disputeService.create(buyerBId, 'BUYER', {
        transactionId: txAId,
        reason: 'Cross-tenant attack',
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should deny cross-tenant payout creation via service', async () => {
    await expect(
      payoutService.create(buyerBId, 'BUYER', {
        amount: 1000,
        transactionId: txAId,
        recipientId: buyerBId,
      }),
    ).rejects.toThrow(ForbiddenException);
  });
});
