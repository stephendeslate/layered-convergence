import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
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

    const dashA = await prisma.dashboard.findMany({ where: { tenantId: tenantA.id } });
    const dashB = await prisma.dashboard.findMany({ where: { tenantId: tenantB.id } });

    expect(dashA).toHaveLength(1);
    expect(dashA[0].name).toBe('Dashboard A');
    expect(dashB).toHaveLength(1);
    expect(dashB[0].name).toBe('Dashboard B');
  });

  it('should isolate data sources between tenants', async () => {
    const tenantA = await createTestTenant(prisma, { name: 'Tenant A', apiKey: 'key-a-2' });
    const tenantB = await createTestTenant(prisma, { name: 'Tenant B', apiKey: 'key-b-2' });

    await createTestDataSource(prisma, tenantA.id, { name: 'DS A', type: 'api' });
    await createTestDataSource(prisma, tenantB.id, { name: 'DS B', type: 'webhook' });

    const dsA = await prisma.dataSource.findMany({ where: { tenantId: tenantA.id } });
    const dsB = await prisma.dataSource.findMany({ where: { tenantId: tenantB.id } });

    expect(dsA).toHaveLength(1);
    expect(dsA[0].name).toBe('DS A');
    expect(dsB).toHaveLength(1);
    expect(dsB[0].name).toBe('DS B');
  });

  it('should isolate data points between tenants via data source', async () => {
    const tenantA = await createTestTenant(prisma, { name: 'Tenant A', apiKey: 'key-a-3' });
    const tenantB = await createTestTenant(prisma, { name: 'Tenant B', apiKey: 'key-b-3' });

    const dsA = await createTestDataSource(prisma, tenantA.id);
    const dsB = await createTestDataSource(prisma, tenantB.id);

    await prisma.dataPoint.create({
      data: {
        dataSourceId: dsA.id,
        timestamp: new Date(),
        dimensions: { page: '/home' },
        metrics: { views: 100 },
      },
    });
    await prisma.dataPoint.create({
      data: {
        dataSourceId: dsB.id,
        timestamp: new Date(),
        dimensions: { page: '/about' },
        metrics: { views: 50 },
      },
    });

    const pointsA = await prisma.dataPoint.findMany({ where: { dataSourceId: dsA.id } });
    const pointsB = await prisma.dataPoint.findMany({ where: { dataSourceId: dsB.id } });

    expect(pointsA).toHaveLength(1);
    expect((pointsA[0].metrics as any).views).toBe(100);
    expect(pointsB).toHaveLength(1);
    expect((pointsB[0].metrics as any).views).toBe(50);
  });

  it('should cascade delete tenant data', async () => {
    const tenant = await createTestTenant(prisma, { apiKey: 'cascade-key' });
    const dashboard = await createTestDashboard(prisma, tenant.id);
    await prisma.widget.create({
      data: { dashboardId: dashboard.id, type: 'line_chart' },
    });
    const ds = await createTestDataSource(prisma, tenant.id);
    await prisma.dataPoint.create({
      data: {
        dataSourceId: ds.id,
        timestamp: new Date(),
        dimensions: {},
        metrics: {},
      },
    });

    await prisma.tenant.delete({ where: { id: tenant.id } });

    const dashboards = await prisma.dashboard.findMany({ where: { tenantId: tenant.id } });
    const dataSources = await prisma.dataSource.findMany({ where: { tenantId: tenant.id } });
    expect(dashboards).toHaveLength(0);
    expect(dataSources).toHaveLength(0);
  });

  it('should enforce unique API keys across tenants', async () => {
    await createTestTenant(prisma, { apiKey: 'unique-key' });
    await expect(
      createTestTenant(prisma, { name: 'Duplicate', apiKey: 'unique-key' }),
    ).rejects.toThrow();
  });

  it('should isolate embed configs between tenants', async () => {
    const tenantA = await createTestTenant(prisma, { apiKey: 'embed-key-a' });
    const tenantB = await createTestTenant(prisma, { apiKey: 'embed-key-b' });

    const dashA = await createTestDashboard(prisma, tenantA.id);
    const dashB = await createTestDashboard(prisma, tenantB.id);

    await prisma.embedConfig.create({
      data: { dashboardId: dashA.id, allowedOrigins: ['https://a.com'] },
    });
    await prisma.embedConfig.create({
      data: { dashboardId: dashB.id, allowedOrigins: ['https://b.com'] },
    });

    const embedA = await prisma.embedConfig.findUnique({ where: { dashboardId: dashA.id } });
    const embedB = await prisma.embedConfig.findUnique({ where: { dashboardId: dashB.id } });

    expect(embedA!.allowedOrigins).toEqual(['https://a.com']);
    expect(embedB!.allowedOrigins).toEqual(['https://b.com']);
  });

  it('should allow each tenant to have their own branding', async () => {
    const tenantA = await createTestTenant(prisma, {
      name: 'Brand A',
      apiKey: 'brand-a',
      primaryColor: '#FF0000',
    });
    const tenantB = await createTestTenant(prisma, {
      name: 'Brand B',
      apiKey: 'brand-b',
      primaryColor: '#00FF00',
    });

    expect(tenantA.primaryColor).toBe('#FF0000');
    expect(tenantB.primaryColor).toBe('#00FF00');
  });

  it('should use parameterized set_config for tenant context', async () => {
    const tenant = await createTestTenant(prisma, { apiKey: 'context-key' });
    const result = await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${tenant.id}, true)`;
    expect(result).toBeDefined();
  });
});
