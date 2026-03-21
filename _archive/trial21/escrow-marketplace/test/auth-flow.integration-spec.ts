import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, cleanDatabase, generateToken } from './helpers/integration-setup';

describe('Auth Flow (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    prisma = setup.prisma;
    jwtService = setup.jwtService;
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
      .send({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
        role: 'BUYER',
        tenantId: 'tenant-1',
      })
      .expect(201);

    expect(res.body.user.email).toBe('new@test.com');
    expect(res.body.user.role).toBe('BUYER');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  it('should login with valid credentials', async () => {
    // Register first
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'login@test.com',
        password: 'password123',
        name: 'Login User',
        role: 'BUYER',
        tenantId: 'tenant-1',
      });

    // Login
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'login@test.com',
        password: 'password123',
      })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('login@test.com');
  });

  it('should reject login with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'wrong-pass@test.com',
        password: 'password123',
        name: 'User',
        role: 'BUYER',
        tenantId: 'tenant-1',
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wrong-pass@test.com',
        password: 'wrongpassword',
      })
      .expect(401);
  });

  it('should reject login for non-existent user', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nonexistent@test.com',
        password: 'password123',
      })
      .expect(401);
  });

  it('should access protected endpoint with valid token', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'protected@test.com',
        password: 'password123',
        name: 'Protected User',
        role: 'BUYER',
        tenantId: 'tenant-1',
      });

    const token = registerRes.body.accessToken;

    const res = await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should reject request without token', async () => {
    await request(app.getHttpServer())
      .get('/transactions')
      .expect(401);
  });

  it('should reject request with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/transactions')
      .set('Authorization', 'Bearer invalid-token-here')
      .expect(401);
  });

  it('should enforce role-based access - BUYER cannot create users', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'buyer-role@test.com',
        password: 'password123',
        name: 'Buyer',
        role: 'BUYER',
        tenantId: 'tenant-1',
      });

    const token = registerRes.body.accessToken;

    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'another@test.com',
        password: 'password123',
        name: 'Another',
        role: 'BUYER',
        tenantId: 'tenant-1',
      })
      .expect(403);
  });

  it('should allow ADMIN to create users', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin-role@test.com',
        password: 'password123',
        name: 'Admin',
        role: 'ADMIN',
        tenantId: 'tenant-1',
      });

    const token = registerRes.body.accessToken;

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'created-by-admin@test.com',
        password: 'password123',
        name: 'Created by Admin',
        role: 'PROVIDER',
        tenantId: 'tenant-1',
      })
      .expect(201);

    expect(res.body.email).toBe('created-by-admin@test.com');
  });

  it('should return token that contains correct claims', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'claims@test.com',
        password: 'password123',
        name: 'Claims User',
        role: 'PROVIDER',
        tenantId: 'tenant-2',
      });

    const token = registerRes.body.accessToken;
    const decoded = jwtService.decode(token) as any;

    expect(decoded.email).toBe('claims@test.com');
    expect(decoded.role).toBe('PROVIDER');
    expect(decoded.tenantId).toBe('tenant-2');
    expect(decoded.sub).toBeDefined();
  });
});
