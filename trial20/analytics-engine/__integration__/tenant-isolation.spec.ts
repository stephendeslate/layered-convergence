import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '@/dashboard/dashboard.service';
import { DataSourceService } from '@/data-source/data-source.service';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { TenantContextModule } from '@/tenant-context/tenant-context.module';
import { DashboardModule } from '@/dashboard/dashboard.module';
import { DataSourceModule } from '@/data-source/data-source.module';
import { NotFoundException } from '@nestjs/common';

/**
 * Integration test: Tenant isolation verification.
 * Uses Test.createTestingModule to exercise the NestJS service layer (FM #60).
 * Verifies that data from one tenant is not accessible by another.
 */
describe('Tenant Isolation (Integration)', () => {
  let module: TestingModule;
  let dashboardService: DashboardService;
  let dataSourceService: DataSourceService;
  let prisma: PrismaService;
  let tenantAId: string;
  let tenantBId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        PrismaModule,
        TenantContextModule,
        DashboardModule,
        DataSourceModule,
      ],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
    dataSourceService = module.get<DataSourceService>(DataSourceService);
    prisma = module.get<PrismaService>(PrismaService);

    const tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', slug: `tenant-a-${Date.now()}` },
    });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', slug: `tenant-b-${Date.now()}` },
    });
    tenantBId = tenantB.id;
  });

  afterAll(async () => {
    await prisma.dashboard.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.dataSource.deleteMany({ where: { tenantId: { in: [tenantAId, tenantBId] } } });
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    await module.close();
  });

  describe('Dashboard isolation', () => {
    it('should only return dashboards for the requesting tenant', async () => {
      await dashboardService.create({ name: 'Dashboard A' }, tenantAId);
      await dashboardService.create({ name: 'Dashboard B' }, tenantBId);

      const dashboardsA = await dashboardService.findAll(tenantAId);
      const dashboardsB = await dashboardService.findAll(tenantBId);

      expect(dashboardsA.every((d) => d.tenantId === tenantAId)).toBe(true);
      expect(dashboardsB.every((d) => d.tenantId === tenantBId)).toBe(true);
    });

    it('should not allow tenant B to access tenant A dashboard', async () => {
      const dashA = await dashboardService.create({ name: 'Secret A' }, tenantAId);

      await expect(
        dashboardService.findById(dashA.id, tenantBId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('DataSource isolation', () => {
    it('should only return data sources for the requesting tenant', async () => {
      await dataSourceService.create({ name: 'Source A', type: 'api' }, tenantAId);
      await dataSourceService.create({ name: 'Source B', type: 'csv' }, tenantBId);

      const sourcesA = await dataSourceService.findAll(tenantAId);
      const sourcesB = await dataSourceService.findAll(tenantBId);

      expect(sourcesA.every((s) => s.tenantId === tenantAId)).toBe(true);
      expect(sourcesB.every((s) => s.tenantId === tenantBId)).toBe(true);
    });

    it('should not allow tenant B to access tenant A data source', async () => {
      const sourceA = await dataSourceService.create({ name: 'Private A', type: 'db' }, tenantAId);

      await expect(
        dataSourceService.findById(sourceA.id, tenantBId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should not allow tenant B to delete tenant A data source', async () => {
      const sourceA = await dataSourceService.create({ name: 'Protected A', type: 'api' }, tenantAId);

      await expect(
        dataSourceService.delete(sourceA.id, tenantBId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
