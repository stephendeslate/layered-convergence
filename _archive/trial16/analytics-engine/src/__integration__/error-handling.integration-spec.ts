import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createTestApp, truncateAllTables } from './helpers';

describe('Error Handling (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const tenantId = 'tenant-errors';
  const apiKey = 'error-key';
  const headers = { 'x-tenant-id': tenantId };

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
    await prisma.tenant.create({
      data: { id: tenantId, name: 'Error Tenant', apiKey },
    });
  });

  it('should return 404 for non-existent data source', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources/nonexistent-id')
      .set(headers);

    expect(res.status).toBe(404);
    expect(res.body.message).toBeDefined();
  });

  it('should return 404 for non-existent dashboard', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards/nonexistent-id')
      .set(headers);

    expect(res.status).toBe(404);
  });

  it('should return 404 when updating non-existent data source', async () => {
    const res = await request(app.getHttpServer())
      .put('/data-sources/nonexistent-id')
      .set(headers)
      .send({ name: 'Updated' });

    expect(res.status).toBe(404);
  });

  it('should return 404 when deleting non-existent data source', async () => {
    const res = await request(app.getHttpServer())
      .delete('/data-sources/nonexistent-id')
      .set(headers);

    expect(res.status).toBe(404);
  });

  it('should return 409 for duplicate data source name within same tenant', async () => {
    await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({ name: 'Unique Source', type: 'api' });

    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({ name: 'Unique Source', type: 'csv' });

    expect(res.status).toBe(409);

    const dbSources = await prisma.dataSource.findMany({ where: { tenantId } });
    expect(dbSources).toHaveLength(1);
  });

  it('should return 400 for missing required fields on data source create', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid data source type', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({ name: 'Test', type: 'invalid-type' });

    expect(res.status).toBe(400);
  });

  it('should strip unknown fields via whitelist validation', async () => {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({ name: 'Test', type: 'api', hackedField: 'evil' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing dashboard name', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set(headers)
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid pipeline state transition', async () => {
    const dsRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({ name: 'Pipeline Source', type: 'api' });

    const res = await request(app.getHttpServer())
      .post(`/pipelines/${dsRes.body.id}/complete`)
      .set(headers)
      .send({ syncRunId: 'fake', rowsIngested: 0 });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid transition');
  });

  it('should return 404 for pipeline status of non-existent data source', async () => {
    const res = await request(app.getHttpServer())
      .get('/pipelines/nonexistent/status')
      .set(headers);

    expect(res.status).toBe(404);
  });

  it('should return 401 when x-tenant-id header is missing', async () => {
    const res = await request(app.getHttpServer())
      .get('/data-sources');

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Missing x-tenant-id');
  });

  it('should not modify DB state on failed update', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({ name: 'Stable Source', type: 'api' });

    await request(app.getHttpServer())
      .put(`/data-sources/${createRes.body.id}`)
      .set({ 'x-tenant-id': 'wrong-tenant' })
      .send({ name: 'Hacked Name' });

    const dbDs = await prisma.dataSource.findUnique({ where: { id: createRes.body.id } });
    expect(dbDs!.name).toBe('Stable Source');
  });
});
