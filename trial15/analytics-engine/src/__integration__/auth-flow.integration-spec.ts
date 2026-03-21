import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  TestContext,
  createTestApp,
  cleanDatabase,
  createTestTenant,
  createTestUser,
  generateAuthToken,
  teardownTestApp,
} from './helpers';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';

describe('Auth Flow (Integration)', () => {
  let ctx: TestContext;
  let tenantId: string;
  let token: string;

  beforeAll(async () => {
    ctx = await createTestApp();
  });

  afterAll(async () => {
    await teardownTestApp(ctx);
  });

  beforeEach(async () => {
    await cleanDatabase(ctx.prisma);

    const tenant = await createTestTenant(ctx.prisma);
    tenantId = tenant.id;

    const user = await createTestUser(ctx.prisma, tenantId);
    token = generateAuthToken(ctx.authService, user);
  });

  it('should allow access with valid JWT', async () => {
    const res = await request(ctx.app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should reject requests without authorization header', async () => {
    const res = await request(ctx.app.getHttpServer())
      .get('/data-sources')
      .expect(401);

    expect(res.body.message).toContain('No authentication token');
  });

  it('should reject requests with invalid JWT', async () => {
    const res = await request(ctx.app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', 'Bearer totally-invalid-token')
      .expect(401);

    expect(res.body.message).toBeDefined();
  });

  it('should reject expired JWT tokens', async () => {
    const secret = process.env['JWT_SECRET'] ?? 'default-secret-change-in-production';
    const expiredToken = jwt.sign(
      { sub: 'user-1', email: 'test@test.com', tenantId, role: 'admin' },
      secret,
      { expiresIn: -10 },
    );

    const res = await request(ctx.app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(res.body.message).toContain('expired');
  });

  it('should reject tokens signed with wrong secret', async () => {
    const wrongToken = jwt.sign(
      { sub: 'user-1', email: 'test@test.com', tenantId, role: 'admin' },
      'completely-wrong-secret',
    );

    await request(ctx.app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${wrongToken}`)
      .expect(401);
  });

  it('should set tenantId from JWT on requests', async () => {
    // Create a data source to verify tenant context works
    const res = await request(ctx.app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Auth Test Source', type: 'postgres' })
      .expect(201);

    expect(res.body.tenantId).toBe(tenantId);
  });

  it('should support x-tenant-id header override', async () => {
    // The middleware extracts tenantId from header with priority over JWT
    const res = await request(ctx.app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', tenantId)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should handle multiple sequential authenticated requests', async () => {
    // Create
    const createRes = await request(ctx.app.getHttpServer())
      .post('/data-sources')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Sequential Test', type: 'mysql' })
      .expect(201);

    // Read
    await request(ctx.app.getHttpServer())
      .get(`/data-sources/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Update
    await request(ctx.app.getHttpServer())
      .put(`/data-sources/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Sequential' })
      .expect(200);

    // Delete
    await request(ctx.app.getHttpServer())
      .delete(`/data-sources/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Verify deleted
    await request(ctx.app.getHttpServer())
      .get(`/data-sources/${createRes.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('should work with different user roles', async () => {
    const viewerUser = await createTestUser(ctx.prisma, tenantId, {
      email: `viewer-${Date.now()}@test.com`,
      role: 'viewer',
    });
    const viewerToken = generateAuthToken(ctx.authService, viewerUser);

    // Viewer should still be able to access endpoints (role enforcement is application-level)
    const res = await request(ctx.app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should reject Bearer prefix without token', async () => {
    await request(ctx.app.getHttpServer())
      .get('/data-sources')
      .set('Authorization', 'Bearer ')
      .expect(401);
  });
});
