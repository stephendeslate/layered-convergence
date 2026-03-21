import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, cleanDatabase, createTestUser, request } from './integration-helper';

describe('Prisma Error Handling (Integration)', () => {
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

  it('should return 409 for duplicate email registration (P2002)', async () => {
    await createTestUser(app, {
      email: 'dup@test.com',
      password: 'Password123!',
      name: 'First',
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'dup@test.com',
        password: 'Password123!',
        name: 'Second',
      })
      .expect(409);

    expect(res.body.statusCode).toBe(409);
  });

  it('should return 404 for non-existent user (P2025 via service)', async () => {
    const { token } = await createTestUser(app, {
      email: 'admin@test.com',
      password: 'Password123!',
      name: 'Admin',
      role: 'ADMIN',
    });

    await request(app.getHttpServer())
      .get('/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('should return 404 for non-existent transaction', async () => {
    const { token } = await createTestUser(app, {
      email: 'user@test.com',
      password: 'Password123!',
      name: 'User',
    });

    await request(app.getHttpServer())
      .get('/transactions/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('should return 400 for invalid transaction creation (missing required fields)', async () => {
    const { token } = await createTestUser(app, {
      email: 'buyer2@test.com',
      password: 'Password123!',
      name: 'Buyer',
    });

    await request(app.getHttpServer())
      .post('/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
  });

  it('should return 400 for forbidden non-whitelisted properties', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'Password123!',
        name: 'Test',
        isAdmin: true,
        hackerField: 'injected',
      })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });
});
