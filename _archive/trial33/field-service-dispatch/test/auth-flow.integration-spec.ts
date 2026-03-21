import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  truncateDatabase,
  generateAuthToken,
} from './integration-setup';
import { PrismaService } from '../src/prisma/prisma.service';

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
      data: { name: 'Auth Co', slug: 'auth-co' },
    });
    companyId = company.id;
  });

  it('should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
        companyId,
      })
      .expect(201);

    expect(res.body.user.email).toBe('new@test.com');
    expect(res.body.token).toBeDefined();
    expect(res.body.token.split('.')).toHaveLength(3);
  });

  it('should reject duplicate email registration', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dupe@test.com',
        password: 'password123',
        name: 'First User',
        companyId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dupe@test.com',
        password: 'password456',
        name: 'Second User',
        companyId,
      })
      .expect(409);
  });

  it('should login with valid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'login@test.com',
        password: 'password123',
        name: 'Login User',
        companyId,
      });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'login@test.com',
        password: 'password123',
      })
      .expect(201);

    expect(res.body.user.email).toBe('login@test.com');
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'wrong@test.com',
        password: 'password123',
        name: 'Wrong Pass',
        companyId,
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wrong@test.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('should reject login with non-existent email', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'password123',
      })
      .expect(401);
  });

  it('should access /auth/me with valid token', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'me@test.com',
        password: 'password123',
        name: 'Me User',
        companyId,
      });

    const token = registerRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.email).toBe('me@test.com');
    expect(res.body.name).toBe('Me User');
  });

  it('should reject /auth/me without token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
  });

  it('should reject protected routes without auth', async () => {
    await request(app.getHttpServer())
      .get('/customers')
      .set('x-company-id', companyId)
      .expect(401);
  });

  it('should allow access to register without auth (public route)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'public@test.com',
        password: 'password123',
        name: 'Public Test',
        companyId,
      });

    expect(res.status).toBe(201);
  });
});
