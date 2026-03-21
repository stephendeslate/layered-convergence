import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, getAuthHeader } from './integration-helper';

describe('Prisma Error Handling (integration)', () => {
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

  it('should return 409 for duplicate email registration (P2002)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'dup@test.com', password: 'password123', name: 'First' });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'dup@test.com', password: 'password123', name: 'Second' });

    expect(res.status).toBe(409);
  });

  it('should return 404 for non-existent transaction (P2025 / NotFoundException)', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'lookup@test.com', password: 'password123', name: 'Lookup' });
    const token = registerRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/transactions/00000000-0000-0000-0000-000000000000')
      .set(getAuthHeader(token));

    expect(res.status).toBe(404);
  });

  it('should return 404 for non-existent user', async () => {
    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'password123', name: 'Admin', role: 'ADMIN' });
    const adminToken = adminRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/users/00000000-0000-0000-0000-000000000000')
      .set(getAuthHeader(adminToken));

    expect(res.status).toBe(404);
  });

  it('should return 409 for duplicate webhook idempotency key', async () => {
    const event = { id: 'evt-dup-1', type: 'payment_intent.succeeded', data: { id: 'pi-1' } };

    const res1 = await request(app.getHttpServer())
      .post('/webhooks/stripe')
      .send(event);
    expect(res1.status).toBe(201);
    expect(res1.body.processed).toBe(true);

    const res2 = await request(app.getHttpServer())
      .post('/webhooks/stripe')
      .send(event);
    expect(res2.body.processed).toBe(false);
  });

  it('should validate request body and return 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('should reject unknown fields with forbidNonWhitelisted', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'valid@test.com',
        password: 'password123',
        name: 'Valid',
        hackField: 'malicious',
      });

    expect(res.status).toBe(400);
  });
});
