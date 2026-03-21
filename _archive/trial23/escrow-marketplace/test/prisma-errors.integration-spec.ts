import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestUser, generateToken } from './integration-helper';

describe('Prisma Error Handling (Integration)', () => {
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

  it('should return 409 on duplicate email registration (P2002)', async () => {
    const res1 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'duplicate@test.com', password: 'password123', name: 'First' });

    expect(res1.status).toBe(201);

    const res2 = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'duplicate@test.com', password: 'password123', name: 'Second' });

    expect(res2.status).toBe(409);
  });

  it('should return 404 for non-existent transaction (P2025 equivalent)', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer1@test.com', role: 'BUYER' });
    const token = generateToken(buyer);

    const res = await request(app.getHttpServer())
      .get('/transactions/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent user', async () => {
    const admin = await createTestUser(prisma, { email: 'admin1@test.com', role: 'ADMIN' });
    const token = generateToken(admin);

    const res = await request(app.getHttpServer())
      .get('/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent dispute', async () => {
    const admin = await createTestUser(prisma, { email: 'admin2@test.com', role: 'ADMIN' });
    const token = generateToken(admin);

    const res = await request(app.getHttpServer())
      .get('/disputes/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent payout', async () => {
    const admin = await createTestUser(prisma, { email: 'admin3@test.com', role: 'ADMIN' });
    const token = generateToken(admin);

    const res = await request(app.getHttpServer())
      .get('/payouts/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should handle duplicate webhook idempotency key (P2002)', async () => {
    const res1 = await request(app.getHttpServer())
      .post('/webhooks/stripe')
      .send({ id: 'evt_duplicate', type: 'payment_intent.succeeded', data: { object: { id: 'pi_1' } } });

    expect(res1.status).toBe(201);
    expect(res1.body.processed).toBe(true);

    const res2 = await request(app.getHttpServer())
      .post('/webhooks/stripe')
      .send({ id: 'evt_duplicate', type: 'payment_intent.succeeded', data: { object: { id: 'pi_1' } } });

    expect(res2.status).toBe(201);
    expect(res2.body.processed).toBe(false);
  });

  it('should return 400 for validation errors', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer2@test.com', role: 'BUYER' });
    const token = generateToken(buyer);

    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: -100, providerId: 'not-a-uuid' });

    expect(res.status).toBe(400);
  });

  it('should reject extra fields with forbidNonWhitelisted', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'password123',
        name: 'Test',
        hackerField: 'malicious',
      });

    expect(res.status).toBe(400);
  });
});
