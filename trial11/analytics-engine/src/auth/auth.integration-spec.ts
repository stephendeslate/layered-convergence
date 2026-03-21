import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter.js';

describe('Auth Integration', () => {
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

  it('should reject requests without x-tenant-id header on protected endpoints', async () => {
    const response = await request(app.getHttpServer())
      .get('/dashboards')
      .expect(401);

    expect(response.body.message).toBe('x-tenant-id header is required');
  });

  it('should reject requests with empty x-tenant-id header', async () => {
    await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', '')
      .expect(401);
  });

  it('should allow requests with valid x-tenant-id header', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Auth Test', apiKey: 'auth-test-key' },
    });

    const response = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenant.id)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should not require x-tenant-id for tenant creation', async () => {
    const response = await request(app.getHttpServer())
      .post('/tenants')
      .send({ name: 'New Tenant' })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.apiKey).toBeDefined();
  });

  it('should not require x-tenant-id for webhook ingest', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'Webhook Test', apiKey: 'webhook-auth-key' },
    });

    const dataSource = await prisma.dataSource.create({
      data: {
        name: 'Webhook Source',
        type: 'WEBHOOK',
        tenantId: tenant.id,
      },
    });

    const response = await request(app.getHttpServer())
      .post(`/ingest/${tenant.apiKey}`)
      .send({
        dataSourceId: dataSource.id,
        dimensions: { region: 'us' },
        metrics: { count: 1 },
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
  });
});
