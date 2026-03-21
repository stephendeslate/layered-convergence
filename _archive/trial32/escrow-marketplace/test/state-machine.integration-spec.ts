import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestUser } from './integration-helper';

describe('State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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

  async function createTransactionInStatus(
    status: string,
    buyerAuth: string,
    adminAuth: string,
    providerId: string,
  ): Promise<string> {
    const createRes = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', buyerAuth)
      .send({ amount: 10000, providerId, description: 'Test' })
      .expect(201);

    const txId = createRes.body.id;

    if (status === 'CREATED') return txId;

    await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', adminAuth)
      .send({ status: 'HELD', reason: 'Payment received' })
      .expect(200);

    if (status === 'HELD') return txId;

    if (status === 'DISPUTED') {
      await request(app.getHttpServer())
        .patch(`/transactions/${txId}/transition`)
        .set('Authorization', adminAuth)
        .send({ status: 'DISPUTED', reason: 'Issue raised' })
        .expect(200);
      return txId;
    }

    if (status === 'RELEASED') {
      await request(app.getHttpServer())
        .patch(`/transactions/${txId}/transition`)
        .set('Authorization', adminAuth)
        .send({ status: 'RELEASED', reason: 'Completed' })
        .expect(200);
      return txId;
    }

    if (status === 'REFUNDED') {
      await request(app.getHttpServer())
        .patch(`/transactions/${txId}/transition`)
        .set('Authorization', adminAuth)
        .send({ status: 'REFUNDED', reason: 'Refund issued' })
        .expect(200);
      return txId;
    }

    return txId;
  }

  it('should transition CREATED → HELD', async () => {
    const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer1@test.com' });
    const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider1@test.com' });
    const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin1@test.com' });

    const txId = await createTransactionInStatus('CREATED', buyer.authHeader, admin.authHeader, provider.user.id);

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', admin.authHeader)
      .send({ status: 'HELD', reason: 'Payment received' })
      .expect(200);

    expect(res.body.status).toBe('HELD');
  });

  it('should transition HELD → RELEASED', async () => {
    const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer2@test.com' });
    const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider2@test.com' });
    const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin2@test.com' });

    const txId = await createTransactionInStatus('HELD', buyer.authHeader, admin.authHeader, provider.user.id);

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', admin.authHeader)
      .send({ status: 'RELEASED', reason: 'Service completed' })
      .expect(200);

    expect(res.body.status).toBe('RELEASED');
  });

  it('should transition HELD → DISPUTED', async () => {
    const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer3@test.com' });
    const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider3@test.com' });
    const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin3@test.com' });

    const txId = await createTransactionInStatus('HELD', buyer.authHeader, admin.authHeader, provider.user.id);

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', admin.authHeader)
      .send({ status: 'DISPUTED', reason: 'Quality issue' })
      .expect(200);

    expect(res.body.status).toBe('DISPUTED');
  });

  it('should transition HELD → REFUNDED', async () => {
    const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer4@test.com' });
    const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider4@test.com' });
    const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin4@test.com' });

    const txId = await createTransactionInStatus('HELD', buyer.authHeader, admin.authHeader, provider.user.id);

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', admin.authHeader)
      .send({ status: 'REFUNDED', reason: 'Cancelled' })
      .expect(200);

    expect(res.body.status).toBe('REFUNDED');
  });

  it('should transition DISPUTED → RELEASED', async () => {
    const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer5@test.com' });
    const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider5@test.com' });
    const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin5@test.com' });

    const txId = await createTransactionInStatus('DISPUTED', buyer.authHeader, admin.authHeader, provider.user.id);

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', admin.authHeader)
      .send({ status: 'RELEASED', reason: 'Dispute resolved for provider' })
      .expect(200);

    expect(res.body.status).toBe('RELEASED');
  });

  it('should transition DISPUTED → REFUNDED', async () => {
    const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer6@test.com' });
    const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider6@test.com' });
    const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin6@test.com' });

    const txId = await createTransactionInStatus('DISPUTED', buyer.authHeader, admin.authHeader, provider.user.id);

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', admin.authHeader)
      .send({ status: 'REFUNDED', reason: 'Dispute resolved for buyer' })
      .expect(200);

    expect(res.body.status).toBe('REFUNDED');
  });

  it('should reject invalid transition CREATED → RELEASED', async () => {
    const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer7@test.com' });
    const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider7@test.com' });
    const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin7@test.com' });

    const txId = await createTransactionInStatus('CREATED', buyer.authHeader, admin.authHeader, provider.user.id);

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', admin.authHeader)
      .send({ status: 'RELEASED', reason: 'Skip to release' })
      .expect(400);

    expect(res.body.message).toContain('Invalid state transition');
  });

  it('should reject invalid transition RELEASED → HELD', async () => {
    const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer8@test.com' });
    const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider8@test.com' });
    const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin8@test.com' });

    const txId = await createTransactionInStatus('RELEASED', buyer.authHeader, admin.authHeader, provider.user.id);

    const res = await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', admin.authHeader)
      .send({ status: 'HELD', reason: 'Reversal' })
      .expect(400);

    expect(res.body.message).toContain('Invalid state transition');
  });

  it('should record state history for each transition', async () => {
    const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer9@test.com' });
    const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider9@test.com' });
    const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin9@test.com' });

    const txId = await createTransactionInStatus('HELD', buyer.authHeader, admin.authHeader, provider.user.id);

    await request(app.getHttpServer())
      .patch(`/transactions/${txId}/transition`)
      .set('Authorization', admin.authHeader)
      .send({ status: 'RELEASED', reason: 'Done' })
      .expect(200);

    const historyRes = await request(app.getHttpServer())
      .get(`/transactions/${txId}/history`)
      .set('Authorization', admin.authHeader)
      .expect(200);

    expect(historyRes.body.length).toBeGreaterThanOrEqual(3);

    const states = historyRes.body.map((h: any) => h.toState);
    expect(states).toContain('CREATED');
    expect(states).toContain('HELD');
    expect(states).toContain('RELEASED');
  });

  it('should calculate platform fee on creation', async () => {
    const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer10@test.com' });
    const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider10@test.com' });

    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', buyer.authHeader)
      .send({ amount: 10000, providerId: provider.user.id, description: 'Fee test' })
      .expect(201);

    expect(res.body.platformFee).toBe(500);
    expect(res.body.amount).toBe(10000);
  });
});
