import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  createTestOrg,
  createTestUser,
  getAuthToken,
} from './helpers';

describe('Auth Flow (Integration)', () => {
  let app: INestApplication;
  let orgId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    const org = await createTestOrg(app);
    orgId = org.id;
  });

  it('should register a new user and return JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'password1',
        organizationId: orgId,
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe('newuser@example.com');
  });

  it('should login with valid credentials', async () => {
    await createTestUser(app, orgId, 'login@example.com');

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@example.com', password: 'password1' })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await createTestUser(app, orgId, 'wrong@example.com');

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('should reject login with non-existent email', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'password1' })
      .expect(401);
  });

  it('should reject unauthenticated requests to protected routes', async () => {
    await request(app.getHttpServer())
      .get('/pipelines')
      .expect(401);
  });

  it('should accept authenticated requests with valid JWT', async () => {
    await createTestUser(app, orgId, 'auth@example.com');
    const token = await getAuthToken(app, 'auth@example.com');

    await request(app.getHttpServer())
      .get('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('should reject requests with invalid JWT', async () => {
    await request(app.getHttpServer())
      .get('/pipelines')
      .set('Authorization', 'Bearer invalid-token-here')
      .expect(401);
  });

  it('should allow VIEWER to read pipelines', async () => {
    await createTestUser(app, orgId, 'viewer@example.com', 'VIEWER');
    const token = await getAuthToken(app, 'viewer@example.com');

    await request(app.getHttpServer())
      .get('/pipelines')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('should deny VIEWER from creating users (ADMIN-only)', async () => {
    await createTestUser(app, orgId, 'viewer2@example.com', 'VIEWER');
    const token = await getAuthToken(app, 'viewer2@example.com');

    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'newbie@example.com',
        password: 'password1',
        role: 'MEMBER',
        organizationId: orgId,
      })
      .expect(403);
  });

  it('should allow ADMIN to create users', async () => {
    await createTestUser(app, orgId, 'admin@example.com', 'ADMIN');
    const token = await getAuthToken(app, 'admin@example.com');

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'created@example.com',
        password: 'password1',
        role: 'MEMBER',
        organizationId: orgId,
      })
      .expect(201);

    expect(res.body.email).toBe('created@example.com');
  });
});
