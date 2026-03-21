import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { createTestApp, truncateAll } from '../test/integration-helpers.js';
import request from 'supertest';

describe('Tenant Isolation (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantA: { id: string; apiKey: string };
  let tenantB: { id: string; apiKey: string };

  beforeAll(async () => {
    ({ app, prisma } = await createTestApp());
  });

  beforeEach(async () => {
    await truncateAll(prisma);

    tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', apiKey: 'ak_tenant_a_isolation' },
    });
    tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', apiKey: 'ak_tenant_b_isolation' },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should only return dashboards belonging to the requesting tenant', async () => {
    await prisma.dashboard.create({
      data: {
        tenantId: tenantA.id,
        name: 'Dashboard A',
        layout: {},
      },
    });
    await prisma.dashboard.create({
      data: {
        tenantId: tenantB.id,
        name: 'Dashboard B',
        layout: {},
      },
    });

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

  it('should not allow tenant A to access tenant B dashboard by ID', async () => {
    const dashB = await prisma.dashboard.create({
      data: {
        tenantId: tenantB.id,
        name: 'Dashboard B Secret',
        layout: {},
      },
    });

    await request(app.getHttpServer())
      .get(`/dashboards/${dashB.id}`)
      .set('x-tenant-id', tenantA.id)
      .expect(404);
  });

  it('should isolate data sources between tenants', async () => {
    await prisma.dataSource.create({
      data: { tenantId: tenantA.id, name: 'DS-A', type: 'API' },
    });
    await prisma.dataSource.create({
      data: { tenantId: tenantB.id, name: 'DS-B', type: 'CSV' },
    });

    const resA = await request(app.getHttpServer())
      .get('/datasources')
      .set('x-tenant-id', tenantA.id)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].name).toBe('DS-A');
  });

  it('should not allow tenant A to access tenant B data source by ID', async () => {
    const dsB = await prisma.dataSource.create({
      data: { tenantId: tenantB.id, name: 'DS-B', type: 'API' },
    });

    await request(app.getHttpServer())
      .get(`/datasources/${dsB.id}`)
      .set('x-tenant-id', tenantA.id)
      .expect(404);
  });

  it('should create dashboards scoped to the requesting tenant', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenantA.id)
      .send({ name: 'New Dashboard', layout: { columns: 2 } })
      .expect(201);

    expect(res.body.tenantId).toBe(tenantA.id);

    const dashboards = await prisma.dashboard.findMany({
      where: { tenantId: tenantB.id },
    });
    expect(dashboards).toHaveLength(0);
  });

  it('should isolate data points between tenants', async () => {
    const dsA = await prisma.dataSource.create({
      data: { tenantId: tenantA.id, name: 'DS-A', type: 'API' },
    });
    const dsB = await prisma.dataSource.create({
      data: { tenantId: tenantB.id, name: 'DS-B', type: 'API' },
    });

    await prisma.dataPoint.create({
      data: {
        tenantId: tenantA.id,
        dataSourceId: dsA.id,
        timestamp: new Date(),
        dimensions: {},
        metrics: { revenue: 100 },
      },
    });
    await prisma.dataPoint.create({
      data: {
        tenantId: tenantB.id,
        dataSourceId: dsB.id,
        timestamp: new Date(),
        dimensions: {},
        metrics: { revenue: 200 },
      },
    });

    const resA = await request(app.getHttpServer())
      .get('/datapoints')
      .set('x-tenant-id', tenantA.id)
      .expect(200);

    expect(resA.body).toHaveLength(1);
    expect(resA.body[0].metrics).toEqual({ revenue: 100 });
  });
});
