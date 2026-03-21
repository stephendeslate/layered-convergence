/**
 * E2E tests — Auth flow: register, login, token refresh, role-based access.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createTestApp,
  closeTestApp,
  cleanDatabase,
  registerUser,
  loginUser,
  createAdminUser,
  TestApp,
} from './setup';

describe('Auth E2E', () => {
  let t: TestApp;

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase(t.prisma);
  });

  // ─── Registration ───────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    it('should register a buyer and return tokens', async () => {
      const result = await registerUser(t.request, {
        email: 'buyer@e2e.test',
        password: 'BuyerPass123',
        displayName: 'Test Buyer',
        role: 'BUYER',
      });

      expect(result.user.email).toBe('buyer@e2e.test');
      expect(result.user.role).toBe('BUYER');
      expect(result.tokens.accessToken).toBeTruthy();
      expect(result.tokens.refreshToken).toBeTruthy();
    });

    it('should register a provider and return tokens', async () => {
      const result = await registerUser(t.request, {
        email: 'provider@e2e.test',
        password: 'ProviderPass123',
        displayName: 'Test Provider',
        role: 'PROVIDER',
      });

      expect(result.user.email).toBe('provider@e2e.test');
      expect(result.user.role).toBe('PROVIDER');
    });

    it('should reject duplicate email', async () => {
      await registerUser(t.request, {
        email: 'dup@e2e.test',
        password: 'DupPass12345',
        displayName: 'First',
        role: 'BUYER',
      });

      const res = await t.request
        .post('/api/v1/auth/register')
        .send({
          email: 'dup@e2e.test',
          password: 'DupPass12345',
          displayName: 'Second',
          role: 'BUYER',
        })
        .expect(409);

      expect(res.body.message).toContain('already registered');
    });

    it('should validate required fields', async () => {
      const res = await t.request
        .post('/api/v1/auth/register')
        .send({ email: 'bad' }) // missing password, displayName, role
        .expect(400);

      expect(res.body.statusCode).toBe(400);
    });

    it('should reject password shorter than 8 characters', async () => {
      await t.request
        .post('/api/v1/auth/register')
        .send({
          email: 'short@e2e.test',
          password: 'short',
          displayName: 'Short Pass',
          role: 'BUYER',
        })
        .expect(400);
    });
  });

  // ─── Login ──────────────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      await registerUser(t.request, {
        email: 'login@e2e.test',
        password: 'LoginPass123',
        displayName: 'Login User',
        role: 'BUYER',
      });

      const result = await loginUser(t.request, 'login@e2e.test', 'LoginPass123');
      expect(result.user.email).toBe('login@e2e.test');
      expect(result.tokens.accessToken).toBeTruthy();
    });

    it('should reject invalid password', async () => {
      await registerUser(t.request, {
        email: 'wrongpw@e2e.test',
        password: 'RealPass1234',
        displayName: 'Wrong PW User',
        role: 'BUYER',
      });

      await t.request
        .post('/api/v1/auth/login')
        .send({ email: 'wrongpw@e2e.test', password: 'WrongPass123' })
        .expect(401);
    });

    it('should reject non-existent email', async () => {
      await t.request
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@e2e.test', password: 'SomePass123' })
        .expect(401);
    });
  });

  // ─── Token Refresh ──────────────────────────────────────────────────────────

  describe('POST /api/v1/auth/refresh', () => {
    it('should return new tokens with valid refresh token', async () => {
      const registration = await registerUser(t.request, {
        email: 'refresh@e2e.test',
        password: 'RefreshPass123',
        displayName: 'Refresh User',
        role: 'BUYER',
      });

      const res = await t.request
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: registration.tokens.refreshToken })
        .expect(200);

      expect(res.body.accessToken).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();
      // New tokens should be different from original
      expect(res.body.accessToken).not.toBe(registration.tokens.accessToken);
    });

    it('should reject invalid refresh token', async () => {
      await t.request
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);
    });
  });

  // ─── Role-based Access ──────────────────────────────────────────────────────

  describe('Role-based access control', () => {
    it('should deny unauthenticated access to protected endpoints', async () => {
      await t.request.get('/api/v1/transactions').expect(401);
    });

    it('should deny buyer access to admin endpoints', async () => {
      const buyer = await registerUser(t.request, {
        email: 'buyer-rbac@e2e.test',
        password: 'BuyerPass123',
        displayName: 'RBAC Buyer',
        role: 'BUYER',
      });

      await t.request
        .get('/api/v1/admin/transactions')
        .set('Authorization', `Bearer ${buyer.tokens.accessToken}`)
        .expect(403);
    });

    it('should deny buyer access to provider endpoints', async () => {
      const buyer = await registerUser(t.request, {
        email: 'buyer-prov@e2e.test',
        password: 'BuyerPass123',
        displayName: 'Provider Access Buyer',
        role: 'BUYER',
      });

      await t.request
        .post('/api/v1/providers/onboard')
        .set('Authorization', `Bearer ${buyer.tokens.accessToken}`)
        .expect(403);
    });

    it('should deny provider access to buyer-only endpoints (create transaction)', async () => {
      const provider = await registerUser(t.request, {
        email: 'provider-buy@e2e.test',
        password: 'ProviderPass123',
        displayName: 'Buy Access Provider',
        role: 'PROVIDER',
      });

      await t.request
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${provider.tokens.accessToken}`)
        .send({
          providerId: 'some-id',
          amount: 5000,
          description: 'test transaction for access check',
        })
        .expect(403);
    });

    it('should allow admin access to admin endpoints', async () => {
      const admin = await createAdminUser(t.prisma, t.request);

      const res = await t.request
        .get('/api/v1/admin/transactions')
        .set('Authorization', `Bearer ${admin.tokens.accessToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('total');
    });

    it('should deny provider access to admin endpoints', async () => {
      const provider = await registerUser(t.request, {
        email: 'prov-admin@e2e.test',
        password: 'ProviderPass123',
        displayName: 'Admin Access Provider',
        role: 'PROVIDER',
      });

      await t.request
        .get('/api/v1/admin/transactions')
        .set('Authorization', `Bearer ${provider.tokens.accessToken}`)
        .expect(403);
    });
  });
});
