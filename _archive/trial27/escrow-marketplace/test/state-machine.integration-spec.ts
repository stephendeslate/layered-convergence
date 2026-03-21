import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, cleanDatabase, createTestUser, request } from './integration-helper';

describe('State Machine Transitions (Integration)', () => {
  let app: INestApplication;
  let buyerToken: string;
  let providerToken: string;
  let buyerId: string;
  let providerId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);

    const buyer = await createTestUser(app, {
      email: 'buyer@test.com',
      password: 'Password123!',
      name: 'Buyer',
    });
    buyerToken = buyer.token;
    buyerId = buyer.user.id;

    const provider = await createTestUser(app, {
      email: 'provider@test.com',
      password: 'Password123!',
      name: 'Provider',
      role: 'PROVIDER',
    });
    providerToken = provider.token;
    providerId = provider.user.id;
  });

  it('should create a transaction in CREATED status', async () => {
    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        amount: 10000,
        providerId,
        description: 'Test transaction',
      })
      .expect(201);

    expect(res.body.status).toBe('CREATED');
    expect(res.body.amount).toBe(10000);
  });

  it('should transition CREATED -> HELD', async () => {
    const txRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 5000, providerId, description: 'Test' })
      .expect(201);

    const transitionRes = await request(app.getHttpServer())
      .patch(`/transactions/${txRes.body.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'HELD', reason: 'Payment received' })
      .expect(200);

    expect(transitionRes.body.status).toBe('HELD');
  });

  it('should transition HELD -> RELEASED', async () => {
    const txRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 5000, providerId, description: 'Test' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/transactions/${txRes.body.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'HELD', reason: 'Payment received' })
      .expect(200);

    const releaseRes = await request(app.getHttpServer())
      .patch(`/transactions/${txRes.body.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'RELEASED', reason: 'Service completed' })
      .expect(200);

    expect(releaseRes.body.status).toBe('RELEASED');
  });

  it('should reject invalid transition CREATED -> RELEASED', async () => {
    const txRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 5000, providerId, description: 'Test' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/transactions/${txRes.body.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'RELEASED', reason: 'Skip held' })
      .expect(400);
  });

  it('should reject transition from terminal state RELEASED', async () => {
    const txRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 5000, providerId, description: 'Test' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/transactions/${txRes.body.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'HELD', reason: 'Funded' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/transactions/${txRes.body.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'RELEASED', reason: 'Done' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/transactions/${txRes.body.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'HELD', reason: 'Re-hold' })
      .expect(400);
  });

  it('should track state history across transitions', async () => {
    const txRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 5000, providerId, description: 'Test' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/transactions/${txRes.body.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'HELD', reason: 'Funded' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/transactions/${txRes.body.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'RELEASED', reason: 'Complete' })
      .expect(200);

    const historyRes = await request(app.getHttpServer())
      .get(`/transactions/${txRes.body.id}/history`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(200);

    expect(historyRes.body.length).toBeGreaterThanOrEqual(3);
  });
});
