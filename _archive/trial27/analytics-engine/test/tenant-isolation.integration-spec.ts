import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
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

  it('should only return data sources belonging to the authenticated tenant', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'DS-A', type: 'postgresql' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'DS-B', type: 'mysql' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('DS-A');

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('DS-B');
  });

  it('should not allow tenant A to access tenant B data source by id', async () => {
    const create = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'DS-B', type: 'postgresql' });

    await request(app.getHttpServer())
      .get(`/data-sources/${create.body.id}`)
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

  it('should not allow tenant A to update tenant B dashboard', async () => {
    const create = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Dashboard B' });

    await request(app.getHttpServer())
      .patch(`/dashboards/${create.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Hacked' })
      .expect(404);
  });

  it('should not allow tenant A to delete tenant B data source', async () => {
    const create = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'DS-B', type: 'postgresql' });

    await request(app.getHttpServer())
      .delete(`/data-sources/${create.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(404);
  });

  it('should isolate data points between tenants', async () => {
    const dsA = await createTestDataSource(app, tenantA.id);
    const dsB = await createTestDataSource(app, tenantB.id);

    await request(app.getHttpServer())
      .post('/data-points')
      .set('x-api-key', tenantA.apiKey)
      .send({
        dataSourceId: dsA.id,
        timestamp: '2024-01-01T00:00:00Z',
        dimensions: { region: 'US' },
        metrics: { value: 100 },
      })
      .expect(201);

    const resB = await request(app.getHttpServer())
      .get('/data-points')
      .set('x-api-key', tenantB.apiKey)
      .query({ dataSourceId: dsA.id })
      .expect(200);

    expect(resB.body).toHaveLength(0);
  });
});
