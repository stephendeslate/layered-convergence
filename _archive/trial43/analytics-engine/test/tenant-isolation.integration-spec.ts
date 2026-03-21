import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import {
  createTestPool,
  createTestPrisma,
  cleanDatabase,
  createTestTenant,
  createTestDataSource,
} from './helpers';

describe('Tenant Isolation (Integration)', () => {
  let pool: Pool;
  let prisma: PrismaClient;

  beforeAll(async () => {
    pool = createTestPool();
    prisma = createTestPrisma(pool);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  beforeEach(async () => {
    await cleanDatabase(pool);
  });

  it('should isolate dashboards by tenant', async () => {
    const tenant1 = await createTestTenant(prisma, { name: 'Tenant A' });
    const tenant2 = await createTestTenant(prisma, { name: 'Tenant B' });

    await prisma.dashboard.create({
      data: { tenantId: tenant1.id, name: 'Dashboard A' },
    });
    await prisma.dashboard.create({
      data: { tenantId: tenant2.id, name: 'Dashboard B' },
    });

    const t1Dashboards = await prisma.dashboard.findMany({
      where: { tenantId: tenant1.id },
    });
    const t2Dashboards = await prisma.dashboard.findMany({
      where: { tenantId: tenant2.id },
    });

    expect(t1Dashboards).toHaveLength(1);
    expect(t2Dashboards).toHaveLength(1);
    expect(t1Dashboards[0].name).toBe('Dashboard A');
    expect(t2Dashboards[0].name).toBe('Dashboard B');
  });

  it('should isolate data sources by tenant', async () => {
    const tenant1 = await createTestTenant(prisma, { name: 'ISO T1' });
    const tenant2 = await createTestTenant(prisma, { name: 'ISO T2' });

    await createTestDataSource(prisma, tenant1.id, { name: 'Source A' });
    await createTestDataSource(prisma, tenant2.id, { name: 'Source B' });

    const t1Sources = await prisma.dataSource.findMany({
      where: { tenantId: tenant1.id },
    });
    const t2Sources = await prisma.dataSource.findMany({
      where: { tenantId: tenant2.id },
    });

    expect(t1Sources).toHaveLength(1);
    expect(t2Sources).toHaveLength(1);
    expect(t1Sources[0].name).toBe('Source A');
  });

  it('should isolate data points through data source tenant relationship', async () => {
    const tenant1 = await createTestTenant(prisma, { name: 'DP T1' });
    const tenant2 = await createTestTenant(prisma, { name: 'DP T2' });

    const ds1 = await createTestDataSource(prisma, tenant1.id);
    const ds2 = await createTestDataSource(prisma, tenant2.id);

    await prisma.dataPoint.create({
      data: {
        dataSourceId: ds1.id,
        timestamp: new Date(),
        dimensions: { page: '/home' },
        metrics: { views: 100 },
      },
    });
    await prisma.dataPoint.create({
      data: {
        dataSourceId: ds2.id,
        timestamp: new Date(),
        dimensions: { page: '/about' },
        metrics: { views: 50 },
      },
    });

    const ds1Points = await prisma.dataPoint.findMany({
      where: { dataSourceId: ds1.id },
    });
    const ds2Points = await prisma.dataPoint.findMany({
      where: { dataSourceId: ds2.id },
    });

    expect(ds1Points).toHaveLength(1);
    expect(ds2Points).toHaveLength(1);
    expect((ds1Points[0].dimensions as any).page).toBe('/home');
  });

  it('should isolate embed configs through dashboard tenant relationship', async () => {
    const tenant1 = await createTestTenant(prisma, { name: 'EC T1' });
    const tenant2 = await createTestTenant(prisma, { name: 'EC T2' });

    const dash1 = await prisma.dashboard.create({
      data: { tenantId: tenant1.id, name: 'Dash 1' },
    });
    const dash2 = await prisma.dashboard.create({
      data: { tenantId: tenant2.id, name: 'Dash 2' },
    });

    await prisma.embedConfig.create({
      data: {
        dashboardId: dash1.id,
        allowedOrigins: ['https://t1.example.com'],
      },
    });
    await prisma.embedConfig.create({
      data: {
        dashboardId: dash2.id,
        allowedOrigins: ['https://t2.example.com'],
      },
    });

    const ec1 = await prisma.embedConfig.findUnique({ where: { dashboardId: dash1.id } });
    const ec2 = await prisma.embedConfig.findUnique({ where: { dashboardId: dash2.id } });

    expect(ec1!.allowedOrigins).toEqual(['https://t1.example.com']);
    expect(ec2!.allowedOrigins).toEqual(['https://t2.example.com']);
  });

  it('should isolate dead letter events through data source tenant relationship', async () => {
    const tenant1 = await createTestTenant(prisma, { name: 'DLE T1' });
    const tenant2 = await createTestTenant(prisma, { name: 'DLE T2' });

    const ds1 = await createTestDataSource(prisma, tenant1.id);
    const ds2 = await createTestDataSource(prisma, tenant2.id);

    await prisma.deadLetterEvent.create({
      data: {
        dataSourceId: ds1.id,
        payload: { event: 'click' },
        errorReason: 'Parse error',
      },
    });
    await prisma.deadLetterEvent.create({
      data: {
        dataSourceId: ds2.id,
        payload: { event: 'submit' },
        errorReason: 'Schema mismatch',
      },
    });

    const dle1 = await prisma.deadLetterEvent.findMany({
      where: { dataSourceId: ds1.id },
    });
    const dle2 = await prisma.deadLetterEvent.findMany({
      where: { dataSourceId: ds2.id },
    });

    expect(dle1).toHaveLength(1);
    expect(dle2).toHaveLength(1);
    expect(dle1[0].errorReason).toBe('Parse error');
  });
});
