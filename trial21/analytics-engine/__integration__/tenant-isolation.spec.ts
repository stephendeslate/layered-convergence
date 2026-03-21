// [TRACED:TS-004] Integration test for tenant isolation using Test.createTestingModule
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from '@/dashboard/dashboard.service';
import { PrismaService } from '@/prisma/prisma.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { TenantContextModule } from '@/tenant-context/tenant-context.module';
import { DashboardModule } from '@/dashboard/dashboard.module';
import { NotFoundException } from '@nestjs/common';

/**
 * Integration test: Tenant isolation verification.
 * Uses Test.createTestingModule to exercise the NestJS service layer (FM #61).
 */
describe('Tenant Isolation (Integration)', () => {
  let module: TestingModule;
  let dashboardService: DashboardService;
  let prisma: PrismaService;
  let tenantAId: string;
  let tenantBId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule, TenantContextModule, DashboardModule],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
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
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantAId, tenantBId] } } });
    await module.close();
  });

  it('should not allow Tenant B to access Tenant A dashboards', async () => {
    const dashboard = await dashboardService.create({ name: 'Secret Dashboard' }, tenantAId);

    await expect(
      dashboardService.findById(dashboard.id, tenantBId),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return only dashboards for the correct tenant', async () => {
    await dashboardService.create({ name: 'A Dashboard' }, tenantAId);
    await dashboardService.create({ name: 'B Dashboard' }, tenantBId);

    const aDashboards = await dashboardService.findAll(tenantAId);
    const bDashboards = await dashboardService.findAll(tenantBId);

    expect(aDashboards.every((d: { tenantId: string }) => d.tenantId === tenantAId)).toBe(true);
    expect(bDashboards.every((d: { tenantId: string }) => d.tenantId === tenantBId)).toBe(true);
  });
});
