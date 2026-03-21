import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, generateToken } from './integration-setup';

describe('Auth Flow (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

  beforeAll(async () => {
    const result = await createTestApp();
    app = result.app;
    prisma = result.prisma;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE "work_order_status_history" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "job_photos" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "invoices" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "work_orders" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "routes" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "customers" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "technicians" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "users" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "companies" CASCADE`;

    const company = await prisma.company.create({
      data: { name: 'Auth Test Co', slug: 'auth-test-co' },
    });
    companyId = company.id;
  });

  it('should register a new user and return a token', async () => {
    const email = `register-${Date.now()}@test.com`;

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'securePass123',
        name: 'Test User',
        companyId,
      })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.name).toBe('Test User');
    expect(res.body.user.companyId).toBe(companyId);
    expect(res.body.user.role).toBe('DISPATCHER');
  });

  it('should register with a specific role', async () => {
    const email = `admin-${Date.now()}@test.com`;

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'securePass123',
        name: 'Admin User',
        companyId,
        role: 'ADMIN',
      })
      .expect(201);

    expect(res.body.user.role).toBe('ADMIN');
  });

  it('should login with valid credentials', async () => {
    const email = `login-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'securePass123',
        name: 'Login User',
        companyId,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'securePass123' })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(email);
  });

  it('should reject login with wrong password', async () => {
    const email = `wrongpass-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'correctPass',
        name: 'Wrong Pass User',
        companyId,
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrongPass' })
      .expect(401);

    expect(res.body.message).toContain('Invalid credentials');
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'anyPass' })
      .expect(401);

    expect(res.body.message).toContain('Invalid credentials');
  });

  it('should reject protected endpoints without a token', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);

    expect(res.body.message).toContain('Missing or invalid authorization');
  });

  it('should reject protected endpoints with an invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid-token-here')
      .expect(401);

    expect(res.body.message).toContain('Invalid token');
  });

  it('should access /auth/me with a valid token', async () => {
    const email = `metest-${Date.now()}@test.com`;

    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'securePass123',
        name: 'Me User',
        companyId,
      })
      .expect(201);

    const token = regRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.email).toBe(email);
    expect(res.body.name).toBe('Me User');
  });

  it('should reject register with missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'bad@test.com' })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });

  it('should reject register with invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'pass123',
        name: 'Bad Email',
        companyId,
      })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });

  it('should use token from login to access work orders', async () => {
    const email = `access-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'pass123',
        name: 'Access User',
        companyId,
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'pass123' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${loginRes.body.token}`)
      .set('x-company-id', companyId)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should not expose password in user response', async () => {
    const email = `nopass-${Date.now()}@test.com`;

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'secret123',
        name: 'No Pass',
        companyId,
      })
      .expect(201);

    expect(res.body.user.password).toBeUndefined();
  });
});
