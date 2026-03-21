import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, getAuthHeader } from './integration-helper';

describe('State Machine Transitions (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let buyerToken: string;
  let providerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  async function registerUser(email: string, role: string) {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: `User ${role}`, role });
    return res.body.token;
  }

  async function createTransaction(token: string, providerId: string) {
    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set(getAuthHeader(token))
      .send({ amount: 10000, providerId, description: 'Test transaction' });
    return res.body;
  }

  it('should allow CREATED -> HELD -> RELEASED transition via HTTP', async () => {
    buyerToken = await registerUser('buyer@test.com', 'BUYER');
    providerToken = await registerUser('provider@test.com', 'PROVIDER');
    adminToken = await registerUser('admin@test.com', 'ADMIN');

    const providerRes = await request(app.getHttpServer())
      .get('/users/me')
      .set(getAuthHeader(providerToken));
    const providerId = providerRes.body.id;

    const tx = await createTransaction(buyerToken, providerId);
    expect(tx.status).toBe('CREATED');

    const heldRes = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set(getAuthHeader(buyerToken))
      .send({ status: 'HELD' });
    expect(heldRes.status).toBe(200);
    expect(heldRes.body.status).toBe('HELD');

    const releasedRes = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set(getAuthHeader(buyerToken))
      .send({ status: 'RELEASED', reason: 'Service completed' });
    expect(releasedRes.status).toBe(200);
    expect(releasedRes.body.status).toBe('RELEASED');
  });

  it('should reject invalid state transitions via HTTP', async () => {
    buyerToken = await registerUser('buyer2@test.com', 'BUYER');
    providerToken = await registerUser('provider2@test.com', 'PROVIDER');

    const providerRes = await request(app.getHttpServer())
      .get('/users/me')
      .set(getAuthHeader(providerToken));
    const providerId = providerRes.body.id;

    const tx = await createTransaction(buyerToken, providerId);

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set(getAuthHeader(buyerToken))
      .send({ status: 'RELEASED' });

    expect(res.status).toBe(400);
  });

  it('should record state history for transitions', async () => {
    buyerToken = await registerUser('buyer3@test.com', 'BUYER');
    providerToken = await registerUser('provider3@test.com', 'PROVIDER');

    const providerRes = await request(app.getHttpServer())
      .get('/users/me')
      .set(getAuthHeader(providerToken));
    const providerId = providerRes.body.id;

    const tx = await createTransaction(buyerToken, providerId);

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set(getAuthHeader(buyerToken))
      .send({ status: 'HELD' });

    const historyRes = await request(app.getHttpServer())
      .get(`/transactions/${tx.id}/history`)
      .set(getAuthHeader(buyerToken));

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should allow HELD -> DISPUTED -> REFUNDED transition', async () => {
    buyerToken = await registerUser('buyer4@test.com', 'BUYER');
    providerToken = await registerUser('provider4@test.com', 'PROVIDER');
    adminToken = await registerUser('admin4@test.com', 'ADMIN');

    const providerRes = await request(app.getHttpServer())
      .get('/users/me')
      .set(getAuthHeader(providerToken));
    const providerId = providerRes.body.id;

    const tx = await createTransaction(buyerToken, providerId);

    await request(app.getHttpServer())
      .patch(`/transactions/${tx.id}/transition`)
      .set(getAuthHeader(buyerToken))
      .send({ status: 'HELD' });

    const disputeRes = await request(app.getHttpServer())
      .post('/disputes')
      .set(getAuthHeader(buyerToken))
      .send({ transactionId: tx.id, reason: 'Bad service' });
    expect(disputeRes.status).toBe(201);

    const resolveRes = await request(app.getHttpServer())
      .patch(`/disputes/${disputeRes.body.id}/resolve`)
      .set(getAuthHeader(adminToken))
      .send({ status: 'RESOLVED_BUYER', resolution: 'Full refund' });
    expect(resolveRes.status).toBe(200);

    const txRes = await request(app.getHttpServer())
      .get(`/transactions/${tx.id}`)
      .set(getAuthHeader(buyerToken));
    expect(txRes.body.status).toBe('REFUNDED');
  });
});
