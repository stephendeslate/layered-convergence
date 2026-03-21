import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, cleanDatabase, createTestUser, request } from './integration-helper';

describe('Auth Flow (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
  });

  it('should register a new user and return token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'new@test.com',
        password: 'Password123!',
        name: 'New User',
      })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('new@test.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should login with valid credentials', async () => {
    await createTestUser(app, {
      email: 'login@test.com',
      password: 'Password123!',
      name: 'Login User',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'login@test.com',
        password: 'Password123!',
      })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@test.com');
  });

  it('should reject login with wrong password', async () => {
    await createTestUser(app, {
      email: 'wrong@test.com',
      password: 'Password123!',
      name: 'Wrong Pass',
    });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wrong@test.com',
        password: 'WrongPassword!',
      })
      .expect(401);
  });

  it('should reject login for non-existent user', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'Password123!',
      })
      .expect(401);
  });

  it('should reject requests without auth token', async () => {
    await request(app.getHttpServer())
      .get('/users/me')
      .expect(401);
  });

  it('should reject requests with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer invalid-token-here')
      .expect(401);
  });

  it('should allow authenticated access to protected routes', async () => {
    const { token } = await createTestUser(app, {
      email: 'auth@test.com',
      password: 'Password123!',
      name: 'Auth User',
    });

    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.email).toBe('auth@test.com');
  });

  it('should enforce role-based access control', async () => {
    const { token } = await createTestUser(app, {
      email: 'buyer@test.com',
      password: 'Password123!',
      name: 'Buyer',
    });

    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('should allow admin access to admin-only routes', async () => {
    const { token } = await createTestUser(app, {
      email: 'admin@test.com',
      password: 'Password123!',
      name: 'Admin',
      role: 'ADMIN',
    });

    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
