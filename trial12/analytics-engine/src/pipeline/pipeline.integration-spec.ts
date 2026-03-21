import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

describe('Pipeline Integration', () => {
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
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.$executeRaw(
      Prisma.sql`TRUNCATE "Tenant", "Dashboard", "Widget", "DataSource", "DataSourceConfig", "SyncRun", "DataPoint", "EmbedConfig", "QueryCache", "DeadLetterEvent" CASCADE`,
    );

    const tenant = await prisma.tenant.create({
      data: { name: 'Pipeline Test Tenant', apiKey: 'ak_pipeline_test' },
    });
    tenantId = tenant.id;

    const ds = await prisma.dataSource.create({
      data: { tenantId, name: 'Test DS', type: 'POSTGRESQL' },
    });
    dataSourceId = ds.id;
  });

  it('should start a sync run in RUNNING state', async () => {
    const res = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    expect(res.body.status).toBe('RUNNING');
    expect(res.body.dataSourceId).toBe(dataSourceId);
  });

  it('should transition RUNNING -> COMPLETED', async () => {
    const startRes = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${startRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'COMPLETED', rowsIngested: 42 })
      .expect(200);

    expect(res.body.status).toBe('COMPLETED');
    expect(res.body.rowsIngested).toBe(42);
    expect(res.body.completedAt).toBeDefined();
  });

  it('should transition RUNNING -> FAILED', async () => {
    const startRes = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${startRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'FAILED', errorLog: 'Connection timeout' })
      .expect(200);

    expect(res.body.status).toBe('FAILED');
    expect(res.body.errorLog).toBe('Connection timeout');
  });

  it('should reject invalid state transition COMPLETED -> RUNNING', async () => {
    const startRes = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${startRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'COMPLETED', rowsIngested: 10 })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${startRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'RUNNING' })
      .expect(400);
  });

  it('should reject invalid state transition FAILED -> COMPLETED', async () => {
    const startRes = await request(app.getHttpServer())
      .post(`/pipeline/datasources/${dataSourceId}/sync`)
      .set('x-tenant-id', tenantId)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${startRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'FAILED', errorLog: 'err' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/pipeline/sync-runs/${startRes.body.id}`)
      .set('x-tenant-id', tenantId)
      .send({ status: 'COMPLETED' })
      .expect(400);
  });
});
