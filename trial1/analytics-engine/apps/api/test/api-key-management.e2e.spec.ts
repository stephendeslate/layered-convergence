/**
 * E2E tests for API key management.
 * Covers: generate key -> use for embed auth -> revoke -> verify access denied.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  createE2EApp,
  cleanDatabase,
  registerTenant,
  createDataSource,
  createDashboard,
  createWidget,
  E2EContext,
} from './e2e-helpers';

describe('API Key Management (E2E)', () => {
  let ctx: E2EContext;

  beforeAll(async () => {
    ctx = await createE2EApp();
  }, 30000);

  afterAll(async () => {
    await cleanDatabase(ctx.prisma);
    await ctx.app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(ctx.prisma);
  });

  it('should generate an API key and return it once', async () => {
    const { accessToken } = await registerTenant(ctx.app);

    const res = await request(ctx.app.getHttpServer())
      .post('/api/api-keys')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'My Embed Key', type: 'EMBED' })
      .expect(201);

    expect(res.body.data.key).toBeDefined();
    expect(res.body.data.name).toBe('My Embed Key');
    expect(res.body.data.type).toBe('EMBED');
    expect(res.body.data.keyPrefix).toBeDefined();
    expect(res.body.data.key.length).toBeGreaterThan(20);
  });

  it('should list API keys without exposing the full key', async () => {
    const { accessToken } = await registerTenant(ctx.app);

    await request(ctx.app.getHttpServer())
      .post('/api/api-keys')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Key 1', type: 'EMBED' })
      .expect(201);

    await request(ctx.app.getHttpServer())
      .post('/api/api-keys')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Key 2', type: 'ADMIN' })
      .expect(201);

    const res = await request(ctx.app.getHttpServer())
      .get('/api/api-keys')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data).toHaveLength(2);
    // Keys should NOT contain the full key — only prefix
    for (const key of res.body.data) {
      expect(key).not.toHaveProperty('key');
      expect(key).not.toHaveProperty('keyHash');
      expect(key).toHaveProperty('keyPrefix');
      expect(key).toHaveProperty('name');
      expect(key).toHaveProperty('type');
    }
  });

  it('should use API key for embed data access', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    const dashboard = await createDashboard(ctx.app, accessToken);
    await createWidget(ctx.app, accessToken, dashboard.id, ds.id);

    // Publish dashboard
    await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Create embed config
    const embedRes = await request(ctx.app.getHttpServer())
      .post('/api/embeds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        dashboardId: dashboard.id,
        allowedOrigins: ['https://myapp.com'],
        isEnabled: true,
      })
      .expect(201);

    const embedId = embedRes.body.data.id;

    // Generate EMBED API key
    const keyRes = await request(ctx.app.getHttpServer())
      .post('/api/api-keys')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Embed Key', type: 'EMBED' })
      .expect(201);

    const apiKey = keyRes.body.data.key;

    // Access embed data with API key + valid origin
    const dataRes = await request(ctx.app.getHttpServer())
      .get(`/api/embed-data/${embedId}`)
      .set('X-API-Key', apiKey)
      .set('Origin', 'https://myapp.com')
      .expect(200);

    expect(dataRes.body.data).toHaveProperty('widgets');
    expect(dataRes.body.data).toHaveProperty('theme');
    expect(dataRes.body.data).toHaveProperty('name');
  });

  it('should revoke an API key and deny subsequent access', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    const dashboard = await createDashboard(ctx.app, accessToken);
    await createWidget(ctx.app, accessToken, dashboard.id, ds.id);

    // Publish and create embed
    await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const embedRes = await request(ctx.app.getHttpServer())
      .post('/api/embeds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        dashboardId: dashboard.id,
        allowedOrigins: ['https://myapp.com'],
        isEnabled: true,
      })
      .expect(201);

    const embedId = embedRes.body.data.id;

    // Create and then revoke API key
    const keyRes = await request(ctx.app.getHttpServer())
      .post('/api/api-keys')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Revocable Key', type: 'EMBED' })
      .expect(201);

    const apiKey = keyRes.body.data.key;
    const keyId = keyRes.body.data.id;

    // Verify it works first
    await request(ctx.app.getHttpServer())
      .get(`/api/embed-data/${embedId}`)
      .set('X-API-Key', apiKey)
      .set('Origin', 'https://myapp.com')
      .expect(200);

    // Revoke the key
    await request(ctx.app.getHttpServer())
      .delete(`/api/api-keys/${keyId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);

    // Verify access is denied
    await request(ctx.app.getHttpServer())
      .get(`/api/embed-data/${embedId}`)
      .set('X-API-Key', apiKey)
      .set('Origin', 'https://myapp.com')
      .expect(401);
  });

  it('should reject embed access without API key', async () => {
    await request(ctx.app.getHttpServer())
      .get('/api/embed-data/some-id')
      .expect(401);
  });

  it('should reject embed access with invalid API key', async () => {
    await request(ctx.app.getHttpServer())
      .get('/api/embed-data/some-id')
      .set('X-API-Key', 'invalid-key-value')
      .expect(401);
  });

  it('should support API key in query parameter', async () => {
    const { accessToken } = await registerTenant(ctx.app);
    const ds = await createDataSource(ctx.app, accessToken);
    const dashboard = await createDashboard(ctx.app, accessToken);
    await createWidget(ctx.app, accessToken, dashboard.id, ds.id);

    await request(ctx.app.getHttpServer())
      .post(`/api/dashboards/${dashboard.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const embedRes = await request(ctx.app.getHttpServer())
      .post('/api/embeds')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        dashboardId: dashboard.id,
        allowedOrigins: ['https://myapp.com'],
        isEnabled: true,
      })
      .expect(201);

    const keyRes = await request(ctx.app.getHttpServer())
      .post('/api/api-keys')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Query Param Key', type: 'EMBED' })
      .expect(201);

    // Access via query parameter
    await request(ctx.app.getHttpServer())
      .get(`/api/embed-data/${embedRes.body.data.id}?apiKey=${keyRes.body.data.key}`)
      .set('Origin', 'https://myapp.com')
      .expect(200);
  });
});
