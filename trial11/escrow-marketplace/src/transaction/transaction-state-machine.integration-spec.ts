import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter.js';

describe('Transaction State Machine (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerToken: string;
  let providerToken: string;
  let adminToken: string;
  let providerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    // Truncate all tables for test isolation
    await prisma.$executeRaw`TRUNCATE TABLE "transaction_state_histories", "disputes", "payouts", "webhook_logs", "transactions", "stripe_connected_accounts", "users" CASCADE`;

    // Register buyer
    const buyerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'buyer@test.com', name: 'Buyer', password: 'pass123', role: 'BUYER' })
      .expect(201);
    buyerToken = buyerRes.body.token;

    // Register provider
    const providerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'provider@test.com', name: 'Provider', password: 'pass123', role: 'PROVIDER' })
      .expect(201);
    providerToken = providerRes.body.token;
    providerId = providerRes.body.id;

    // Register admin
    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin@test.com', name: 'Admin', password: 'pass123', role: 'ADMIN' })
      .expect(201);
    adminToken = adminRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a transaction in PENDING state', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ providerId, amount: 100 })
      .expect(201);

    expect(body.status).toBe('PENDING');
    expect(body.buyerId).toBeDefined();
    expect(body.providerId).toBe(providerId);
  });

  it('should transition PENDING → FUNDED', async () => {
    const { body: tx } = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ providerId, amount: 100 })
      .expect(201);

    const { body: funded } = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/fund`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(funded.status).toBe('FUNDED');

    // Verify database state
    const dbTx = await prisma.transaction.findUnique({ where: { id: tx.id } });
    expect(dbTx!.status).toBe('FUNDED');
  });

  it('should transition FUNDED → DELIVERED → RELEASED', async () => {
    const { body: tx } = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ providerId, amount: 200 })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/fund`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    const { body: delivered } = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/deliver`)
      .set('Authorization', `Bearer ${providerToken}`)
      .expect(200);

    expect(delivered.status).toBe('DELIVERED');

    const { body: released } = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/release`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(released.status).toBe('RELEASED');

    // Verify database has state history
    const history = await prisma.transactionStateHistory.findMany({
      where: { transactionId: tx.id },
      orderBy: { createdAt: 'asc' },
    });
    expect(history).toHaveLength(3);
    expect(history[0].fromState).toBe('PENDING');
    expect(history[0].toState).toBe('FUNDED');
    expect(history[1].toState).toBe('DELIVERED');
    expect(history[2].toState).toBe('RELEASED');
  });

  it('should transition FUNDED → DISPUTED → REFUNDED', async () => {
    const { body: tx } = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ providerId, amount: 150 })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/fund`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/dispute`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ reason: 'Item not as described' })
      .expect(200);

    const { body: refunded } = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/refund`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(refunded.status).toBe('REFUNDED');
  });

  it('should reject invalid transition PENDING → RELEASED', async () => {
    const { body: tx } = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ providerId, amount: 100 })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/release`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(400);
  });

  it('should reject invalid transition RELEASED → FUNDED', async () => {
    const { body: tx } = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ providerId, amount: 100 })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/fund`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/deliver`)
      .set('Authorization', `Bearer ${providerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/release`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/fund`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(400);
  });
});
