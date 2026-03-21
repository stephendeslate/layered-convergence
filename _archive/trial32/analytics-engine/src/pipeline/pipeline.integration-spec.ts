import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import request from 'supertest';

describe('Pipeline State Machine (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantId: string;
  let dataSourceId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    prisma = moduleRef.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      'TRUNCATE "Tenant", "Dashboard", "Widget", "DataSource", "DataSourceConfig", "SyncRun", "DataPoint", "EmbedConfig", "QueryCache", "DeadLetterEvent" CASCADE',
    );

    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant', apiKey: 'ak_state_test' },
    });
    tenantId = tenant.id;

    const ds = await prisma.dataSource.create({
      data: { tenantId, name: 'Test DS', type: 'API' },
    });
    dataSourceId = ds.id;
  });

  it('should create a sync run in RUNNING state', async () => {
    const res = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    expect(res.body.status).toBe('RUNNING');
    expect(res.body.dataSourceId).toBe(dataSourceId);
  });

  it('should transition RUNNING -> COMPLETED', async () => {
    const syncRes = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    const updateRes = await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'COMPLETED', rowsIngested: 100 })
      .expect(200);

    expect(updateRes.body.status).toBe('COMPLETED');
    expect(updateRes.body.rowsIngested).toBe(100);
  });

  it('should transition RUNNING -> FAILED', async () => {
    const syncRes = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    const updateRes = await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'FAILED', errorLog: 'connection timeout' })
      .expect(200);

    expect(updateRes.body.status).toBe('FAILED');
    expect(updateRes.body.errorLog).toBe('connection timeout');
  });

  it('should reject COMPLETED -> RUNNING (invalid transition)', async () => {
    const syncRes = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'COMPLETED' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'RUNNING' })
      .expect(400);
  });

  it('should reject FAILED -> COMPLETED (invalid transition)', async () => {
    const syncRes = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'FAILED' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should reject COMPLETED -> COMPLETED (no self-transition)', async () => {
    const syncRes = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'COMPLETED' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${syncRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });

  it('should retrieve sync run history', async () => {
    await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/pipeline/datasources/${dataSourceId}/sync-runs`)
      .set('x-tenant-id', tenantId)
      .expect(200);

    expect(res.body).toHaveLength(2);
  });
});
