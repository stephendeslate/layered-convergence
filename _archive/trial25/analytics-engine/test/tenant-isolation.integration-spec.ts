import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, createTestTenant, createTestDataSource } from './helpers';

describe('Tenant Isolation (integration)', () => {
  let app: INestApplication;
  let tenantA: { id: string; apiKey: string };
  let tenantB: { id: string; apiKey: string };

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(app);
    tenantA = await createTestTenant(app, { name: 'Tenant A', apiKey: 'key-a' });
    tenantB = await createTestTenant(app, { name: 'Tenant B', apiKey: 'key-b' });
  });

  it('should isolate data sources between tenants', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Source A', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Source B', type: 'csv' })
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
    expect(resA.body[0].name).toBe('Source A');
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Source B');
  });

  it('should not allow tenant A to access tenant B data source by ID', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Source B', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/data-sources/${createRes.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(404);
  });

  it('should not allow tenant A to update tenant B data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Source B', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/data-sources/${createRes.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Hacked' })
      .expect(404);
  });

  it('should not allow tenant A to delete tenant B data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Source B', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/data-sources/${createRes.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(404);

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);

    expect(resB.body).toHaveLength(1);
  });

  it('should isolate dashboards between tenants', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Dashboard A' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Dashboard B' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Dashboard A');
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Dashboard B');
  });

  it('should not allow tenant A to view tenant B dashboard by ID', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Dashboard B' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/dashboards/${createRes.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(404);
  });

  it('should not allow tenant A to update tenant B dashboard', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Dashboard B' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/dashboards/${createRes.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Hacked' })
      .expect(404);
  });

  it('should not allow tenant A to delete tenant B dashboard', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Dashboard B' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/dashboards/${createRes.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(404);
  });

  it('should allow each tenant to manage their own resources independently', async () => {
    const dsA = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Source A', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Source B', type: 'csv' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/data-sources/${dsA.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);

    expect(resA.body).toHaveLength(0);
    expect(resB.body).toHaveLength(1);
  });
});
