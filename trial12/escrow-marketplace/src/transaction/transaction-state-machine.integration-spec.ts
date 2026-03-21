import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { App } from 'supertest/types.js';

describe('Transaction State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerToken: string;
  let providerToken: string;
  let adminToken: string;
  let providerId: string;
  let buyerId: string;

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
    await prisma.$executeRaw`TRUNCATE "TransactionStateHistory", "Dispute", "Payout", "StripeConnectedAccount", "WebhookLog", "Transaction", "User" CASCADE`;

    const buyerRes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'buyer@test.com', name: 'Buyer', role: 'BUYER', password: 'password123' });
    buyerToken = buyerRes.body.token;
    buyerId = buyerRes.body.id;

    const providerRes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'provider@test.com', name: 'Provider', role: 'PROVIDER', password: 'password123' });
    providerToken = providerRes.body.token;
    providerId = providerRes.body.id;

    const adminRes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'admin@test.com', name: 'Admin', role: 'ADMIN', password: 'password123' });
    adminToken = adminRes.body.token;
  });

  async function createTransaction() {
    const res = await request(app.getHttpServer() as App)
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ providerId, amount: 100 });
    return res.body;
  }

  async function transition(txId: string, toState: string, token: string, reason?: string) {
    return request(app.getHttpServer() as App)
      .post(`/transactions/${txId}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ toState, ...(reason ? { reason } : {}) });
  }

  it('should complete full lifecycle: PENDING → FUNDED → DELIVERED → RELEASED', async () => {
    const tx = await createTransaction();
    expect(tx.status).toBe('PENDING');

    const funded = await transition(tx.id, 'FUNDED', buyerToken);
    expect(funded.status).toBe(201);
    expect(funded.body.status).toBe('FUNDED');

    const delivered = await transition(tx.id, 'DELIVERED', providerToken);
    expect(delivered.status).toBe(201);
    expect(delivered.body.status).toBe('DELIVERED');

    const released = await transition(tx.id, 'RELEASED', buyerToken);
    expect(released.status).toBe(201);
    expect(released.body.status).toBe('RELEASED');

    const details = await request(app.getHttpServer() as App)
      .get(`/transactions/${tx.id}`)
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(details.body.stateHistory).toHaveLength(3);
  });

  it('should handle dispute flow: FUNDED → DISPUTED → REFUNDED', async () => {
    const tx = await createTransaction();
    await transition(tx.id, 'FUNDED', buyerToken);

    const disputed = await transition(tx.id, 'DISPUTED', buyerToken, 'Defective item');
    expect(disputed.status).toBe(201);
    expect(disputed.body.status).toBe('DISPUTED');

    const refunded = await transition(tx.id, 'REFUNDED', adminToken);
    expect(refunded.status).toBe(201);
    expect(refunded.body.status).toBe('REFUNDED');
  });

  it('should handle dispute from DELIVERED: DELIVERED → DISPUTED → RELEASED (provider wins)', async () => {
    const tx = await createTransaction();
    await transition(tx.id, 'FUNDED', buyerToken);
    await transition(tx.id, 'DELIVERED', providerToken);

    const disputed = await transition(tx.id, 'DISPUTED', buyerToken);
    expect(disputed.status).toBe(201);

    const released = await transition(tx.id, 'RELEASED', adminToken);
    expect(released.status).toBe(201);
    expect(released.body.status).toBe('RELEASED');
  });

  it('should expire pending transactions: PENDING → EXPIRED', async () => {
    const tx = await createTransaction();

    const expired = await transition(tx.id, 'EXPIRED', adminToken);
    expect(expired.status).toBe(201);
    expect(expired.body.status).toBe('EXPIRED');
  });

  it('should reject invalid transition PENDING → DELIVERED', async () => {
    const tx = await createTransaction();

    const res = await transition(tx.id, 'DELIVERED', providerToken);
    expect(res.status).toBe(400);
  });

  it('should reject invalid transition FUNDED → RELEASED (skipping DELIVERED)', async () => {
    const tx = await createTransaction();
    await transition(tx.id, 'FUNDED', buyerToken);

    const res = await transition(tx.id, 'RELEASED', buyerToken);
    expect(res.status).toBe(400);
  });

  it('should reject invalid transition RELEASED → anything', async () => {
    const tx = await createTransaction();
    await transition(tx.id, 'FUNDED', buyerToken);
    await transition(tx.id, 'DELIVERED', providerToken);
    await transition(tx.id, 'RELEASED', buyerToken);

    const res = await transition(tx.id, 'FUNDED', buyerToken);
    expect(res.status).toBe(400);
  });

  it('should enforce role: provider cannot fund', async () => {
    const tx = await createTransaction();

    const res = await transition(tx.id, 'FUNDED', providerToken);
    expect(res.status).toBe(403);
  });

  it('should enforce role: buyer cannot mark as delivered', async () => {
    const tx = await createTransaction();
    await transition(tx.id, 'FUNDED', buyerToken);

    const res = await transition(tx.id, 'DELIVERED', buyerToken);
    expect(res.status).toBe(403);
  });

  it('should enforce role: non-admin cannot refund disputed', async () => {
    const tx = await createTransaction();
    await transition(tx.id, 'FUNDED', buyerToken);
    await transition(tx.id, 'DISPUTED', buyerToken);

    const res = await transition(tx.id, 'REFUNDED', buyerToken);
    expect(res.status).toBe(403);
  });

  it('should record state history for each transition', async () => {
    const tx = await createTransaction();
    await transition(tx.id, 'FUNDED', buyerToken);
    await transition(tx.id, 'DELIVERED', providerToken);

    const details = await request(app.getHttpServer() as App)
      .get(`/transactions/${tx.id}`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(details.body.stateHistory).toHaveLength(2);
    expect(details.body.stateHistory[0].fromState).toBe('PENDING');
    expect(details.body.stateHistory[0].toState).toBe('FUNDED');
    expect(details.body.stateHistory[1].fromState).toBe('FUNDED');
    expect(details.body.stateHistory[1].toState).toBe('DELIVERED');
  });
});
