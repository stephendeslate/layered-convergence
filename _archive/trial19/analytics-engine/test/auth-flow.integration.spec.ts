import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, createTestTenant } from './helpers';

describe('Auth Flow (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
  });

  it('should reject requests without x-api-key header', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .expect(401);
    expect(res.body.message).toBeDefined();
  });

  it('should reject requests with empty x-api-key', async () => {
    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', '')
      .expect(401);
  });

  it('should reject requests with invalid API key', async () => {
    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'does-not-exist')
      .expect(401);
  });

  it('should accept requests with valid API key', async () => {
    await createTestTenant(app, { name: 'Auth Tenant', apiKey: 'valid-key-1' });
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'valid-key-1')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should associate request with correct tenant', async () => {
    const tenant = await createTestTenant(app, { name: 'Tenant 1', apiKey: 'assoc-key-1' });

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', 'assoc-key-1')
      .send({ name: 'My DS', type: 'api' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'assoc-key-1')
      .expect(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].tenantId).toBe(tenant.id);
  });

  it('should guard all CRUD endpoints on data-sources', async () => {
    await request(app.getHttpServer()).get('/data-sources').expect(401);
    await request(app.getHttpServer()).post('/data-sources').send({ name: 'X', type: 'api' }).expect(401);
    await request(app.getHttpServer()).get('/data-sources/some-id').expect(401);
    await request(app.getHttpServer()).patch('/data-sources/some-id').send({ name: 'Y' }).expect(401);
    await request(app.getHttpServer()).delete('/data-sources/some-id').expect(401);
  });

  it('should guard dashboard endpoints', async () => {
    await request(app.getHttpServer()).get('/dashboards').expect(401);
    await request(app.getHttpServer()).post('/dashboards').send({ name: 'X' }).expect(401);
  });

  it('should guard pipeline endpoints', async () => {
    await request(app.getHttpServer()).get('/pipelines/some-id').expect(401);
    await request(app.getHttpServer()).post('/pipelines').send({ dataSourceId: 'x' }).expect(401);
  });

  it('should support multiple tenants with different API keys', async () => {
    await createTestTenant(app, { name: 'Tenant A', apiKey: 'multi-key-a' });
    await createTestTenant(app, { name: 'Tenant B', apiKey: 'multi-key-b' });

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', 'multi-key-a')
      .send({ name: 'DS A', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', 'multi-key-b')
      .send({ name: 'DS B', type: 'csv' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'multi-key-a')
      .expect(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('DS A');

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'multi-key-b')
      .expect(200);
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('DS B');
  });

  it('should return 401 with proper error structure', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .expect(401);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('statusCode', 401);
  });

  it('should not leak tenant data across authenticated requests', async () => {
    const tenantA = await createTestTenant(app, { name: 'Leak A', apiKey: 'leak-key-a' });
    await createTestTenant(app, { name: 'Leak B', apiKey: 'leak-key-b' });

    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', 'leak-key-a')
      .send({ name: 'Private Dashboard' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-api-key', 'leak-key-b')
      .expect(200);
    expect(res.body).toHaveLength(0);
  });
});
