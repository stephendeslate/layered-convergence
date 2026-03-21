import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestTenant, createTestDataSource } from './helpers';

describe('Tenant Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantA: { id: string; apiKey: string };
  let tenantB: { id: string; apiKey: string };

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    tenantA = await createTestTenant(prisma, {
      name: 'Tenant A',
      apiKey: 'tenant-a-key',
    });
    tenantB = await createTestTenant(prisma, {
      name: 'Tenant B',
      apiKey: 'tenant-b-key',
    });
  });

  it('should only return data sources belonging to the authenticated tenant', async () => {
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

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Source A');

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);

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

    // Verify source still exists for tenant B
    await request(app.getHttpServer())
      .get(`/data-sources/${createRes.body.id}`)
      .set('x-api-key', tenantB.apiKey)
      .expect(200);
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

  it('should not allow cross-tenant dashboard access by ID', async () => {
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

  it('should not allow cross-tenant dashboard update', async () => {
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

  it('should not allow cross-tenant dashboard deletion', async () => {
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

  it('should handle multiple data sources per tenant correctly', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Source A1', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Source A2', type: 'csv' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Source B1', type: 'postgresql' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    expect(resA.body).toHaveLength(2);

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .expect(200);

    expect(resB.body).toHaveLength(1);
  });

  it('should cascade delete tenant data sources', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Source A', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/data-sources/${createRes.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    const res = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    expect(res.body).toHaveLength(0);
  });
});
