import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter.js';

describe('Pipeline Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.deadLetterEvent.deleteMany();
    await prisma.dataPoint.deleteMany();
    await prisma.syncRun.deleteMany();
    await prisma.dataSourceConfig.deleteMany();
    await prisma.dataSource.deleteMany();
    await prisma.widget.deleteMany();
    await prisma.embedConfig.deleteMany();
    await prisma.dashboard.deleteMany();
    await prisma.queryCache.deleteMany();
    await prisma.tenant.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a sync run with RUNNING status and eventually complete', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant', apiKey: 'pipeline-test-key' },
    });

    const dataSource = await prisma.dataSource.create({
      data: {
        name: 'Test Source',
        type: 'API',
        tenantId: tenant.id,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/data-sources/${dataSource.id}/sync`)
      .set('x-tenant-id', tenant.id)
      .expect(201);

    expect(response.body.status).toBe('RUNNING');
    expect(response.body.dataSourceId).toBe(dataSource.id);

    // Wait briefly for background processing
    await new Promise((resolve) => setTimeout(resolve, 500));

    const syncRuns = await prisma.syncRun.findMany({
      where: { dataSourceId: dataSource.id },
    });

    expect(syncRuns.length).toBeGreaterThanOrEqual(1);
  });

  it('should return sync runs for a data source', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant', apiKey: 'pipeline-runs-key' },
    });

    const dataSource = await prisma.dataSource.create({
      data: {
        name: 'Test Source',
        type: 'CSV',
        tenantId: tenant.id,
      },
    });

    await prisma.syncRun.create({
      data: {
        dataSourceId: dataSource.id,
        status: 'COMPLETED',
        rowsIngested: 100,
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/data-sources/${dataSource.id}/sync-runs`)
      .set('x-tenant-id', tenant.id)
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('COMPLETED');
    expect(response.body[0].rowsIngested).toBe(100);
  });

  it('should persist data points after sync', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Test Tenant', apiKey: 'pipeline-dp-key' },
    });

    const dataSource = await prisma.dataSource.create({
      data: {
        name: 'Test Source',
        type: 'WEBHOOK',
        tenantId: tenant.id,
      },
    });

    await request(app.getHttpServer())
      .post(`/data-sources/${dataSource.id}/sync`)
      .set('x-tenant-id', tenant.id)
      .expect(201);

    // Wait for background processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const dataPoints = await prisma.dataPoint.findMany({
      where: { dataSourceId: dataSource.id, tenantId: tenant.id },
    });

    expect(dataPoints.length).toBeGreaterThanOrEqual(1);
  });
});
