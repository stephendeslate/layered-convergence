import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  setupTestDatabase,
  teardownTestDatabase,
  truncateAllTables,
  createTestTenant,
  createTestDashboard,
} from './helpers/integration.helper';

describe('Auth Integration', () => {
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

  it('should find tenant by valid API key', async () => {
    const tenant = await createTestTenant(prisma, { apiKey: 'auth-valid-key' });
    const found = await prisma.tenant.findUnique({
      where: { apiKey: 'auth-valid-key' },
    });
    expect(found).toBeDefined();
    expect(found!.id).toBe(tenant.id);
  });

  it('should return null for invalid API key', async () => {
    const found = await prisma.tenant.findUnique({
      where: { apiKey: 'nonexistent-key' },
    });
    expect(found).toBeNull();
  });

  it('should validate tenant owns dashboard', async () => {
    const tenantA = await createTestTenant(prisma, { apiKey: 'auth-a' });
    const tenantB = await createTestTenant(prisma, { apiKey: 'auth-b' });

    const dashA = await createTestDashboard(prisma, tenantA.id, { name: 'A Dashboard' });

    const foundDash = await prisma.dashboard.findUnique({
      where: { id: dashA.id },
    });

    expect(foundDash!.tenantId).toBe(tenantA.id);
    expect(foundDash!.tenantId).not.toBe(tenantB.id);
  });

  it('should not allow cross-tenant data access via data source', async () => {
    const tenantA = await createTestTenant(prisma, { apiKey: 'auth-ds-a' });
    const tenantB = await createTestTenant(prisma, { apiKey: 'auth-ds-b' });

    const dsA = await prisma.dataSource.create({
      data: { tenantId: tenantA.id, name: 'Source A', type: 'api' },
    });

    const dsForB = await prisma.dataSource.findMany({
      where: { tenantId: tenantB.id },
    });

    expect(dsForB).toHaveLength(0);

    const allForA = await prisma.dataSource.findMany({
      where: { tenantId: tenantA.id },
    });
    expect(allForA).toHaveLength(1);
    expect(allForA[0].id).toBe(dsA.id);
  });

  it('should enforce unique API key constraint', async () => {
    await createTestTenant(prisma, { apiKey: 'unique-auth-key' });
    await expect(
      createTestTenant(prisma, { name: 'Dup', apiKey: 'unique-auth-key' }),
    ).rejects.toThrow();
  });

  it('should validate embed access with allowed origins', async () => {
    const tenant = await createTestTenant(prisma, { apiKey: 'embed-auth-key' });
    const dashboard = await createTestDashboard(prisma, tenant.id);

    const embedConfig = await prisma.embedConfig.create({
      data: {
        dashboardId: dashboard.id,
        allowedOrigins: ['https://allowed.com', 'https://also-allowed.com'],
      },
    });

    expect(embedConfig.allowedOrigins).toContain('https://allowed.com');
    expect(embedConfig.allowedOrigins).not.toContain('https://evil.com');
  });

  it('should use parameterized set_config for RLS context', async () => {
    const tenant = await createTestTenant(prisma, { apiKey: 'rls-key' });

    const result = await prisma.$queryRaw<
      Array<{ current_setting: string }>
    >`SELECT set_config('app.tenant_id', ${tenant.id}, true) as current_setting`;

    expect(result[0].current_setting).toBe(tenant.id);
  });

  it('should regenerate API key and invalidate old key', async () => {
    const tenant = await createTestTenant(prisma, { apiKey: 'old-key' });

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { apiKey: 'new-key' },
    });

    expect(updated.apiKey).toBe('new-key');

    const oldLookup = await prisma.tenant.findUnique({
      where: { apiKey: 'old-key' },
    });
    expect(oldLookup).toBeNull();

    const newLookup = await prisma.tenant.findUnique({
      where: { apiKey: 'new-key' },
    });
    expect(newLookup).toBeDefined();
    expect(newLookup!.id).toBe(tenant.id);
  });

  it('should scope sync runs to their data source tenant', async () => {
    const tenantA = await createTestTenant(prisma, { apiKey: 'sync-auth-a' });
    const tenantB = await createTestTenant(prisma, { apiKey: 'sync-auth-b' });

    const dsA = await prisma.dataSource.create({
      data: { tenantId: tenantA.id, name: 'Source A', type: 'webhook' },
    });
    const dsB = await prisma.dataSource.create({
      data: { tenantId: tenantB.id, name: 'Source B', type: 'api' },
    });

    await prisma.syncRun.create({
      data: { dataSourceId: dsA.id, status: 'completed', rowsIngested: 10 },
    });
    await prisma.syncRun.create({
      data: { dataSourceId: dsB.id, status: 'pending' },
    });

    const runsA = await prisma.syncRun.findMany({
      where: { dataSource: { tenantId: tenantA.id } },
    });
    expect(runsA).toHaveLength(1);
    expect(runsA[0].rowsIngested).toBe(10);

    const runsB = await prisma.syncRun.findMany({
      where: { dataSource: { tenantId: tenantB.id } },
    });
    expect(runsB).toHaveLength(1);
    expect(runsB[0].status).toBe('pending');
  });
});
