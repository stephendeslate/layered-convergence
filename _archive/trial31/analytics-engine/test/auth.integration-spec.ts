import { PrismaClient } from '@prisma/client';
import {
  setupTestDatabase,
  teardownTestDatabase,
  truncateAllTables,
  createTestTenant,
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

  describe('API Key validation', () => {
    it('should find tenant by valid apiKey', async () => {
      const created = await createTestTenant(prisma, { apiKey: 'valid-test-key' });
      const found = await prisma.tenant.findUnique({
        where: { apiKey: 'valid-test-key' },
      });
      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
    });

    it('should return null for invalid apiKey', async () => {
      const found = await prisma.tenant.findUnique({
        where: { apiKey: 'nonexistent-key' },
      });
      expect(found).toBeNull();
    });

    it('should enforce unique apiKey', async () => {
      await createTestTenant(prisma, { apiKey: 'shared-key' });
      await expect(
        createTestTenant(prisma, { name: 'Another', apiKey: 'shared-key' }),
      ).rejects.toThrow();
    });

    it('should allow tenant to have a new apiKey after update', async () => {
      const tenant = await createTestTenant(prisma, { apiKey: 'old-key' });
      const updated = await prisma.tenant.update({
        where: { id: tenant.id },
        data: { apiKey: 'new-key' },
      });
      expect(updated.apiKey).toBe('new-key');

      const foundOld = await prisma.tenant.findUnique({ where: { apiKey: 'old-key' } });
      expect(foundOld).toBeNull();

      const foundNew = await prisma.tenant.findUnique({ where: { apiKey: 'new-key' } });
      expect(foundNew).toBeDefined();
      expect(foundNew!.id).toBe(tenant.id);
    });
  });

  describe('Tenant access control', () => {
    it('should verify tenant owns their resources', async () => {
      const tenantA = await createTestTenant(prisma, { name: 'A', apiKey: 'key-a' });
      const tenantB = await createTestTenant(prisma, { name: 'B', apiKey: 'key-b' });

      const dashboard = await prisma.dashboard.create({
        data: { tenantId: tenantA.id, name: 'A Dashboard' },
      });

      const found = await prisma.dashboard.findFirst({
        where: { id: dashboard.id, tenantId: tenantA.id },
      });
      expect(found).toBeDefined();

      const notFound = await prisma.dashboard.findFirst({
        where: { id: dashboard.id, tenantId: tenantB.id },
      });
      expect(notFound).toBeNull();
    });

    it('should scope data sources to tenant', async () => {
      const tenant = await createTestTenant(prisma, { apiKey: 'key-1' });
      const otherTenant = await createTestTenant(prisma, { name: 'Other', apiKey: 'key-2' });

      await prisma.dataSource.create({
        data: { tenantId: tenant.id, name: 'My Source', type: 'webhook' },
      });

      const myResources = await prisma.dataSource.findMany({
        where: { tenantId: tenant.id },
      });
      expect(myResources).toHaveLength(1);

      const otherResources = await prisma.dataSource.findMany({
        where: { tenantId: otherTenant.id },
      });
      expect(otherResources).toHaveLength(0);
    });

    it('should prevent cross-tenant data access through data points', async () => {
      const tenantA = await createTestTenant(prisma, { name: 'A', apiKey: 'key-a' });
      const tenantB = await createTestTenant(prisma, { name: 'B', apiKey: 'key-b' });

      const dsA = await prisma.dataSource.create({
        data: { tenantId: tenantA.id, name: 'Source A', type: 'webhook' },
      });
      const dsB = await prisma.dataSource.create({
        data: { tenantId: tenantB.id, name: 'Source B', type: 'webhook' },
      });

      await prisma.dataPoint.create({
        data: { dataSourceId: dsA.id, timestamp: new Date(), metrics: { x: 1 } },
      });
      await prisma.dataPoint.create({
        data: { dataSourceId: dsB.id, timestamp: new Date(), metrics: { y: 2 } },
      });

      const pointsA = await prisma.dataPoint.findMany({
        where: { dataSource: { tenantId: tenantA.id } },
      });
      expect(pointsA).toHaveLength(1);

      const pointsB = await prisma.dataPoint.findMany({
        where: { dataSource: { tenantId: tenantB.id } },
      });
      expect(pointsB).toHaveLength(1);
    });
  });

  describe('Tenant lifecycle', () => {
    it('should create tenant with required fields', async () => {
      const tenant = await prisma.tenant.create({
        data: { name: 'New Tenant', apiKey: 'fresh-key' },
      });
      expect(tenant.id).toBeDefined();
      expect(tenant.name).toBe('New Tenant');
      expect(tenant.apiKey).toBe('fresh-key');
      expect(tenant.createdAt).toBeInstanceOf(Date);
    });

    it('should list all tenants', async () => {
      await createTestTenant(prisma, { name: 'T1', apiKey: 'k1' });
      await createTestTenant(prisma, { name: 'T2', apiKey: 'k2' });
      const tenants = await prisma.tenant.findMany();
      expect(tenants).toHaveLength(2);
    });
  });
});
