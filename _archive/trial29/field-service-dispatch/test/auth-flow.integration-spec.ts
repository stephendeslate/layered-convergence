import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  seedCompany,
  generateToken,
} from './integration-setup';

describe('Auth Flow (Integration)', () => {
  let app: INestApplication;
  let companyId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    const company = await seedCompany(app);
    companyId = company.id;
  });

  it('should register a new user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `reg-${Date.now()}@test.com`,
        name: 'New User',
        password: 'password123',
        companyId,
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toContain('@test.com');
  });

  it('should login with correct credentials', async () => {
    const email = `login-${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, name: 'Login User', password: 'password123', companyId });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const email = `wrong-${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, name: 'Test', password: 'password123', companyId });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('should reject login for non-existent user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'x' });

    expect(res.status).toBe(401);
  });

  it('should access protected route with valid token', async () => {
    const email = `auth-${Date.now()}@test.com`;
    const regRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, name: 'Auth User', password: 'password123', companyId });

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${regRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
  });

  it('should reject request without token', async () => {
    const res = await request(app.getHttpServer()).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('should reject request with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  it('should allow public routes without token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `pub-${Date.now()}@test.com`,
        name: 'Public User',
        password: 'password123',
        companyId,
      });
    expect(res.status).toBe(201);
  });
});
