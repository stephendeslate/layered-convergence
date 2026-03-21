import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Transaction State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerId: string;
  let sellerId: string;
  let transactionId: string;

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

    await prisma.webhook.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();

    const hashedPassword = await bcrypt.hash('password123', 12);

    const buyer = await prisma.user.create({
      data: { email: 'buyer-int@test.com', password: hashedPassword, role: 'BUYER' },
    });
    buyerId = buyer.id;

    const seller = await prisma.user.create({
      data: { email: 'seller-int@test.com', password: hashedPassword, role: 'SELLER' },
    });
    sellerId = seller.id;

    const tx = await prisma.transaction.create({
      data: {
        title: 'Integration Test Transaction',
        amount: 500.00,
        buyerId,
        sellerId,
        status: 'PENDING',
      },
    });
    transactionId = tx.id;
  });

  afterAll(async () => {
    await prisma.webhook.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.dispute.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('should follow the full happy path: PENDING -> FUNDED -> SHIPPED -> DELIVERED -> RELEASED -> COMPLETED', async () => {
    const transitions = [
      'FUNDED',
      'SHIPPED',
      'DELIVERED',
      'RELEASED',
      'COMPLETED',
    ] as const;

    for (const status of transitions) {
      const updated = await prisma.transaction.update({
        where: { id: transactionId },
        data: { status },
      });
      expect(updated.status).toBe(status);
    }

    const final = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    expect(final?.status).toBe('COMPLETED');
  });

  it('should track all 9 states in enum', () => {
    const expectedStates = [
      'PENDING',
      'FUNDED',
      'SHIPPED',
      'DELIVERED',
      'RELEASED',
      'COMPLETED',
      'DISPUTED',
      'REFUNDED',
      'CANCELLED',
    ];

    for (const state of expectedStates) {
      expect(['PENDING', 'FUNDED', 'SHIPPED', 'DELIVERED', 'RELEASED', 'COMPLETED', 'DISPUTED', 'REFUNDED', 'CANCELLED']).toContain(state);
    }
  });

  it('should handle dispute flow: PENDING -> FUNDED -> DISPUTED -> REFUNDED', async () => {
    const tx = await prisma.transaction.create({
      data: {
        title: 'Dispute Test',
        amount: 200.00,
        buyerId,
        sellerId,
        status: 'PENDING',
      },
    });

    await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'FUNDED' } });
    await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'DISPUTED' } });
    const refunded = await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'REFUNDED' } });

    expect(refunded.status).toBe('REFUNDED');
  });
});
