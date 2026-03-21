import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
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
    await request(app.getHttpServer())
      .get('/data-sources')
      .expect(401);
  });

  it('should reject requests with invalid API key', async () => {
    await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'invalid-key')
      .expect(401);
  });

  it('should accept requests with valid API key', async () => {
    const tenant = await createTestTenant(app);

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenant.apiKey)
      .expect(200);

    expect(res.body).toEqual([]);
  });

  it('should set tenantId from API key on authenticated requests', async () => {
    const tenant = await createTestTenant(app);

    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenant.apiKey)
      .send({ name: 'Test DS', type: 'postgresql' })
      .expect(201);

    expect(res.body.tenantId).toBe(tenant.id);
  });

  it('should reject dashboard creation without auth', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .send({ name: 'Test' })
      .expect(401);
  });

  it('should reject pipeline creation without auth', async () => {
    await request(app.getHttpServer())
      .post('/pipelines')
      .send({ dataSourceId: 'ds-1' })
      .expect(401);
  });

  it('should reject data points query without auth', async () => {
    await request(app.getHttpServer())
      .get('/data-points')
      .query({ dataSourceId: 'ds-1' })
      .expect(401);
  });

  it('should reject embed creation without auth', async () => {
    await request(app.getHttpServer())
      .post('/embeds')
      .send({ dashboardId: 'd-1' })
      .expect(401);
  });

  it('should allow creating and reading data with same key', async () => {
    const tenant = await createTestTenant(app);

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenant.apiKey)
      .send({ name: 'MyDS', type: 'mysql' })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenant.apiKey)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('MyDS');
  });

  it('should return 401 with appropriate message for missing key', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .expect(401);

    expect(res.body.message).toContain('x-api-key');
  });
});
