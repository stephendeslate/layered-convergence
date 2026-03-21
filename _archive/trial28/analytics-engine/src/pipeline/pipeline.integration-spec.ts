import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createTestApp, truncateAll } from '../test/integration-helpers.js';
import request from 'supertest';

describe('Pipeline State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let dataSourceId: string;

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  beforeEach(async () => {
    await truncateAll(prisma);

    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant', apiKey: 'ak_integration_pipeline' },
    });
    tenantId = tenant.id;

    const ds = await prisma.dataSource.create({
      data: { tenantId, name: 'Test DS', type: 'API' },
    });
    dataSourceId = ds.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a sync run in RUNNING state', async () => {
    const res = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    expect(res.body.status).toBe('RUNNING');
    expect(res.body.dataSourceId).toBe(dataSourceId);
  });

  it('should transition from RUNNING to COMPLETED', async () => {
    const syncRun = await prisma.syncRun.create({
      data: { dataSourceId, status: 'RUNNING' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRun.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'COMPLETED', rowsIngested: 42 })
      .expect(200);

    expect(res.body.status).toBe('COMPLETED');
    expect(res.body.rowsIngested).toBe(42);
    expect(res.body.completedAt).toBeDefined();
  });

  it('should transition from RUNNING to FAILED', async () => {
    const syncRun = await prisma.syncRun.create({
      data: { dataSourceId, status: 'RUNNING' },
    });

    const res = await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRun.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'FAILED', errorLog: 'Connection timeout' })
      .expect(200);

    expect(res.body.status).toBe('FAILED');
    expect(res.body.errorLog).toBe('Connection timeout');
  });

  it('should reject transition from COMPLETED to RUNNING', async () => {
    const syncRun = await prisma.syncRun.create({
      data: { dataSourceId, status: 'RUNNING' },
    });
    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRun.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'RUNNING' })
      .expect(400);
  });

  it('should reject transition from FAILED to COMPLETED', async () => {
    const syncRun = await prisma.syncRun.create({
      data: { dataSourceId, status: 'RUNNING' },
    });
    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: { status: 'FAILED', completedAt: new Date() },
    });

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRun.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should reject transition from COMPLETED to FAILED', async () => {
    const syncRun = await prisma.syncRun.create({
      data: { dataSourceId, status: 'RUNNING' },
    });
    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRun.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'FAILED' })
      .expect(400);
  });

  it('should create and list dead letter events', async () => {
    await prisma.deadLetterEvent.create({
      data: {
        dataSourceId,
        payload: { bad: 'data' },
        errorReason: 'parse error',
      },
    });

    const res = await request(app.getHttpServer())
      .get(`/pipeline/datasources/${dataSourceId}/dead-letter-events`)
      .set('x-tenant-id', tenantId)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].errorReason).toBe('parse error');
  });

  it('should track sync run history', async () => {
    await prisma.syncRun.createMany({
      data: [
        { dataSourceId, status: 'COMPLETED' },
        { dataSourceId, status: 'FAILED' },
        { dataSourceId, status: 'RUNNING' },
      ],
    });

    const res = await request(app.getHttpServer())
      .get(`/pipeline/datasources/${dataSourceId}/sync-runs`)
      .set('x-tenant-id', tenantId)
      .expect(200);

    expect(res.body).toHaveLength(3);
  });
});
