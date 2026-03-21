/**
 * E2E tests for the authentication flow.
 * Covers: register, login, token refresh, profile access.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  createE2EApp,
  cleanDatabase,
  registerTenant,
  loginTenant,
  E2EContext,
} from './e2e-helpers';

describe('Auth Flow (E2E)', () => {
  let ctx: E2EContext;

  beforeAll(async () => {
    ctx = await createE2EApp();
  }, 30000);

  afterAll(async () => {
    await cleanDatabase(ctx.prisma);
    await ctx.app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(ctx.prisma);
  });

  it('should register a new tenant and return tokens', async () => {
    const res = await request(ctx.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'New Tenant',
        email: 'new@example.com',
        password: 'SecurePass123!',
      })
      .expect(201);

    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(typeof res.body.data.accessToken).toBe('string');
    expect(typeof res.body.data.refreshToken).toBe('string');
  });

  it('should reject registration with duplicate email', async () => {
    await registerTenant(ctx.app, { email: 'dupe@example.com' });

    const res = await request(ctx.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Duplicate',
        email: 'dupe@example.com',
        password: 'SecurePass123!',
      })
      .expect(409);

    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('should reject registration with short password', async () => {
    await request(ctx.app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Short',
        email: 'short@example.com',
        password: 'abc',
      })
      .expect(400);
  });

  it('should login with valid credentials', async () => {
    await registerTenant(ctx.app, {
      email: 'login@example.com',
      password: 'LoginPass123!',
    });

    const res = await request(ctx.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'LoginPass123!',
      })
      .expect(200);

    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('should reject login with wrong password', async () => {
    await registerTenant(ctx.app, {
      email: 'wrong@example.com',
      password: 'CorrectPass123!',
    });

    await request(ctx.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'WrongPass123!',
      })
      .expect(401);
  });

  it('should reject login with non-existent email', async () => {
    await request(ctx.app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nobody@example.com',
        password: 'NoPass123!',
      })
      .expect(401);
  });

  it('should refresh tokens with valid refresh token', async () => {
    const { refreshToken } = await registerTenant(ctx.app, {
      email: 'refresh@example.com',
    });

    const res = await request(ctx.app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    // Returned tokens should be valid JWT format
    expect(res.body.data.accessToken.split('.')).toHaveLength(3);
    expect(res.body.data.refreshToken.split('.')).toHaveLength(3);
  });

  it('should reject refresh with invalid token', async () => {
    await request(ctx.app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);
  });

  it('should get profile with valid access token', async () => {
    const { accessToken } = await registerTenant(ctx.app, {
      name: 'Profile Test',
      email: 'profile@example.com',
    });

    const res = await request(ctx.app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data.name).toBe('Profile Test');
    expect(res.body.data.email).toBe('profile@example.com');
    expect(res.body.data.tier).toBe('FREE');
    // Sensitive fields must not be returned
    expect(res.body.data).not.toHaveProperty('passwordHash');
    expect(res.body.data).not.toHaveProperty('emailVerifyToken');
  });

  it('should reject profile access without token', async () => {
    await request(ctx.app.getHttpServer())
      .get('/api/auth/me')
      .expect(401);
  });

  it('should reject profile access with invalid token', async () => {
    await request(ctx.app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
