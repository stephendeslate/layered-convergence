import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { App } from 'supertest/types.js';

describe('Auth Flow (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "transaction_state_histories", "disputes", "payouts", "webhook_logs", "transactions", "stripe_connected_accounts", "users" CASCADE`;
  });

  it('should return 401 when accessing protected route without auth', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/transactions');
    expect(res.status).toBe(401);
  });

  it('should return 401 with invalid token', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/transactions')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });

  it('should return 200 with valid auth token', async () => {
    const registerRes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'auth@test.com', name: 'Auth User', role: 'BUYER', password: 'password123' });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeDefined();

    const res = await request(app.getHttpServer() as App)
      .get('/transactions')
      .set('Authorization', `Bearer ${registerRes.body.token}`);
    expect(res.status).toBe(200);
  });

  it('should register and login successfully', async () => {
    await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'login@test.com', name: 'Login User', role: 'BUYER', password: 'password123' })
      .expect(201);

    const loginRes = await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({ email: 'login@test.com', password: 'password123' });
    expect(loginRes.status).toBe(201);
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.email).toBe('login@test.com');
  });

  it('should reject login with wrong password', async () => {
    await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'wrong@test.com', name: 'Wrong', role: 'BUYER', password: 'password123' });

    const res = await request(app.getHttpServer() as App)
      .post('/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('should verify database state after registration', async () => {
    const registerRes = await request(app.getHttpServer() as App)
      .post('/auth/register')
      .send({ email: 'dbcheck@test.com', name: 'DB Check', role: 'BUYER', password: 'password123' });

    expect(registerRes.status).toBe(201);

    // Verify database state
    // findFirst annotated: email is unique, safe single-result lookup
    const user = await prisma.user.findFirst({
      where: { email: 'dbcheck@test.com' },
    });
    expect(user).not.toBeNull();
    expect(user!.name).toBe('DB Check');
    expect(user!.role).toBe('BUYER');
  });

  it('should return 401 with malformed base64 token', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/transactions')
      .set('Authorization', 'Bearer !!!not-base64!!!');
    expect(res.status).toBe(401);
  });

  it('should return 401 without Bearer prefix', async () => {
    const res = await request(app.getHttpServer() as App)
      .get('/transactions')
      .set('Authorization', 'Basic sometoken');
    expect(res.status).toBe(401);
  });
});
