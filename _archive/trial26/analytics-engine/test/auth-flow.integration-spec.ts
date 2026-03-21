import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, createTestTenant } from './helpers';

describe('Auth Flow (integration)', () => {
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

    expect(res.body.message).toContain('x-api-key');
  });

  it('should reject requests with invalid API key', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'invalid-key-that-does-not-exist')
      .expect(401);

    expect(res.body.message).toContain('Invalid');
  });

  it('should accept requests with valid API key', async () => {
    const tenant = await createTestTenant(app, { apiKey: 'valid-key-123' });

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenant.apiKey)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('should associate requests with the correct tenant', async () => {
    const tenantA = await createTestTenant(app, { name: 'A', apiKey: 'key-a-auth' });
    const tenantB = await createTestTenant(app, { name: 'B', apiKey: 'key-b-auth' });

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Source for A', type: 'api' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resB.body).toHaveLength(0);
  });

  it('should reject request with empty API key string', async () => {
    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', '')
      .expect(401);
  });

  it('should work with different protected endpoints', async () => {
    const tenant = await createTestTenant(app);

    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenant.apiKey)
      .expect(200);

    await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-api-key', tenant.apiKey)
      .expect(200);
  });

  it('should reject POST without auth', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .send({ name: 'Test', type: 'api' })
      .expect(401);
  });

  it('should reject PATCH without auth', async () => {
    await request(app.getHttpServer())
      .patch('/data-sources/some-id')
      .send({ name: 'Updated' })
      .expect(401);
  });

  it('should reject DELETE without auth', async () => {
    await request(app.getHttpServer())
      .delete('/data-sources/some-id')
      .expect(401);
  });
});
