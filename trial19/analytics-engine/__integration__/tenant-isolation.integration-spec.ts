import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { DashboardModule } from '../src/dashboard/dashboard.module';
import { DataSourceService } from '../src/data-source/data-source.service';
import { DataSourceModule } from '../src/data-source/data-source.module';
import { PipelineService } from '../src/pipeline/pipeline.service';
import { PipelineModule } from '../src/pipeline/pipeline.module';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://testuser:testpass@localhost:5433/analytics_test';

describe('Tenant Isolation (Integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let dashboardService: DashboardService;
  let dataSourceService: DataSourceService;
  let pipelineService: PipelineService;
  let tenantAId: string;
  let tenantBId: string;

  beforeAll(async () => {
    process.env.DATABASE_URL = DATABASE_URL;

    module = await Test.createTestingModule({
      imports: [PrismaModule, DashboardModule, DataSourceModule, PipelineModule],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    dashboardService = module.get<DashboardService>(DashboardService);
    dataSourceService = module.get<DataSourceService>(DataSourceService);
    pipelineService = module.get<PipelineService>(PipelineService);

    await prisma.$connect();

    // Cleanup using $executeRaw with tagged template literals
    await prisma.$executeRaw`DELETE FROM widgets`;
    await prisma.$executeRaw`DELETE FROM embeds`;
    await prisma.$executeRaw`DELETE FROM dashboards`;
    await prisma.$executeRaw`DELETE FROM pipelines`;
    await prisma.$executeRaw`DELETE FROM data_points`;
    await prisma.$executeRaw`DELETE FROM sync_runs`;
    await prisma.$executeRaw`DELETE FROM data_sources`;
    await prisma.$executeRaw`DELETE FROM users`;
    await prisma.$executeRaw`DELETE FROM tenants`;

    const tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', slug: 'tenant-a-isolation-t19' },
    });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', slug: 'tenant-b-isolation-t19' },
    });
    tenantBId = tenantB.id;
  });

  afterAll(async () => {
    await prisma.$executeRaw`DELETE FROM widgets`;
    await prisma.$executeRaw`DELETE FROM embeds`;
    await prisma.$executeRaw`DELETE FROM dashboards`;
    await prisma.$executeRaw`DELETE FROM pipelines`;
    await prisma.$executeRaw`DELETE FROM data_points`;
    await prisma.$executeRaw`DELETE FROM sync_runs`;
    await prisma.$executeRaw`DELETE FROM data_sources`;
    await prisma.$executeRaw`DELETE FROM users`;
    await prisma.$executeRaw`DELETE FROM tenants`;
    await prisma.$disconnect();
    await module.close();
  });

  it('should isolate dashboards between tenants via service layer', async () => {
    await dashboardService.create(tenantAId, { name: 'Dashboard A' });
    await dashboardService.create(tenantBId, { name: 'Dashboard B' });

    const dashboardsA = await dashboardService.findAll(tenantAId);
    const dashboardsB = await dashboardService.findAll(tenantBId);

    expect(dashboardsA).toHaveLength(1);
    expect(dashboardsA[0].name).toBe('Dashboard A');
    expect(dashboardsB).toHaveLength(1);
    expect(dashboardsB[0].name).toBe('Dashboard B');
  });

  it('should isolate data sources between tenants via service layer', async () => {
    await dataSourceService.create(tenantAId, {
      name: 'Source A',
      type: 'POSTGRESQL',
      connectionString: 'postgres://a.db:5432/test',
    });

    await dataSourceService.create(tenantBId, {
      name: 'Source B',
      type: 'API',
      connectionString: 'https://api.b.com',
    });

    const sourcesA = await dataSourceService.findAll(tenantAId);
    const sourcesB = await dataSourceService.findAll(tenantBId);

    expect(sourcesA).toHaveLength(1);
    expect(sourcesA[0].name).toBe('Source A');
    expect(sourcesB).toHaveLength(1);
    expect(sourcesB[0].name).toBe('Source B');
  });

  it('should deny cross-tenant dashboard access via service layer', async () => {
    const dashboardsA = await dashboardService.findAll(tenantAId);
    const dashboardAId = dashboardsA[0].id;

    // Tenant B should not be able to access Tenant A's dashboard
    await expect(
      dashboardService.findOne(tenantBId, dashboardAId),
    ).rejects.toThrow(NotFoundException);
  });

  it('should deny cross-tenant data source access via service layer', async () => {
    const sourcesA = await dataSourceService.findAll(tenantAId);
    const sourceAId = sourcesA[0].id;

    // Tenant B should not be able to access Tenant A's data source
    await expect(
      dataSourceService.findOne(tenantBId, sourceAId),
    ).rejects.toThrow(NotFoundException);
  });

  it('should deny cross-tenant pipeline access via service layer', async () => {
    const sourcesA = await dataSourceService.findAll(tenantAId);

    const pipeline = await pipelineService.create(tenantAId, {
      name: 'Pipeline A',
      dataSourceId: sourcesA[0].id,
    });

    // Tenant B should not be able to access Tenant A's pipeline
    await expect(
      pipelineService.findOne(tenantBId, pipeline.id),
    ).rejects.toThrow(NotFoundException);
  });
});
