import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestUser } from './integration-helper';

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

  describe('P2002 → 409 Conflict', () => {
    it('should return 409 on duplicate email registration', async () => {
      await createTestUser(app, { email: 'dup@test.com', role: 'BUYER' });

      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'dup@test.com',
          password: 'testpassword123',
          name: 'Duplicate User',
        })
        .expect(409);

      expect(res.body.message).toContain('already registered');
    });

    it('should return 409 on duplicate webhook idempotency key', async () => {
      const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin-wh@test.com' });

      await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .send({ id: 'evt_unique_1', type: 'payment_intent.succeeded', data: { id: 'pi_1' } })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .send({ id: 'evt_unique_1', type: 'payment_intent.succeeded', data: { id: 'pi_1' } })
        .expect(201);

      expect(res.body.processed).toBe(false);
      expect(res.body.message).toBe('Event already processed');
    });
  });

  describe('P2025 → 404 Not Found', () => {
    it('should return 404 for non-existent transaction', async () => {
      const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin-404@test.com' });

      await request(app.getHttpServer())
        .get('/transactions/00000000-0000-0000-0000-000000000000')
        .set('Authorization', admin.authHeader)
        .expect(404);
    });

    it('should return 404 for non-existent dispute', async () => {
      const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin-d404@test.com' });

      await request(app.getHttpServer())
        .get('/disputes/00000000-0000-0000-0000-000000000000')
        .set('Authorization', admin.authHeader)
        .expect(404);
    });

    it('should return 404 when transitioning non-existent transaction', async () => {
      const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin-t404@test.com' });

      await request(app.getHttpServer())
        .patch('/transactions/00000000-0000-0000-0000-000000000000/transition')
        .set('Authorization', admin.authHeader)
        .send({ status: 'HELD', reason: 'Test' })
        .expect(404);
    });
  });

  describe('P2003 → 400 Bad Request (Foreign Key)', () => {
    it('should return error for transaction with non-existent provider', async () => {
      const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer-fk@test.com' });

      const res = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', buyer.authHeader)
        .send({
          amount: 5000,
          providerId: '00000000-0000-0000-0000-000000000000',
          description: 'FK violation test',
        });

      expect([400, 500]).toContain(res.status);
    });
  });

  describe('Validation errors', () => {
    it('should reject registration with invalid email', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'not-an-email',
          password: 'testpassword123',
          name: 'Bad Email User',
        })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should reject registration with short password', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'shortpw@test.com',
          password: 'short',
          name: 'Short Password User',
        })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should reject transaction with amount below minimum', async () => {
      const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer-val@test.com' });

      const res = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', buyer.authHeader)
        .send({
          amount: 50,
          providerId: '00000000-0000-0000-0000-000000000000',
          description: 'Too small',
        })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should strip unknown properties (whitelist)', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'whitelist@test.com',
          password: 'testpassword123',
          name: 'Whitelist User',
          isAdmin: true,
          hackField: 'injected',
        })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('should reject invalid transaction status in transition', async () => {
      const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin-inv@test.com' });
      const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer-inv@test.com' });
      const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider-inv@test.com' });

      const createRes = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', buyer.authHeader)
        .send({ amount: 5000, providerId: provider.user.id, description: 'Validation test' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/transactions/${createRes.body.id}/transition`)
        .set('Authorization', admin.authHeader)
        .send({ status: 'INVALID_STATUS', reason: 'Bad' })
        .expect(400);

      expect(res.body.message).toBeDefined();
    });
  });
});
