import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  seedCompany,
} from './integration-setup';

describe('Auth Flow (Integration)', () => {
  let app: INestApplication;
  let companyId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await cleanDatabase(app);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    const company = await seedCompany(app, 'auth-test');
    companyId = company.id;
  });

  it('should register a new user and return token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'new@test.com',
        password: 'password123',
        name: 'New User',
        companyId,
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('new@test.com');
    expect(res.body.user.role).toBe('DISPATCHER');
    expect(res.body.user.companyId).toBe(companyId);
  });

  it('should register with a specific role', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Admin User',
        companyId,
        role: 'ADMIN',
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('ADMIN');
  });

  it('should login with correct credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'login@test.com',
        password: 'mypassword',
        name: 'Login User',
        companyId,
      });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'login@test.com',
        password: 'mypassword',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@test.com');
  });

  it('should reject login with wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'wrongpw@test.com',
        password: 'correct',
        name: 'User',
        companyId,
      });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'wrongpw@test.com',
        password: 'wrong',
      });

    expect(res.status).toBe(401);
  });

  it('should reject login with non-existent email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'nobody@test.com',
        password: 'pass',
      });

    expect(res.status).toBe(401);
  });

  it('should access /auth/me with valid token', async () => {
    const registerRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'me@test.com',
        password: 'password',
        name: 'Me User',
        companyId,
      });

    const token = registerRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('me@test.com');
    expect(res.body.name).toBe('Me User');
  });

  it('should reject /auth/me without token', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me');

    expect(res.status).toBe(401);
  });

  it('should reject /auth/me with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
  });

  it('should reject duplicate registration', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dup@test.com',
        password: 'pass',
        name: 'First',
        companyId,
      });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dup@test.com',
        password: 'pass2',
        name: 'Second',
        companyId,
      });

    expect(res.status).toBe(409);
  });

  it('should allow public routes without authentication', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'public@test.com',
        password: 'pass',
        name: 'Public',
        companyId,
      });

    expect(res.status).toBe(201);
  });

  it('should reject protected routes without authentication', async () => {
    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('x-company-id', companyId);

    expect(res.status).toBe(401);
  });

  it('should use the token from login to access protected routes', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'flow@test.com',
        password: 'pass',
        name: 'Flow',
        companyId,
      });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'flow@test.com',
        password: 'pass',
      });

    const token = loginRes.body.token;

    const res = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${token}`)
      .set('x-company-id', companyId);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
