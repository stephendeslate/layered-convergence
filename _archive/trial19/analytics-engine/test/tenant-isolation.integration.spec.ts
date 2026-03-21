import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, cleanDatabase, createTestTenant, createTestDataSource } from './helpers';

describe('Tenant Isolation (Integration)', () => {
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
    const tA = await createTestTenant(app, { name: 'Tenant A', apiKey: 'key-a' });
    const tB = await createTestTenant(app, { name: 'Tenant B', apiKey: 'key-b' });
    tenantA = { id: tA.id, apiKey: tA.apiKey };
    tenantB = { id: tB.id, apiKey: tB.apiKey };
  });

  it('should isolate data sources between tenants', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'DS A', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'DS B', type: 'csv' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .expect(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('DS A');

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('DS B');
  });

  it('should prevent tenant A from accessing tenant B data source', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'DS B', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/data-sources/${res.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(404);
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
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Dashboard A');
  });

  it('should prevent tenant A from accessing tenant B dashboard', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Dashboard B' })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/dashboards/${res.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(404);
  });

  it('should prevent tenant A from updating tenant B data source', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'DS B', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/data-sources/${res.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Hijacked' })
      .expect(404);
  });

  it('should prevent tenant A from deleting tenant B data source', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'DS B', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/data-sources/${res.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(404);
  });

  it('should prevent tenant A from updating tenant B dashboard', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Dashboard B' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/dashboards/${res.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Hijacked' })
      .expect(404);
  });

  it('should prevent tenant A from deleting tenant B dashboard', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Dashboard B' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/dashboards/${res.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(404);
  });

  it('should allow each tenant to create resources independently', async () => {
    for (let i = 0; i < 3; i++) {
      await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', tenantA.apiKey)
        .send({ name: `DS A-${i}`, type: 'api' })
        .expect(201);
    }

    for (let i = 0; i < 2; i++) {
      await request(app.getHttpServer())
        .post('/data-sources')
        .set('x-api-key', tenantB.apiKey)
        .send({ name: `DS B-${i}`, type: 'csv' })
        .expect(201);
    }

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .expect(200);
    expect(resA.body).toHaveLength(3);

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);
    expect(resB.body).toHaveLength(2);
  });

  it('should scope data points to tenant', async () => {
    const dsA = await createTestDataSource(app, tenantA.id, { name: 'DS A', type: 'api' });

    await request(app.getHttpServer())
      .post('/data-points')
      .set('x-api-key', tenantA.apiKey)
      .send({
        dataSourceId: dsA.id,
        timestamp: '2024-01-01T00:00:00Z',
        dimensions: { region: 'US' },
        metrics: { value: 42 },
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get('/data-points')
      .query({ dataSourceId: dsA.id })
      .set('x-api-key', tenantA.apiKey)
      .expect(200);
    expect(res.body).toHaveLength(1);
  });
});
