import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter.js';

describe('Tenant Isolation Integration', () => {
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

  it('should isolate dashboards between tenants', async () => {
    const tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', apiKey: 'key-a' },
    });

    const tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', apiKey: 'key-b' },
    });

    // Create dashboard as Tenant A
    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenantA.id)
      .send({ name: 'Tenant A Dashboard' })
      .expect(201);

    // Query dashboards as Tenant B
    const response = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenantB.id)
      .expect(200);

    expect(response.body).toHaveLength(0);
  });

  it('should isolate data sources between tenants', async () => {
    const tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', apiKey: 'key-a-ds' },
    });

    const tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', apiKey: 'key-b-ds' },
    });

    // Create data source as Tenant A
    await request(app.getHttpServer())
      .post('/data-sources')
      .set('x-tenant-id', tenantA.id)
      .send({ name: 'A Source', type: 'API' })
      .expect(201);

    // Query data sources as Tenant B
    const response = await request(app.getHttpServer())
      .get('/data-sources')
      .set('x-tenant-id', tenantB.id)
      .expect(200);

    expect(response.body).toHaveLength(0);
  });

  it('should prevent Tenant B from accessing Tenant A dashboard by ID', async () => {
    const tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', apiKey: 'key-a-access' },
    });

    const tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', apiKey: 'key-b-access' },
    });

    const dashResponse = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenantA.id)
      .send({ name: 'Private Dashboard' })
      .expect(201);

    // Try to access Tenant A's dashboard as Tenant B
    await request(app.getHttpServer())
      .get(`/dashboards/${dashResponse.body.id}`)
      .set('x-tenant-id', tenantB.id)
      .expect(404);
  });
});
