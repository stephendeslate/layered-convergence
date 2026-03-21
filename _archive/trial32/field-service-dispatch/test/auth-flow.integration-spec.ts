import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, truncateDatabase } from './integration-setup';

describe('Auth Flow (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let companyId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateDatabase(app);

    const company = await prisma.company.create({
      data: { name: 'Auth Co', slug: `auth-${Date.now()}` },
    });
    companyId = company.id;
  });

  it('should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `reg-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Test User',
        companyId,
      })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toContain('@test.com');
    expect(res.body.user.role).toBe('DISPATCHER');
  });

  it('should reject duplicate registration', async () => {
    const email = `dup-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'User 1', companyId })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password456', name: 'User 2', companyId })
      .expect(409);
  });

  it('should login with valid credentials', async () => {
    const email = `login-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'Login User', companyId })
      .expect(201);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' })
      .expect(201);

    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(email);
  });

  it('should reject login with wrong password', async () => {
    const email = `wrong-${Date.now()}@test.com`;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'User', companyId })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrongpassword' })
      .expect(401);
  });

  it('should reject login for non-existent user', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'noexist@test.com', password: 'password123' })
      .expect(401);
  });

  it('should access /auth/me with valid token', async () => {
    const email = `me-${Date.now()}@test.com`;

    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'password123', name: 'Me User', companyId })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${registerRes.body.token}`)
      .expect(200);

    expect(res.body.email).toBe(email);
    expect(res.body.name).toBe('Me User');
  });

  it('should reject /auth/me without token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('should reject requests with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401);
  });
});
