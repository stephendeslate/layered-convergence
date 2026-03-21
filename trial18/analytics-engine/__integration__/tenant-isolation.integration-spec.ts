import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://testuser:testpass@localhost:5433/analytics_test';

describe('Tenant Isolation (Integration)', () => {
  let prisma: PrismaClient;
  let tenantAId: string;
  let tenantBId: string;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });
    await prisma.$connect();

    await prisma.$executeRawUnsafe('DELETE FROM "Widget"');
    await prisma.$executeRawUnsafe('DELETE FROM "Embed"');
    await prisma.$executeRawUnsafe('DELETE FROM "Dashboard"');
    await prisma.$executeRawUnsafe('DELETE FROM "Pipeline"');
    await prisma.$executeRawUnsafe('DELETE FROM "DataPoint"');
    await prisma.$executeRawUnsafe('DELETE FROM "SyncRun"');
    await prisma.$executeRawUnsafe('DELETE FROM "DataSource"');
    await prisma.$executeRawUnsafe('DELETE FROM "User"');
    await prisma.$executeRawUnsafe('DELETE FROM "Tenant"');

    const tenantA = await prisma.tenant.create({
      data: { name: 'Tenant A', slug: 'tenant-a-isolation' },
    });
    tenantAId = tenantA.id;

    const tenantB = await prisma.tenant.create({
      data: { name: 'Tenant B', slug: 'tenant-b-isolation' },
    });
    tenantBId = tenantB.id;
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe('DELETE FROM "Widget"');
    await prisma.$executeRawUnsafe('DELETE FROM "Embed"');
    await prisma.$executeRawUnsafe('DELETE FROM "Dashboard"');
    await prisma.$executeRawUnsafe('DELETE FROM "Pipeline"');
    await prisma.$executeRawUnsafe('DELETE FROM "DataPoint"');
    await prisma.$executeRawUnsafe('DELETE FROM "SyncRun"');
    await prisma.$executeRawUnsafe('DELETE FROM "DataSource"');
    await prisma.$executeRawUnsafe('DELETE FROM "User"');
    await prisma.$executeRawUnsafe('DELETE FROM "Tenant"');
    await prisma.$disconnect();
  });

  it('should isolate dashboards between tenants', async () => {
    await prisma.dashboard.create({
      data: { tenantId: tenantAId, name: 'Dashboard A' },
    });

    await prisma.dashboard.create({
      data: { tenantId: tenantBId, name: 'Dashboard B' },
    });

    const dashboardsA = await prisma.dashboard.findMany({
      where: { tenantId: tenantAId },
    });
    const dashboardsB = await prisma.dashboard.findMany({
      where: { tenantId: tenantBId },
    });

    expect(dashboardsA).toHaveLength(1);
    expect(dashboardsA[0].name).toBe('Dashboard A');
    expect(dashboardsB).toHaveLength(1);
    expect(dashboardsB[0].name).toBe('Dashboard B');
  });

  it('should isolate data sources between tenants', async () => {
    await prisma.dataSource.create({
      data: {
        tenantId: tenantAId,
        name: 'Source A',
        type: 'POSTGRESQL',
        config: { host: 'a.db' },
      },
    });

    await prisma.dataSource.create({
      data: {
        tenantId: tenantBId,
        name: 'Source B',
        type: 'API',
        config: { url: 'https://api.b.com' },
      },
    });

    const sourcesA = await prisma.dataSource.findMany({
      where: { tenantId: tenantAId },
    });
    const sourcesB = await prisma.dataSource.findMany({
      where: { tenantId: tenantBId },
    });

    expect(sourcesA).toHaveLength(1);
    expect(sourcesA[0].name).toBe('Source A');
    expect(sourcesB).toHaveLength(1);
    expect(sourcesB[0].name).toBe('Source B');
  });

  it('should not allow cross-tenant access via findFirst', async () => {
    const dashboardA = await prisma.dashboard.findFirst({
      where: { tenantId: tenantAId },
    });

    // findFirst justified: simulating application-level tenant filtering
    const crossTenantAccess = await prisma.dashboard.findFirst({
      where: { id: dashboardA!.id, tenantId: tenantBId },
    });

    expect(crossTenantAccess).toBeNull();
  });
});
