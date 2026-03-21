import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/modules/prisma/prisma.service';
import { AppModule } from '../../src/app.module';

describe('DataSource E2E — Tenant Isolation', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tenantA: { id: string };
  let tenantB: { id: string };
  let dataSourceByTenantA: { id: string };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    tenantA = await prisma.tenant.create({ data: { name: 'DS Tenant A' } });
    tenantB = await prisma.tenant.create({ data: { name: 'DS Tenant B' } });

    dataSourceByTenantA = await prisma.dataSource.create({
      data: { tenantId: tenantA.id, name: 'Sales API', type: 'api' },
    });
  });

  afterAll(async () => {
    await prisma.dataSource.deleteMany({});
    await prisma.tenant.deleteMany({});
    await app.close();
  });

  it('should allow Tenant A to access its own data source', async () => {
    const response = await request(app.getHttpServer())
      .get(`/data-sources/${dataSourceByTenantA.id}`)
      .set('x-tenant-id', tenantA.id)
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe(dataSourceByTenantA.id);
  });

  // [VERIFY:TENANT_ISOLATION] Cross-tenant access must return 404
  it('should return 404 when Tenant B tries to access Tenant A data source', async () => {
    await request(app.getHttpServer())
      .get(`/data-sources/${dataSourceByTenantA.id}`)
      .set('x-tenant-id', tenantB.id)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should return 404 when Tenant B tries to delete Tenant A data source', async () => {
    await request(app.getHttpServer())
      .delete(`/data-sources/${dataSourceByTenantA.id}`)
      .set('x-tenant-id', tenantB.id)
      .expect(HttpStatus.NOT_FOUND);
  });
});
