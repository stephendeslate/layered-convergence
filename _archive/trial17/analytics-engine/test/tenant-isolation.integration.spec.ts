import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, cleanDatabase, createTestTenant } from './helpers';

describe('Tenant Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantA: { id: string; apiKey: string };
  let tenantB: { id: string; apiKey: string };

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);

    const tA = await createTestTenant(prisma, {
      apiKey: 'tenant-a-key',
      name: 'Tenant A',
    });
    const tB = await createTestTenant(prisma, {
      apiKey: 'tenant-b-key',
      name: 'Tenant B',
    });

    tenantA = { id: tA.id, apiKey: tA.apiKey };
    tenantB = { id: tB.id, apiKey: tB.apiKey };
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
      .send({ name: 'Source B', type: 'webhook' })
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

  it('should prevent tenant A from accessing tenant B data source', async () => {
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

  it('should prevent tenant A from accessing tenant B dashboard', async () => {
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

  it('should prevent tenant A from updating tenant B data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Source B', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/data-sources/${createRes.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .send({ name: 'Hijacked' })
      .expect(404);
  });

  it('should prevent tenant A from deleting tenant B data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-api-key', tenantB.apiKey)
      .send({ name: 'Source B', type: 'api' })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/data-sources/${createRes.body.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(404);

    const dbRecord = await prisma.dataSource.findFirst({
      where: { id: createRes.body.id },
    });
    expect(dbRecord).not.toBeNull();
  });

  it('should isolate data points between tenants', async () => {
    const dsA = await prisma.dataSource.create({
      data: { tenantId: tenantA.id, name: 'DS A', type: 'api' },
    });
    const dsB = await prisma.dataSource.create({
      data: { tenantId: tenantB.id, name: 'DS B', type: 'api' },
    });

    await request(app.getHttpServer())
      .post('/data-points')
      .set('x-api-key', tenantA.apiKey)
      .send({
        dataSourceId: dsA.id,
        timestamp: '2024-01-01T00:00:00Z',
        dimensions: { page: '/home' },
        metrics: { views: 100 },
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/data-points')
      .set('x-api-key', tenantB.apiKey)
      .send({
        dataSourceId: dsB.id,
        timestamp: '2024-01-01T00:00:00Z',
        dimensions: { page: '/about' },
        metrics: { views: 200 },
      })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get(`/data-points?dataSourceId=${dsA.id}`)
      .set('x-api-key', tenantA.apiKey)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].metrics.views).toBe(100);
  });
});
