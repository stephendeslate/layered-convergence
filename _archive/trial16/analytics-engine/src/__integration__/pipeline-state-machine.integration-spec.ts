import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createTestApp, truncateAllTables } from './helpers';

describe('Pipeline State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const tenantId = 'tenant-pipeline';
  const apiKey = 'pipeline-key';
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
      data: { id: tenantId, name: 'Pipeline Tenant', apiKey },
    });
  });

  async function createDataSource(name = 'Source A') {
    const res = await request(app.getHttpServer())
      .post('/data-sources')
      .set(headers)
      .send({ name, type: 'api' });
    return res.body;
  }

  it('should start with IDLE status', async () => {
    const ds = await createDataSource();

    const res = await request(app.getHttpServer())
      .get(`/pipelines/${ds.id}/status`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('IDLE');
  });

  it('should transition IDLE -> RUNNING via trigger', async () => {
    const ds = await createDataSource();

    const res = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set(headers)
      .send({ dataSourceId: ds.id });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('RUNNING');

    const dbDs = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(dbDs!.status).toBe('RUNNING');
  });

  it('should transition RUNNING -> COMPLETED', async () => {
    const ds = await createDataSource();

    const triggerRes = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set(headers)
      .send({ dataSourceId: ds.id });

    const syncRunId = triggerRes.body.syncRunId;

    const res = await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/complete`)
      .set(headers)
      .send({ syncRunId, rowsIngested: 42 });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('COMPLETED');

    const dbDs = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(dbDs!.status).toBe('COMPLETED');

    const syncRun = await prisma.syncRun.findUnique({ where: { id: syncRunId } });
    expect(syncRun!.status).toBe('completed');
    expect(syncRun!.rowsIngested).toBe(42);
  });

  it('should transition RUNNING -> FAILED', async () => {
    const ds = await createDataSource();

    const triggerRes = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set(headers)
      .send({ dataSourceId: ds.id });

    const syncRunId = triggerRes.body.syncRunId;

    const res = await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/fail`)
      .set(headers)
      .send({ syncRunId, errorLog: 'Connection timeout' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('FAILED');

    const dbDs = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(dbDs!.status).toBe('FAILED');

    const syncRun = await prisma.syncRun.findUnique({ where: { id: syncRunId } });
    expect(syncRun!.status).toBe('failed');
    expect(syncRun!.errorLog).toBe('Connection timeout');
  });

  it('should allow COMPLETED -> RUNNING (re-trigger)', async () => {
    const ds = await createDataSource();

    const trigger1 = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set(headers)
      .send({ dataSourceId: ds.id });

    await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/complete`)
      .set(headers)
      .send({ syncRunId: trigger1.body.syncRunId, rowsIngested: 10 });

    const trigger2 = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set(headers)
      .send({ dataSourceId: ds.id });

    expect(trigger2.status).toBe(201);
    expect(trigger2.body.status).toBe('RUNNING');

    const dbDs = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(dbDs!.status).toBe('RUNNING');
  });

  it('should allow FAILED -> RUNNING (retry)', async () => {
    const ds = await createDataSource();

    const trigger1 = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set(headers)
      .send({ dataSourceId: ds.id });

    await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/fail`)
      .set(headers)
      .send({ syncRunId: trigger1.body.syncRunId, errorLog: 'Fail' });

    const trigger2 = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set(headers)
      .send({ dataSourceId: ds.id });

    expect(trigger2.status).toBe(201);
    expect(trigger2.body.status).toBe('RUNNING');
  });

  it('should reject invalid transition IDLE -> COMPLETED', async () => {
    const ds = await createDataSource();

    const res = await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/complete`)
      .set(headers)
      .send({ syncRunId: 'fake-id', rowsIngested: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid transition');
  });

  it('should reject invalid transition IDLE -> FAILED', async () => {
    const ds = await createDataSource();

    const res = await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/fail`)
      .set(headers)
      .send({ syncRunId: 'fake-id', errorLog: 'error' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid transition');
  });

  it('should reject invalid transition COMPLETED -> COMPLETED', async () => {
    const ds = await createDataSource();

    const trigger = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set(headers)
      .send({ dataSourceId: ds.id });

    await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/complete`)
      .set(headers)
      .send({ syncRunId: trigger.body.syncRunId, rowsIngested: 5 });

    const res = await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/complete`)
      .set(headers)
      .send({ syncRunId: trigger.body.syncRunId, rowsIngested: 5 });

    expect(res.status).toBe(400);
  });

  it('should create a sync run when pipeline is triggered', async () => {
    const ds = await createDataSource();

    const res = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set(headers)
      .send({ dataSourceId: ds.id });

    expect(res.body.syncRunId).toBeDefined();

    const syncRun = await prisma.syncRun.findUnique({
      where: { id: res.body.syncRunId },
    });
    expect(syncRun).not.toBeNull();
    expect(syncRun!.dataSourceId).toBe(ds.id);
    expect(syncRun!.status).toBe('running');
  });

  it('should return 404 for non-existent data source', async () => {
    const res = await request(app.getHttpServer())
      .get('/pipelines/nonexistent-id/status')
      .set(headers);

    expect(res.status).toBe(404);
  });
});
