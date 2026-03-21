import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter.js';

describe('Buyer/Seller Isolation (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
    await prisma.$executeRaw`TRUNCATE TABLE "transaction_state_histories", "disputes", "payouts", "webhook_logs", "transactions", "stripe_connected_accounts", "users" CASCADE`;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should not allow buyer B to see buyer A transactions', async () => {
    // Register buyer A, buyer B, and provider
    const buyerARes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'buyerA@test.com', name: 'Buyer A', password: 'pass123', role: 'BUYER' })
      .expect(201);

    const buyerBRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'buyerB@test.com', name: 'Buyer B', password: 'pass123', role: 'BUYER' })
      .expect(201);

    const providerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'provider@test.com', name: 'Provider', password: 'pass123', role: 'PROVIDER' })
      .expect(201);

    // Create transaction as buyer A
    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerARes.body.token}`)
      .send({ providerId: providerRes.body.id, amount: 100 })
      .expect(201);

    // Query as buyer B — should see 0 transactions
    const { body: buyerBTransactions } = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${buyerBRes.body.token}`)
      .expect(200);

    expect(buyerBTransactions).toHaveLength(0);
  });

  it('should not allow buyer B to fund buyer A transaction', async () => {
    const buyerARes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'buyerA@test.com', name: 'Buyer A', password: 'pass123', role: 'BUYER' })
      .expect(201);

    const buyerBRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'buyerB@test.com', name: 'Buyer B', password: 'pass123', role: 'BUYER' })
      .expect(201);

    const providerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'provider@test.com', name: 'Provider', password: 'pass123', role: 'PROVIDER' })
      .expect(201);

    const { body: tx } = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerARes.body.token}`)
      .send({ providerId: providerRes.body.id, amount: 100 })
      .expect(201);

    // Buyer B tries to fund buyer A's transaction — should be forbidden
    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/fund`)
      .set('Authorization', `Bearer ${buyerBRes.body.token}`)
      .expect(403);
  });
});
