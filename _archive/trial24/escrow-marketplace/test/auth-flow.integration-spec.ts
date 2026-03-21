import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, getAuthHeader } from './integration-helper';

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

  it('should register a new user and return token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'new@test.com', password: 'password123', name: 'New User' });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe('new@test.com');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should login with correct credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'login@test.com', password: 'password123', name: 'Login User' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login@test.com');
  });

  it('should reject login with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'wrong@test.com', password: 'password123', name: 'Wrong' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'noone@test.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('should protect routes without token', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me');

    expect(res.status).toBe(401);
  });

  it('should allow access to protected routes with valid token', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'authed@test.com', password: 'password123', name: 'Authed' });
    const token = registerRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set(getAuthHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('authed@test.com');
  });

  it('should reject access with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set(getAuthHeader('invalid-token'));

    expect(res.status).toBe(401);
  });

  it('should enforce role-based access (ADMIN only)', async () => {
    const buyerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'buyer-role@test.com', password: 'password123', name: 'Buyer' });
    const buyerToken = buyerRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/users')
      .set(getAuthHeader(buyerToken));

    expect(res.status).toBe(403);
  });

  it('should allow ADMIN access to admin routes', async () => {
    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'admin-role@test.com', password: 'password123', name: 'Admin', role: 'ADMIN' });
    const adminToken = adminRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/users')
      .set(getAuthHeader(adminToken));

    expect(res.status).toBe(200);
  });
});
