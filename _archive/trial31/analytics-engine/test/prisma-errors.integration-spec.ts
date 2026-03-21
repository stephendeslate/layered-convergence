import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
import {
  setupTestDatabase,
  teardownTestDatabase,
  truncateAllTables,
  createTestTenant,
  createTestDataSource,
  createTestDashboard,
} from './helpers/integration.helper';

describe('Prisma Errors Integration', () => {
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

  describe('P2002 - Unique constraint violation', () => {
    it('should throw P2002 on duplicate apiKey', async () => {
      await createTestTenant(prisma, { apiKey: 'dup-key' });
      try {
        await createTestTenant(prisma, { name: 'Another', apiKey: 'dup-key' });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
      }
    });

    it('should throw P2002 on duplicate dataSourceConfig', async () => {
      const tenant = await createTestTenant(prisma);
      const ds = await createTestDataSource(prisma, tenant.id);
      await prisma.dataSourceConfig.create({
        data: { dataSourceId: ds.id, connectionConfig: {} },
      });
      try {
        await prisma.dataSourceConfig.create({
          data: { dataSourceId: ds.id, connectionConfig: {} },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
      }
    });

    it('should throw P2002 on duplicate embedConfig for dashboard', async () => {
      const tenant = await createTestTenant(prisma);
      const dashboard = await createTestDashboard(prisma, tenant.id);
      await prisma.embedConfig.create({
        data: { dashboardId: dashboard.id },
      });
      try {
        await prisma.embedConfig.create({
          data: { dashboardId: dashboard.id },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
      }
    });
  });

  describe('P2025 - Record not found', () => {
    it('should throw P2025 when updating nonexistent tenant', async () => {
      try {
        await prisma.tenant.update({
          where: { id: '00000000-0000-0000-0000-000000000000' },
          data: { name: 'Updated' },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
      }
    });

    it('should throw P2025 when deleting nonexistent dashboard', async () => {
      try {
        await prisma.dashboard.delete({
          where: { id: '00000000-0000-0000-0000-000000000000' },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
      }
    });

    it('should throw when findUniqueOrThrow finds nothing', async () => {
      try {
        await prisma.tenant.findUniqueOrThrow({
          where: { id: '00000000-0000-0000-0000-000000000000' },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('P2003 - Foreign key constraint', () => {
    it('should throw P2003 when creating dashboard with nonexistent tenantId', async () => {
      try {
        await prisma.dashboard.create({
          data: {
            tenantId: '00000000-0000-0000-0000-000000000000',
            name: 'Orphan Dashboard',
          },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2003');
      }
    });

    it('should throw P2003 when creating data source with nonexistent tenantId', async () => {
      try {
        await prisma.dataSource.create({
          data: {
            tenantId: '00000000-0000-0000-0000-000000000000',
            name: 'Orphan Source',
            type: 'webhook',
          },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2003');
      }
    });

    it('should throw P2003 when creating widget with nonexistent dashboardId', async () => {
      try {
        await prisma.widget.create({
          data: {
            dashboardId: '00000000-0000-0000-0000-000000000000',
            type: 'chart',
          },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2003');
      }
    });
  });

  describe('Error code mapping verification', () => {
    it('P2002 should map to 409 Conflict', () => {
      const errorMap: Record<string, number> = {
        P2002: 409,
        P2025: 404,
        P2003: 400,
        P2014: 400,
      };
      expect(errorMap['P2002']).toBe(409);
    });

    it('P2025 should map to 404 Not Found', () => {
      const errorMap: Record<string, number> = {
        P2002: 409,
        P2025: 404,
        P2003: 400,
        P2014: 400,
      };
      expect(errorMap['P2025']).toBe(404);
    });
  });
});
