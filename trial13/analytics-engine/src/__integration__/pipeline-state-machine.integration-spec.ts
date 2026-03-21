import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createTestApp, truncateAllTables } from './helpers';

describe('Pipeline State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: any;

  beforeAll(async () => {
    const ctx = await createTestApp();
    app = ctx.app;
    prisma = ctx.prisma;
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);
    tenant = await prisma.tenant.create({
      data: { name: 'Pipeline Tenant', apiKey: 'pipeline-key' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should transition IDLE -> RUNNING -> COMPLETED', async () => {
    const ds = await prisma.dataSource.create({
      data: { tenantId: tenant.id, name: 'Test Source', type: 'api' },
    });

    // Verify initial state is IDLE
    const statusRes = await request(app.getHttpServer())
      .get(`/pipelines/${ds.id}/status`)
      .set('x-tenant-id', tenant.id)
      .expect(200);
    expect(statusRes.body.status).toBe('IDLE');

    // Trigger: IDLE -> RUNNING
    const triggerRes = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set('x-tenant-id', tenant.id)
      .send({ dataSourceId: ds.id })
      .expect(201);
    expect(triggerRes.body.status).toBe('RUNNING');
    const syncRunId = triggerRes.body.syncRunId;

    // Verify DB state is RUNNING
    const dsRunning = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(dsRunning!.status).toBe('RUNNING');

    // Complete: RUNNING -> COMPLETED
    const completeRes = await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/complete`)
      .set('x-tenant-id', tenant.id)
      .send({ syncRunId, rowsIngested: 150 })
      .expect(201);
    expect(completeRes.body.status).toBe('COMPLETED');
    expect(completeRes.body.rowsIngested).toBe(150);

    // Verify DB state is COMPLETED
    const dsCompleted = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(dsCompleted!.status).toBe('COMPLETED');
  });

  it('should transition IDLE -> RUNNING -> FAILED', async () => {
    const ds = await prisma.dataSource.create({
      data: { tenantId: tenant.id, name: 'Fail Source', type: 'api' },
    });

    // Trigger: IDLE -> RUNNING
    const triggerRes = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set('x-tenant-id', tenant.id)
      .send({ dataSourceId: ds.id })
      .expect(201);
    const syncRunId = triggerRes.body.syncRunId;

    // Fail: RUNNING -> FAILED
    const failRes = await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/fail`)
      .set('x-tenant-id', tenant.id)
      .send({ syncRunId, errorLog: 'Connection timeout' })
      .expect(201);
    expect(failRes.body.status).toBe('FAILED');

    // Verify DB state
    const dsFailed = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(dsFailed!.status).toBe('FAILED');

    // Verify sync run recorded the error
    const syncRun = await prisma.syncRun.findUnique({ where: { id: syncRunId } });
    expect(syncRun!.status).toBe('failed');
    expect(syncRun!.errorLog).toBe('Connection timeout');
  });

  it('should allow re-run from COMPLETED state', async () => {
    const ds = await prisma.dataSource.create({
      data: { tenantId: tenant.id, name: 'Rerun Source', type: 'csv', status: 'COMPLETED' },
    });

    // Re-trigger: COMPLETED -> RUNNING
    const triggerRes = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set('x-tenant-id', tenant.id)
      .send({ dataSourceId: ds.id })
      .expect(201);
    expect(triggerRes.body.status).toBe('RUNNING');

    const dsRerun = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(dsRerun!.status).toBe('RUNNING');
  });

  it('should allow retry from FAILED state', async () => {
    const ds = await prisma.dataSource.create({
      data: { tenantId: tenant.id, name: 'Retry Source', type: 'webhook', status: 'FAILED' },
    });

    const triggerRes = await request(app.getHttpServer())
      .post('/pipelines/trigger')
      .set('x-tenant-id', tenant.id)
      .send({ dataSourceId: ds.id })
      .expect(201);
    expect(triggerRes.body.status).toBe('RUNNING');
  });

  it('should reject invalid transition IDLE -> COMPLETED via HTTP', async () => {
    const ds = await prisma.dataSource.create({
      data: { tenantId: tenant.id, name: 'Invalid Source', type: 'api' },
    });

    // Try to complete without running first
    const res = await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/complete`)
      .set('x-tenant-id', tenant.id)
      .send({ syncRunId: 'fake-run', rowsIngested: 0 })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');

    // Verify DB state unchanged
    const dsUnchanged = await prisma.dataSource.findUnique({ where: { id: ds.id } });
    expect(dsUnchanged!.status).toBe('IDLE');
  });

  it('should reject invalid transition IDLE -> FAILED via HTTP', async () => {
    const ds = await prisma.dataSource.create({
      data: { tenantId: tenant.id, name: 'Invalid Fail Source', type: 'api' },
    });

    const res = await request(app.getHttpServer())
      .post(`/pipelines/${ds.id}/fail`)
      .set('x-tenant-id', tenant.id)
      .send({ syncRunId: 'fake-run', errorLog: 'should not work' })
      .expect(400);

    expect(res.body.message).toContain('Invalid transition');
  });
});
