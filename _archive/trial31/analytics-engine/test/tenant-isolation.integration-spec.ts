import { PrismaClient } from '@prisma/client';
import {
  setupTestDatabase,
  teardownTestDatabase,
  truncateAllTables,
  createTestTenant,
  createTestDataSource,
  createTestDashboard,
} from './helpers/integration.helper';

describe('Tenant Isolation Integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);
  });

  it('should isolate dashboards between tenants', async () => {
    const tenantA = await createTestTenant(prisma, { name: 'Tenant A', apiKey: 'key-a' });
    const tenantB = await createTestTenant(prisma, { name: 'Tenant B', apiKey: 'key-b' });

    await createTestDashboard(prisma, tenantA.id, { name: 'Dashboard A' });
    await createTestDashboard(prisma, tenantB.id, { name: 'Dashboard B' });

    const dashboardsA = await prisma.dashboard.findMany({
      where: { tenantId: tenantA.id },
    });
    const dashboardsB = await prisma.dashboard.findMany({
      where: { tenantId: tenantB.id },
    });

    expect(dashboardsA).toHaveLength(1);
    expect(dashboardsA[0].name).toBe('Dashboard A');
    expect(dashboardsB).toHaveLength(1);
    expect(dashboardsB[0].name).toBe('Dashboard B');
  });

  it('should isolate data sources between tenants', async () => {
    const tenantA = await createTestTenant(prisma, { name: 'Tenant A', apiKey: 'key-a' });
    const tenantB = await createTestTenant(prisma, { name: 'Tenant B', apiKey: 'key-b' });

    await createTestDataSource(prisma, tenantA.id, { name: 'Source A' });
    await createTestDataSource(prisma, tenantB.id, { name: 'Source B' });

    const sourcesA = await prisma.dataSource.findMany({
      where: { tenantId: tenantA.id },
    });
    expect(sourcesA).toHaveLength(1);
    expect(sourcesA[0].name).toBe('Source A');
  });

  it('should cascade delete dashboards when tenant is deleted', async () => {
    const tenant = await createTestTenant(prisma);
    await createTestDashboard(prisma, tenant.id);
    await createTestDashboard(prisma, tenant.id, { name: 'Second' });

    await prisma.tenant.delete({ where: { id: tenant.id } });

    const dashboards = await prisma.dashboard.findMany({
      where: { tenantId: tenant.id },
    });
    expect(dashboards).toHaveLength(0);
  });

  it('should cascade delete data sources when tenant is deleted', async () => {
    const tenant = await createTestTenant(prisma);
    await createTestDataSource(prisma, tenant.id);

    await prisma.tenant.delete({ where: { id: tenant.id } });

    const sources = await prisma.dataSource.findMany({
      where: { tenantId: tenant.id },
    });
    expect(sources).toHaveLength(0);
  });

  it('should cascade delete widgets when dashboard is deleted', async () => {
    const tenant = await createTestTenant(prisma);
    const dashboard = await createTestDashboard(prisma, tenant.id);
    await prisma.widget.create({
      data: { dashboardId: dashboard.id, type: 'chart', config: {} },
    });

    await prisma.dashboard.delete({ where: { id: dashboard.id } });

    const widgets = await prisma.widget.findMany({
      where: { dashboardId: dashboard.id },
    });
    expect(widgets).toHaveLength(0);
  });

  it('should cascade delete sync runs when data source is deleted', async () => {
    const tenant = await createTestTenant(prisma);
    const ds = await createTestDataSource(prisma, tenant.id);
    await prisma.syncRun.create({
      data: { dataSourceId: ds.id, status: 'pending' },
    });

    await prisma.dataSource.delete({ where: { id: ds.id } });

    const syncRuns = await prisma.syncRun.findMany({
      where: { dataSourceId: ds.id },
    });
    expect(syncRuns).toHaveLength(0);
  });

  it('should enforce unique apiKey across tenants', async () => {
    await createTestTenant(prisma, { apiKey: 'unique-key' });
    await expect(
      createTestTenant(prisma, { name: 'Another', apiKey: 'unique-key' }),
    ).rejects.toThrow();
  });

  it('should allow each tenant to have their own data points', async () => {
    const tenantA = await createTestTenant(prisma, { name: 'A', apiKey: 'key-a' });
    const tenantB = await createTestTenant(prisma, { name: 'B', apiKey: 'key-b' });
    const dsA = await createTestDataSource(prisma, tenantA.id);
    const dsB = await createTestDataSource(prisma, tenantB.id);

    await prisma.dataPoint.create({
      data: { dataSourceId: dsA.id, timestamp: new Date(), metrics: { views: 10 } },
    });
    await prisma.dataPoint.create({
      data: { dataSourceId: dsB.id, timestamp: new Date(), metrics: { views: 20 } },
    });

    const pointsA = await prisma.dataPoint.findMany({ where: { dataSourceId: dsA.id } });
    const pointsB = await prisma.dataPoint.findMany({ where: { dataSourceId: dsB.id } });

    expect(pointsA).toHaveLength(1);
    expect((pointsA[0].metrics as any).views).toBe(10);
    expect(pointsB).toHaveLength(1);
    expect((pointsB[0].metrics as any).views).toBe(20);
  });
});
