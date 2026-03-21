import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/app.module';

describe('Dashboard E2E — Tenant Isolation', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantA: { id: string; apiKey: string };
  let tenantB: { id: string; apiKey: string };
  let dashboardByTenantA: { id: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    // Seed two tenants
    tenantA = await prisma.tenant.create({ data: { name: 'Tenant A' } });
    tenantB = await prisma.tenant.create({ data: { name: 'Tenant B' } });

    // Create a dashboard owned by Tenant A
    dashboardByTenantA = await prisma.dashboard.create({
      data: { tenantId: tenantA.id, name: 'Tenant A Dashboard' },
    });
  });

  afterAll(async () => {
    await prisma.dashboard.deleteMany({});
    await prisma.tenant.deleteMany({});
    await app.close();
  });

  it('should allow Tenant A to access its own dashboard', async () => {
    const response = await request(app.getHttpServer())
      .get(`/dashboards/${dashboardByTenantA.id}`)
      .set('x-tenant-id', tenantA.id)
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(dashboardByTenantA.id);
    expect(response.body.tenantId).toBe(tenantA.id);
  });

  // [VERIFY:TENANT_ISOLATION] Cross-tenant access must return 404
  it('should return 404 when Tenant B tries to access Tenant A dashboard', async () => {
    await request(app.getHttpServer())
      .get(`/dashboards/${dashboardByTenantA.id}`)
      .set('x-tenant-id', tenantB.id)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return empty list when Tenant B lists dashboards', async () => {
    const response = await request(app.getHttpServer())
      .get('/dashboards')
      .set('x-tenant-id', tenantB.id)
      .expect(HttpStatus.OK);

    expect(response.body).toEqual([]);
  });

  // Cross-tenant update must fail
  it('should return 404 when Tenant B tries to update Tenant A dashboard', async () => {
    await request(app.getHttpServer())
      .patch(`/dashboards/${dashboardByTenantA.id}`)
      .set('x-tenant-id', tenantB.id)
      .send({ name: 'Hijacked' })
      .expect(HttpStatus.NOT_FOUND);
  });

  // Cross-tenant delete must fail
  it('should return 404 when Tenant B tries to delete Tenant A dashboard', async () => {
    await request(app.getHttpServer())
      .delete(`/dashboards/${dashboardByTenantA.id}`)
      .set('x-tenant-id', tenantB.id)
      .expect(HttpStatus.NOT_FOUND);
  });
});
