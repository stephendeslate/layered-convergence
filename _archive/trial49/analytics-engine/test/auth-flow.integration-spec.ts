import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import {
  createTestPool,
  createTestPrisma,
  cleanDatabase,
  createTestTenant,
} from './helpers';

describe('Auth Flow (Integration)', () => {
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

  describe('Tenant Registration', () => {
    it('should create a tenant with unique apiKey', async () => {
      const tenant = await createTestTenant(prisma, {
        name: 'Auth Tenant',
        apiKey: 'auth-key-1',
      });

      expect(tenant.name).toBe('Auth Tenant');
      expect(tenant.apiKey).toBe('auth-key-1');
    });

    it('should reject duplicate apiKeys', async () => {
      await createTestTenant(prisma, { apiKey: 'dup-key' });

      await expect(
        createTestTenant(prisma, { apiKey: 'dup-key' }),
      ).rejects.toThrow();
    });

    it('should create tenant with branding', async () => {
      const tenant = await createTestTenant(prisma, {
        name: 'Branded',
        primaryColor: '#ff0000',
        fontFamily: 'Inter',
        logoUrl: 'https://example.com/logo.png',
      });

      expect(tenant.primaryColor).toBe('#ff0000');
      expect(tenant.fontFamily).toBe('Inter');
      expect(tenant.logoUrl).toBe('https://example.com/logo.png');
    });
  });

  describe('Tenant Lookup', () => {
    it('should find tenant by apiKey', async () => {
      await createTestTenant(prisma, { name: 'Lookup Tenant', apiKey: 'lookup-key' });

      const found = await prisma.tenant.findUnique({
        where: { apiKey: 'lookup-key' },
      });
      expect(found).not.toBeNull();
      expect(found!.name).toBe('Lookup Tenant');
    });

    it('should return null for non-existent apiKey', async () => {
      const found = await prisma.tenant.findUnique({
        where: { apiKey: 'nonexistent' },
      });
      expect(found).toBeNull();
    });

    it('should find tenant by id', async () => {
      const tenant = await createTestTenant(prisma, { name: 'By ID' });

      const found = await prisma.tenant.findUnique({
        where: { id: tenant.id },
      });
      expect(found).not.toBeNull();
      expect(found!.id).toBe(tenant.id);
    });
  });

  describe('Tenant with Dashboards', () => {
    it('should associate dashboards with tenant', async () => {
      const tenant = await createTestTenant(prisma, { name: 'Dash Tenant' });

      await prisma.dashboard.create({
        data: { tenantId: tenant.id, name: 'Sales Dashboard' },
      });
      await prisma.dashboard.create({
        data: { tenantId: tenant.id, name: 'Traffic Dashboard' },
      });

      const dashboards = await prisma.dashboard.findMany({
        where: { tenantId: tenant.id },
      });
      expect(dashboards).toHaveLength(2);
    });

    it('should include dashboards in tenant query with relation', async () => {
      const tenant = await createTestTenant(prisma, { name: 'Relation Tenant' });
      await prisma.dashboard.create({
        data: { tenantId: tenant.id, name: 'Dashboard 1' },
      });

      const found = await prisma.tenant.findUnique({
        where: { id: tenant.id },
        include: { dashboards: true },
      });

      expect(found!.dashboards).toHaveLength(1);
      expect(found!.dashboards[0].name).toBe('Dashboard 1');
    });
  });

  describe('API Key Uniqueness', () => {
    it('should enforce unique apiKey across tenants', async () => {
      await createTestTenant(prisma, { apiKey: 'shared-key' });

      try {
        await createTestTenant(prisma, { apiKey: 'shared-key' });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
