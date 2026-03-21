import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  createTestTenant,
} from './helpers';

describe('Auth Flow (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await cleanDatabase(app);
  });

  it('should reject request without x-api-key header', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .expect(401);

    expect(res.body.message).toContain('x-api-key');
  });

  it('should reject request with invalid API key', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'invalid-key-that-does-not-exist')
      .expect(401);

    expect(res.body.message).toContain('Invalid');
  });

  it('should accept request with valid API key', async () => {
    const tenant = await createTestTenant(app, { apiKey: 'valid-key-123' });

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'valid-key-123')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should set tenantId from API key on request', async () => {
    const tenant = await createTestTenant(app, { apiKey: 'tenant-key-abc' });

    // Create a data source, which uses @TenantId() decorator
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', 'tenant-key-abc')
      .send({ name: 'My Source', type: 'api' })
      .expect(201);

    expect(createRes.body.tenantId).toBe(tenant.id);
  });

  it('should reject POST without API key', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .send({ name: 'Test', type: 'api' })
      .expect(401);
  });

  it('should reject PATCH without API key', async () => {
    await request(app.getHttpServer())
      .patch('/dashboards/some-id')
      .send({ name: 'Updated' })
      .expect(401);
  });

  it('should reject DELETE without API key', async () => {
    await request(app.getHttpServer())
      .delete('/dashboards/some-id')
      .expect(401);
  });

  it('should reject all protected endpoints without auth', async () => {
    const endpoints = [
      { method: 'get', path: '/dashboards' },
      { method: 'get', path: '/data-sources' },
      { method: 'post', path: '/pipelines' },
      { method: 'get', path: '/widgets/dashboard/some-id' },
    ];

    for (const { method, path } of endpoints) {
      const res = await (request(app.getHttpServer()) as any)[method](path);
      expect(res.status).toBe(401);
    }
  });

  it('should allow same API key to make multiple requests', async () => {
    const tenant = await createTestTenant(app, { apiKey: 'reuse-key' });

    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'reuse-key')
      .expect(200);

    await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-api-key', 'reuse-key')
      .expect(200);

    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'reuse-key')
      .expect(200);
  });
});
