import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  cleanDatabase,
  createTestTenant,
} from './helpers';

describe('Tenant Isolation (integration)', () => {
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

  it('should isolate data sources between tenants', async () => {
    const tenantA = await createTestTenant(app, { name: 'Tenant A', apiKey: 'key-a' });
    const tenantB = await createTestTenant(app, { name: 'Tenant B', apiKey: 'key-b' });

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', 'key-a')
      .send({ name: 'Source A', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', 'key-b')
      .send({ name: 'Source B', type: 'csv' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'key-a')
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', 'key-b')
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Source A');
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Source B');
  });

  it('should isolate dashboards between tenants', async () => {
    const tenantA = await createTestTenant(app, { name: 'Tenant A', apiKey: 'key-a' });
    const tenantB = await createTestTenant(app, { name: 'Tenant B', apiKey: 'key-b' });

    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', 'key-a')
      .send({ name: 'Dashboard A' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', 'key-b')
      .send({ name: 'Dashboard B' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-api-key', 'key-a')
      .expect(200);

    const resB = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-api-key', 'key-b')
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Dashboard A');
    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Dashboard B');
  });

  it('should prevent tenant A from accessing tenant B dashboard by id', async () => {
    const tenantA = await createTestTenant(app, { name: 'Tenant A', apiKey: 'key-a' });
    const tenantB = await createTestTenant(app, { name: 'Tenant B', apiKey: 'key-b' });

    const dashB = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', 'key-b')
      .send({ name: 'Dashboard B' });

    await request(app.getHttpServer())
      .get(`/dashboards/${dashB.body.id}`)
      .set('x-api-key', 'key-a')
      .expect(404);
  });

  it('should prevent tenant A from accessing tenant B data source by id', async () => {
    const tenantA = await createTestTenant(app, { name: 'Tenant A', apiKey: 'key-a' });
    const tenantB = await createTestTenant(app, { name: 'Tenant B', apiKey: 'key-b' });

    const dsB = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', 'key-b')
      .send({ name: 'Source B', type: 'api' });

    await request(app.getHttpServer())
      .get(`/data-sources/${dsB.body.id}`)
      .set('x-api-key', 'key-a')
      .expect(404);
  });

  it('should prevent cross-tenant dashboard update', async () => {
    const tenantA = await createTestTenant(app, { name: 'Tenant A', apiKey: 'key-a' });
    const tenantB = await createTestTenant(app, { name: 'Tenant B', apiKey: 'key-b' });

    const dashB = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', 'key-b')
      .send({ name: 'Dashboard B' });

    await request(app.getHttpServer())
      .patch(`/dashboards/${dashB.body.id}`)
      .set('x-api-key', 'key-a')
      .send({ name: 'Hacked' })
      .expect(404);
  });

  it('should prevent cross-tenant dashboard deletion', async () => {
    const tenantA = await createTestTenant(app, { name: 'Tenant A', apiKey: 'key-a' });
    const tenantB = await createTestTenant(app, { name: 'Tenant B', apiKey: 'key-b' });

    const dashB = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-api-key', 'key-b')
      .send({ name: 'Dashboard B' });

    await request(app.getHttpServer())
      .delete(`/dashboards/${dashB.body.id}`)
      .set('x-api-key', 'key-a')
      .expect(404);

    // Verify it still exists for tenant B
    await request(app.getHttpServer())
      .get(`/dashboards/${dashB.body.id}`)
      .set('x-api-key', 'key-b')
      .expect(200);
  });
});
