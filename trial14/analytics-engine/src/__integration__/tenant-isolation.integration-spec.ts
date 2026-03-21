import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createTestApp, truncateAllTables } from './helpers';

describe('Tenant Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const tenantA = { id: 'tenant-a', name: 'Tenant A', apiKey: 'key-a' };
  const tenantB = { id: 'tenant-b', name: 'Tenant B', apiKey: 'key-b' };
  const headersA = { 'x-tenant-id': tenantA.id };
  const headersB = { 'x-tenant-id': tenantB.id };

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    prisma = ctx.prisma;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);
    await prisma.tenant.create({ data: tenantA });
    await prisma.tenant.create({ data: tenantB });
  });

  it('should not return data sources from another tenant', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set(headersA)
      .send({ name: 'Source A', type: 'api' });

    await request(app.getHttpServer())
      .post('/data-sources')
      .set(headersB)
      .send({ name: 'Source B', type: 'csv' });

    const resA = await request(app.getHttpServer())
      .get('/data-sources')
      .set(headersA);

    expect(resA.status).toBe(200);
    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Source A');

    const resB = await request(app.getHttpServer())
      .get('/data-sources')
      .set(headersB);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Source B');
  });

  it('should not allow tenant A to read tenant B data source by id', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headersB)
      .send({ name: 'Secret Source', type: 'postgresql' });

    const res = await request(app.getHttpServer())
      .get(`/data-sources/${createRes.body.id}`)
      .set(headersA);

    expect(res.status).toBe(404);
  });

  it('should not allow tenant A to update tenant B data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headersB)
      .send({ name: 'B Source', type: 'api' });

    const res = await request(app.getHttpServer())
      .put(`/data-sources/${createRes.body.id}`)
      .set(headersA)
      .send({ name: 'Hacked' });

    expect(res.status).toBe(404);

    const dbDs = await prisma.dataSource.findUnique({ where: { id: createRes.body.id } });
    expect(dbDs!.name).toBe('B Source');
  });

  it('should not allow tenant A to delete tenant B data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headersB)
      .send({ name: 'B Source', type: 'webhook' });

    const res = await request(app.getHttpServer())
      .delete(`/data-sources/${createRes.body.id}`)
      .set(headersA);

    expect(res.status).toBe(404);

    const dbDs = await prisma.dataSource.findUnique({ where: { id: createRes.body.id } });
    expect(dbDs).not.toBeNull();
  });

  it('should isolate dashboards between tenants', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .set(headersA)
      .send({ name: 'Dashboard A' });

    await request(app.getHttpServer())
      .post('/dashboards')
      .set(headersB)
      .send({ name: 'Dashboard B' });

    const resA = await request(app.getHttpServer())
      .get('/dashboards')
      .set(headersA);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Dashboard A');
  });

  it('should not allow tenant A to read tenant B dashboard by id', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set(headersB)
      .send({ name: 'Secret Dashboard' });

    const res = await request(app.getHttpServer())
      .get(`/dashboards/${createRes.body.id}`)
      .set(headersA);

    expect(res.status).toBe(404);
  });

  it('should not allow tenant A to trigger pipeline on tenant B data source', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headersB)
      .send({ name: 'B Pipeline', type: 'api' });

    const res = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set(headersA)
      .send({ dataSourceId: createRes.body.id });

    expect(res.status).toBe(404);

    const dbDs = await prisma.dataSource.findUnique({ where: { id: createRes.body.id } });
    expect(dbDs!.status).toBe('IDLE');
  });

  it('should allow each tenant to create data sources with same name', async () => {
    const resA = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headersA)
      .send({ name: 'Shared Name', type: 'api' });

    const resB = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headersB)
      .send({ name: 'Shared Name', type: 'api' });

    expect(resA.status).toBe(201);
    expect(resB.status).toBe(201);
  });

  it('should verify data in DB belongs to correct tenant after creation', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set(headersA)
      .send({ name: 'Verified Source', type: 'api' });

    const sources = await prisma.dataSource.findMany({ where: { tenantId: tenantA.id } });
    expect(sources).toHaveLength(1);
    expect(sources[0].tenantId).toBe(tenantA.id);

    const otherSources = await prisma.dataSource.findMany({ where: { tenantId: tenantB.id } });
    expect(otherSources).toHaveLength(0);
  });
});
