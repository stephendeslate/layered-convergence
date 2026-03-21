import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestUser, generateToken } from './integration-helper';

describe('State Machine Transitions (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    prisma = setup.prisma;
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  it('should create transaction in CREATED status', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer1@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider1@test.com', role: 'PROVIDER' });
    const token = generateToken(buyer);

    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, providerId: provider.id });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('CREATED');
    expect(res.body.amount).toBe(5000);
  });

  it('should transition CREATED -> HELD', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer2@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider2@test.com', role: 'PROVIDER' });
    const token = generateToken(buyer);

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, providerId: provider.id });

    const transitionRes = await request(app.getHttpServer())
      .patch(`/transactions/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'HELD' });

    expect(transitionRes.status).toBe(200);
    expect(transitionRes.body.status).toBe('HELD');
  });

  it('should transition HELD -> RELEASED', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer3@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider3@test.com', role: 'PROVIDER' });
    const token = generateToken(buyer);

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, providerId: provider.id });

    await request(app.getHttpServer())
      .patch(`/transactions/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'HELD' });

    const releaseRes = await request(app.getHttpServer())
      .patch(`/transactions/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RELEASED', reason: 'Service delivered' });

    expect(releaseRes.status).toBe(200);
    expect(releaseRes.body.status).toBe('RELEASED');
  });

  it('should reject invalid transition CREATED -> RELEASED', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer4@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider4@test.com', role: 'PROVIDER' });
    const token = generateToken(buyer);

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, providerId: provider.id });

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RELEASED' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid state transition');
  });

  it('should reject transitions from terminal states', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer5@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider5@test.com', role: 'PROVIDER' });
    const token = generateToken(buyer);

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, providerId: provider.id });

    await request(app.getHttpServer())
      .patch(`/transactions/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'HELD' });

    await request(app.getHttpServer())
      .patch(`/transactions/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RELEASED' });

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'HELD' });

    expect(res.status).toBe(400);
  });

  it('should record state history on transitions', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer6@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider6@test.com', role: 'PROVIDER' });
    const token = generateToken(buyer);

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, providerId: provider.id });

    await request(app.getHttpServer())
      .patch(`/transactions/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'HELD' });

    const historyRes = await request(app.getHttpServer())
      .get(`/transactions/${createRes.body.id}/history`)
      .set('Authorization', `Bearer ${token}`);

    expect(historyRes.status).toBe(200);
    expect(historyRes.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should transition HELD -> DISPUTED -> REFUNDED via dispute flow', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer7@test.com', role: 'BUYER' });
    const provider = await createTestUser(prisma, { email: 'provider7@test.com', role: 'PROVIDER' });
    const admin = await createTestUser(prisma, { email: 'admin7@test.com', role: 'ADMIN' });
    const buyerToken = generateToken(buyer);
    const adminToken = generateToken(admin);

    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ amount: 5000, providerId: provider.id });

    await request(app.getHttpServer())
      .patch(`/transactions/${createRes.body.id}/transition`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'HELD' });

    const disputeRes = await request(app.getHttpServer())
      .post('/disputes')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ transactionId: createRes.body.id, reason: 'Service not delivered' });

    expect(disputeRes.status).toBe(201);

    const resolveRes = await request(app.getHttpServer())
      .patch(`/disputes/${disputeRes.body.id}/resolve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'RESOLVED_BUYER', resolution: 'Buyer is correct, refunding' });

    expect(resolveRes.status).toBe(200);

    const txRes = await request(app.getHttpServer())
      .get(`/transactions/${createRes.body.id}`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(txRes.body.status).toBe('REFUNDED');
  });
});
