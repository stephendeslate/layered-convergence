import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { App } from 'supertest/types.js';

describe('Tenant Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "transaction_state_histories", "disputes", "payouts", "webhook_logs", "transactions", "stripe_connected_accounts", "users" CASCADE`;
  });

  it('buyer A cannot see buyer B transactions', async () => {
    const providerRes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'provider@test.com', name: 'Provider', role: 'PROVIDER', password: 'password123' });
    const providerId = providerRes.body.id;

    const buyerARes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'buyerA@test.com', name: 'Buyer A', role: 'BUYER', password: 'password123' });
    const buyerAToken = buyerARes.body.token;

    const buyerBRes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'buyerB@test.com', name: 'Buyer B', role: 'BUYER', password: 'password123' });
    const buyerBToken = buyerBRes.body.token;

    await request(app.getHttpServer() as App)
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerAToken}`)
      .send({ providerId, amount: 100 });

    await request(app.getHttpServer() as App)
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerAToken}`)
      .send({ providerId, amount: 200 });

    await request(app.getHttpServer() as App)
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerBToken}`)
      .send({ providerId, amount: 300 });

    const buyerATransactions = await request(app.getHttpServer() as App)
      .get('/transactions')
      .set('Authorization', `Bearer ${buyerAToken}`);
    expect(buyerATransactions.body).toHaveLength(2);

    const buyerBTransactions = await request(app.getHttpServer() as App)
      .get('/transactions')
      .set('Authorization', `Bearer ${buyerBToken}`);
    expect(buyerBTransactions.body).toHaveLength(1);
  });

  it('buyer A cannot fund buyer B transaction', async () => {
    const providerRes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'provider@test.com', name: 'Provider', role: 'PROVIDER', password: 'password123' });
    const providerId = providerRes.body.id;

    const buyerARes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'buyerA@test.com', name: 'Buyer A', role: 'BUYER', password: 'password123' });
    const buyerAToken = buyerARes.body.token;

    const buyerBRes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'buyerB@test.com', name: 'Buyer B', role: 'BUYER', password: 'password123' });
    const buyerBToken = buyerBRes.body.token;

    const txRes = await request(app.getHttpServer() as App)
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerBToken}`)
      .send({ providerId, amount: 100 });

    const res = await request(app.getHttpServer() as App)
      .patch(`/transactions/${txRes.body.id}/fund`)
      .set('Authorization', `Bearer ${buyerAToken}`);

    expect(res.status).toBe(403);
  });
});
