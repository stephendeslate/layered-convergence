/**
 * Analytics Engine — Tenant Isolation E2E Tests
 * Verifies cross-tenant access returns 404 (not data from other tenants).
 * Uses real Prisma client against test database — NO mocks.
 * Per v3.0: E2E tests must use real database, not Prisma mocks.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tenant Isolation (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantA: { id: string };
  let tenantB: { id: string };
  let dashboardA: { id: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Seed two tenants
    tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', apiKey: 'ak_test_a_' + Date.now() },
    });
    tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', apiKey: 'ak_test_b_' + Date.now() },
    });

    // Create a dashboard for Tenant A
    dashboardA = await prisma.dashboard.create({
      data: { tenantId: tenantA.id, name: 'Dashboard A' },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.dashboard.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });
    await app.close();
  });

  it('should return dashboards for the owning tenant', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenantA.id)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(dashboardA.id);
  });

  it('should return empty array for other tenant (cross-tenant isolation)', async () => {
    const res = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenantB.id)
      .expect(200);

    expect(res.body).toHaveLength(0);
  });

  it('should return 404 when accessing another tenant dashboard by ID', async () => {
    await request(app.getHttpServer())
      .get(`/dashboards/${dashboardA.id}`)
      .set('x-tenant-id', tenantB.id)
      .expect(404);
  });

  it('should return 404 when accessing data source from another tenant', async () => {
    const dataSource = await prisma.dataSource.create({
      data: { tenantId: tenantA.id, name: 'Test Source', type: 'WEBHOOK' },
    });

    await request(app.getHttpServer())
      .get(`/data-sources/${dataSource.id}`)
      .set('x-tenant-id', tenantB.id)
      .expect(404);

    // Cleanup
    await prisma.dataSource.delete({ where: { id: dataSource.id } });
  });
});

describe('Dashboard CRUD (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenant: { id: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);
    tenant = await prisma.tenant.create({
      data: { name: 'CRUD Tenant', apiKey: 'ak_crud_' + Date.now() },
    });
  });

  afterAll(async () => {
    await prisma.dashboard.deleteMany({ where: { tenantId: tenant.id } });
    await prisma.tenant.delete({ where: { id: tenant.id } });
    await app.close();
  });

  it('should create a dashboard with valid DTO', async () => {
    const res = await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenant.id)
      .send({ name: 'Test Dashboard' })
      .expect(201);

    expect(res.body.name).toBe('Test Dashboard');
    expect(res.body.tenantId).toBe(tenant.id);
  });

  it('should reject invalid DTO (empty name)', async () => {
    await request(app.getHttpServer())
      .post('/dashboards')
      .set('x-tenant-id', tenant.id)
      .send({ name: '' })
      .expect(400);
  });
});
