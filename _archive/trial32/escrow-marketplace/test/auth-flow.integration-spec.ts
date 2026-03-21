import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestUser } from './integration-helper';

describe('Auth Flow (integration)', () => {
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

  describe('Registration', () => {
    it('should register a new user and return token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@test.com',
          password: 'testpassword123',
          name: 'New User',
        })
        .expect(201);

      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('new@test.com');
      expect(res.body.user.name).toBe('New User');
      expect(res.body.user.role).toBe('BUYER');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should register with a specified role', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@test.com',
          password: 'testpassword123',
          name: 'Admin User',
          role: 'ADMIN',
        })
        .expect(201);

      expect(res.body.user.role).toBe('ADMIN');
    });

    it('should reject duplicate email registration', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'dup@test.com',
          password: 'testpassword123',
          name: 'First User',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'dup@test.com',
          password: 'testpassword123',
          name: 'Second User',
        })
        .expect(409);
    });
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser(app, { email: 'login@test.com', password: 'testpassword123' });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@test.com',
          password: 'testpassword123',
        })
        .expect(201);

      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('login@test.com');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should reject login with wrong password', async () => {
      await createTestUser(app, { email: 'wrongpw@test.com', password: 'testpassword123' });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrongpw@test.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject login with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nouser@test.com',
          password: 'testpassword123',
        })
        .expect(401);
    });
  });

  describe('JWT Authentication', () => {
    it('should allow access to protected routes with valid token', async () => {
      const buyer = await createTestUser(app, { role: 'BUYER', email: 'authed@test.com' });

      const res = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', buyer.authHeader)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should reject access without token', async () => {
      await request(app.getHttpServer())
        .get('/transactions')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', 'Bearer invalid-token-value')
        .expect(401);
    });

    it('should reject access with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', 'NotBearer sometoken')
        .expect(401);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow BUYER to create transactions', async () => {
      const buyer = await createTestUser(app, { role: 'BUYER', email: 'buyer-rbac@test.com' });
      const provider = await createTestUser(app, { role: 'PROVIDER', email: 'provider-rbac@test.com' });

      const res = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', buyer.authHeader)
        .send({ amount: 5000, providerId: provider.user.id, description: 'RBAC test' })
        .expect(201);

      expect(res.body.amount).toBe(5000);
    });

    it('should reject PROVIDER from creating transactions', async () => {
      const provider = await createTestUser(app, { role: 'PROVIDER', email: 'prov-create@test.com' });

      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', provider.authHeader)
        .send({ amount: 5000, providerId: provider.user.id, description: 'Not allowed' })
        .expect(403);
    });

    it('should reject ADMIN from creating transactions', async () => {
      const admin = await createTestUser(app, { role: 'ADMIN', email: 'admin-create@test.com' });
      const provider = await createTestUser(app, { role: 'PROVIDER', email: 'prov-c@test.com' });

      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', admin.authHeader)
        .send({ amount: 5000, providerId: provider.user.id, description: 'Not allowed' })
        .expect(403);
    });

    it('should allow public access to auth endpoints', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'public@test.com',
          password: 'testpassword123',
          name: 'Public User',
        })
        .expect(201);

      expect(res.body.token).toBeDefined();
    });

    it('should allow public access to webhook endpoint', async () => {
      const res = await request(app.getHttpServer())
        .post('/webhooks/stripe')
        .send({
          id: 'evt_public_1',
          type: 'payment_intent.succeeded',
          data: { id: 'pi_1' },
        })
        .expect(201);

      expect(res.body.processed).toBeDefined();
    });

    it('should scope BUYER to see only their transactions', async () => {
      const buyer1 = await createTestUser(app, { role: 'BUYER', email: 'b1-scope@test.com' });
      const buyer2 = await createTestUser(app, { role: 'BUYER', email: 'b2-scope@test.com' });
      const provider = await createTestUser(app, { role: 'PROVIDER', email: 'p-scope@test.com' });

      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', buyer1.authHeader)
        .send({ amount: 5000, providerId: provider.user.id, description: 'Buyer 1 tx' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', buyer2.authHeader)
        .send({ amount: 7000, providerId: provider.user.id, description: 'Buyer 2 tx' })
        .expect(201);

      const res1 = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', buyer1.authHeader)
        .expect(200);

      expect(res1.body).toHaveLength(1);
      expect(res1.body[0].description).toBe('Buyer 1 tx');

      const res2 = await request(app.getHttpServer())
        .get('/transactions')
        .set('Authorization', buyer2.authHeader)
        .expect(200);

      expect(res2.body).toHaveLength(1);
      expect(res2.body[0].description).toBe('Buyer 2 tx');
    });
  });

  describe('Token payload', () => {
    it('should include correct claims in JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'claims@test.com',
          password: 'testpassword123',
          name: 'Claims User',
          role: 'PROVIDER',
        })
        .expect(201);

      const token = res.body.token;
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      expect(payload.sub).toBeDefined();
      expect(payload.email).toBe('claims@test.com');
      expect(payload.role).toBe('PROVIDER');
      expect(payload.tenantId).toBeDefined();
      expect(payload.exp).toBeDefined();
    });
  });
});
