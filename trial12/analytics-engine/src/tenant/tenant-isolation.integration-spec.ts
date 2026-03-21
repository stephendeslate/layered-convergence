import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';

describe('Tenant Isolation Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantA: { id: string; apiKey: string };
  let tenantB: { id: string; apiKey: string };

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

    const a = await prisma.tenant.create({
      data: { name: 'Tenant A', apiKey: 'ak_tenant_a' },
    });
    tenantA = { id: a.id, apiKey: a.apiKey };

    const b = await prisma.tenant.create({
      data: { name: 'Tenant B', apiKey: 'ak_tenant_b' },
    });
    tenantB = { id: b.id, apiKey: b.apiKey };
  });

  it('should isolate dashboards between tenants', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenantA.id)
      .send({ name: 'Dashboard A', layout: { cols: 12 } })
      .expect(201);

    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenantB.id)
      .send({ name: 'Dashboard B', layout: { cols: 6 } })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenantA.id)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('Dashboard A');

    const resB = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenantB.id)
      .expect(200);

    expect(resB.body).toHaveLength(1);
    expect(resB.body[0].name).toBe('Dashboard B');
  });

  it('should prevent tenant A from accessing tenant B dashboard', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenantB.id)
      .send({ name: 'Secret Dashboard', layout: {} })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/dashboards/${createRes.body.id}`)
      .set('x-tenant-id', tenantA.id)
      .expect(404);
  });

  it('should isolate data sources between tenants', async () => {
    await request(app.getHttpServer())
      .post('/datasources')
      .set('x-tenant-id', tenantA.id)
      .send({ name: 'DS A', type: 'POSTGRESQL' })
      .expect(201);

    const resA = await request(app.getHttpServer())
      .get('/datasources')
      .set('x-tenant-id', tenantA.id)
      .expect(200);

    expect(resA.body).toHaveLength(1);

    const resB = await request(app.getHttpServer())
      .get('/datasources')
      .set('x-tenant-id', tenantB.id)
      .expect(200);

    expect(resB.body).toHaveLength(0);
  });

  it('should isolate data points between tenants', async () => {
    const dsA = await prisma.dataSource.create({
      data: { tenantId: tenantA.id, name: 'DS A', type: 'API' },
    });

    await prisma.dataPoint.create({
      data: {
        tenantId: tenantA.id,
        dataSourceId: dsA.id,
        timestamp: new Date(),
        dimensions: { region: 'US' },
        metrics: { value: 100 },
      },
    });

    const resA = await request(app.getHttpServer())
      .get('/datapoints')
      .set('x-tenant-id', tenantA.id)
      .expect(200);

    expect(resA.body).toHaveLength(1);

    const resB = await request(app.getHttpServer())
      .get('/datapoints')
      .set('x-tenant-id', tenantB.id)
      .expect(200);

    expect(resB.body).toHaveLength(0);
  });
});
