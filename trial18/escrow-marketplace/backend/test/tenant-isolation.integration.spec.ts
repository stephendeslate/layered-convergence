import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { TransactionService } from '../src/transaction/transaction.service';
import { ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('Tenant Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let transactionService: TransactionService;
  let buyerId: string;
  let sellerId: string;
  let otherUserId: string;

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

    await prisma.webhook.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 12);

    const buyer = await prisma.user.create({
      data: { email: 'buyer-iso@test.com', password: hashedPassword, role: 'BUYER' },
    });
    buyerId = buyer.id;

    const seller = await prisma.user.create({
      data: { email: 'seller-iso@test.com', password: hashedPassword, role: 'SELLER' },
    });
    sellerId = seller.id;

    const other = await prisma.user.create({
      data: { email: 'other-iso@test.com', password: hashedPassword, role: 'BUYER' },
    });
    otherUserId = other.id;
  });

  afterAll(async () => {
    await prisma.webhook.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('should only return transactions belonging to the requesting user', async () => {
    await prisma.transaction.create({
      data: {
        title: 'Buyer-Seller TX',
        amount: 100.00,
        buyerId,
        sellerId,
        status: 'PENDING',
      },
    });

    const buyerTxs = await transactionService.findAll(buyerId, 'BUYER');
    const otherTxs = await transactionService.findAll(otherUserId, 'BUYER');

    expect(buyerTxs.length).toBeGreaterThan(0);
    expect(otherTxs.length).toBe(0);
  });

  it('should deny access to a transaction the user does not own', async () => {
    const tx = await prisma.transaction.create({
      data: {
        title: 'Private TX',
        amount: 300.00,
        buyerId,
        sellerId,
        status: 'PENDING',
      },
    });

    await expect(
      transactionService.findById(tx.id, otherUserId, 'BUYER'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow ADMIN to see all transactions', async () => {
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin-iso@test.com',
        password: await bcrypt.hash('password123', 12),
        role: 'ADMIN',
      },
    });

    const adminTxs = await transactionService.findAll(adminUser.id, 'ADMIN');
    expect(adminTxs.length).toBeGreaterThan(0);
  });

  it('should allow seller to see their own transactions', async () => {
    const sellerTxs = await transactionService.findAll(sellerId, 'SELLER');
    expect(sellerTxs.length).toBeGreaterThan(0);
  });
});
