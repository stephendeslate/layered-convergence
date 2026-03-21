/**
 * Escrow Marketplace — User Isolation E2E Tests
 * Verifies dual-party access pattern (buyer OR provider) and cross-user -> 404.
 * Uses real Prisma client against test database — NO mocks.
 * Per v3.0: E2E tests must use real database, not Prisma mocks.
 * Per v4.0 Section 5.14: dual-party isolation pattern.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('User Isolation — Dual-Party Pattern (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyer: { id: string };
  let provider: { id: string };
  let outsider: { id: string };
  let transaction: { id: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Seed users
    buyer = await prisma.user.create({
      data: { email: `buyer_${Date.now()}@test.com`, name: 'Test Buyer', role: 'BUYER' },
    });
    provider = await prisma.user.create({
      data: { email: `provider_${Date.now()}@test.com`, name: 'Test Provider', role: 'PROVIDER' },
    });
    outsider = await prisma.user.create({
      data: { email: `outsider_${Date.now()}@test.com`, name: 'Outsider', role: 'BUYER' },
    });

    // Create a transaction between buyer and provider
    transaction = await prisma.transaction.create({
      data: {
        buyerId: buyer.id,
        providerId: provider.id,
        amount: 10000,
        status: 'HELD',
        platformFee: 500,
      },
    });
  });

  afterAll(async () => {
    await prisma.transactionStateHistory.deleteMany({ where: { transactionId: transaction.id } });
    await prisma.transaction.delete({ where: { id: transaction.id } });
    await prisma.user.deleteMany({ where: { id: { in: [buyer.id, provider.id, outsider.id] } } });
    await app.close();
  });

  it('buyer should see their transaction', async () => {
    const res = await request(app.getHttpServer())
      .get(`/transactions/${transaction.id}`)
      .set('x-user-id', buyer.id)
      .expect(200);

    expect(res.body.id).toBe(transaction.id);
  });

  it('provider should see their transaction (dual-party access)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/transactions/${transaction.id}`)
      .set('x-user-id', provider.id)
      .expect(200);

    expect(res.body.id).toBe(transaction.id);
  });

  it('outsider should get 404 for cross-user access', async () => {
    await request(app.getHttpServer())
      .get(`/transactions/${transaction.id}`)
      .set('x-user-id', outsider.id)
      .expect(404);
  });

  it('outsider should not see other users transactions in list', async () => {
    const res = await request(app.getHttpServer())
      .get('/transactions')
      .set('x-user-id', outsider.id)
      .expect(200);

    expect(res.body).toHaveLength(0);
  });
});

describe('Transaction State Machine (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyer: { id: string };
  let provider: { id: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    buyer = await prisma.user.create({
      data: { email: `sm_buyer_${Date.now()}@test.com`, name: 'SM Buyer', role: 'BUYER' },
    });
    provider = await prisma.user.create({
      data: { email: `sm_provider_${Date.now()}@test.com`, name: 'SM Provider', role: 'PROVIDER' },
    });
  });

  afterAll(async () => {
    await prisma.payout.deleteMany({ where: { providerId: provider.id } });
    await prisma.transactionStateHistory.deleteMany({
      where: { transaction: { buyerId: buyer.id } },
    });
    await prisma.transaction.deleteMany({ where: { buyerId: buyer.id } });
    await prisma.user.deleteMany({ where: { id: { in: [buyer.id, provider.id] } } });
    await app.close();
  });

  it('should reject invalid state transition', async () => {
    const tx = await prisma.transaction.create({
      data: {
        buyerId: buyer.id,
        providerId: provider.id,
        amount: 5000,
        status: 'PENDING',
        platformFee: 250,
      },
    });

    await request(app.getHttpServer())
      .post(`/transactions/${tx.id}/transition`)
      .set('x-user-id', buyer.id)
      .send({ toStatus: 'COMPLETED' })
      .expect(400);
  });

  it('should create payout when transaction is released (side effect)', async () => {
    const tx = await prisma.transaction.create({
      data: {
        buyerId: buyer.id,
        providerId: provider.id,
        amount: 8000,
        status: 'HELD',
        platformFee: 400,
      },
    });

    await request(app.getHttpServer())
      .post(`/transactions/${tx.id}/transition`)
      .set('x-user-id', buyer.id)
      .send({ toStatus: 'RELEASED' })
      .expect(201);

    const payout = await prisma.payout.findFirstOrThrow({
      where: { transactionId: tx.id },
    });

    expect(payout.amount).toBe(7600); // 8000 - 400 fee
    expect(payout.status).toBe('PENDING');
  });

  it('should validate DTO (reject missing toStatus)', async () => {
    const tx = await prisma.transaction.create({
      data: {
        buyerId: buyer.id,
        providerId: provider.id,
        amount: 3000,
        status: 'HELD',
        platformFee: 150,
      },
    });

    await request(app.getHttpServer())
      .post(`/transactions/${tx.id}/transition`)
      .set('x-user-id', buyer.id)
      .send({})
      .expect(400);
  });
});
