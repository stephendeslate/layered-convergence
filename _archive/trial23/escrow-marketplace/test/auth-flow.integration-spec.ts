import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestUser, generateToken } from './integration-helper';

describe('Auth Flow (Integration)', () => {
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

  it('should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'new@test.com', password: 'password123', name: 'New User' });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('new@test.com');
    expect(res.body.token).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('should register with provider role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'provider@test.com', password: 'password123', name: 'Provider', role: 'PROVIDER' });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('PROVIDER');
  });

  it('should login with valid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'login@test.com', password: 'password123', name: 'Login User' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@test.com');
  });

  it('should reject login with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'wrong@test.com', password: 'password123', name: 'Wrong' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('should reject requests without token', async () => {
    const res = await request(app.getHttpServer())
      .get('/transactions');

    expect(res.status).toBe(401);
  });

  it('should reject requests with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', 'Bearer invalid-token-here');

    expect(res.status).toBe(401);
  });

  it('should access protected resource with valid token', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer@test.com', role: 'BUYER' });
    const token = generateToken(buyer);

    const res = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should enforce role-based access - buyer cannot access admin routes', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer2@test.com', role: 'BUYER' });
    const token = generateToken(buyer);

    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('should allow admin to access admin-only routes', async () => {
    const admin = await createTestUser(prisma, { email: 'admin@test.com', role: 'ADMIN' });
    const token = generateToken(admin);

    const res = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should return user profile via /users/me', async () => {
    const buyer = await createTestUser(prisma, { email: 'profile@test.com', role: 'BUYER' });
    const token = generateToken(buyer);

    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('profile@test.com');
  });

  it('should enforce BUYER role for creating transactions', async () => {
    const provider = await createTestUser(prisma, { email: 'prov@test.com', role: 'PROVIDER' });
    const token = generateToken(provider);

    const res = await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 5000, providerId: provider.id });

    expect(res.status).toBe(403);
  });

  it('should enforce ADMIN role for resolving disputes', async () => {
    const buyer = await createTestUser(prisma, { email: 'buyer3@test.com', role: 'BUYER' });
    const token = generateToken(buyer);

    const res = await request(app.getHttpServer())
      .patch('/disputes/some-id/resolve')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'RESOLVED_BUYER', resolution: 'test' });

    expect(res.status).toBe(403);
  });

  it('should use token from register response to access resources', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'flow@test.com', password: 'password123', name: 'Flow User' });

    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${registerRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('flow@test.com');
  });
});
