import { Pool } from 'pg';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  createTestPool,
  createTestPrisma,
  cleanDatabase,
  createTestTenant,
  createTestDataSource,
} from './helpers';

describe('Prisma Error Handling (Integration)', () => {
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

  describe('P2002 - Unique Constraint Violation (409)', () => {
    it('should throw P2002 when creating duplicate tenant apiKey', async () => {
      await createTestTenant(prisma, { apiKey: 'unique-key' });

      try {
        await createTestTenant(prisma, { apiKey: 'unique-key' });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
      }
    });

    it('should throw P2002 when creating duplicate embed config for dashboard', async () => {
      const tenant = await createTestTenant(prisma, { name: 'EC Tenant' });
      const dashboard = await prisma.dashboard.create({
        data: { tenantId: tenant.id, name: 'Dash' },
      });

      await prisma.embedConfig.create({
        data: {
          dashboardId: dashboard.id,
          allowedOrigins: ['https://example.com'],
        },
      });

      try {
        await prisma.embedConfig.create({
          data: {
            dashboardId: dashboard.id,
            allowedOrigins: ['https://other.com'],
          },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
      }
    });

    it('should throw P2002 for duplicate query cache hash', async () => {
      await prisma.queryCache.create({
        data: {
          queryHash: 'hash-1',
          result: { data: [] },
          expiresAt: new Date(Date.now() + 60000),
        },
      });

      try {
        await prisma.queryCache.create({
          data: {
            queryHash: 'hash-1',
            result: { data: [1] },
            expiresAt: new Date(Date.now() + 60000),
          },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
      }
    });
  });

  describe('P2025 - Record Not Found (404)', () => {
    it('should throw P2025 when updating non-existent tenant', async () => {
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

    it('should throw P2025 when deleting non-existent dashboard', async () => {
      try {
        await prisma.dashboard.delete({
          where: { id: '00000000-0000-0000-0000-000000000000' },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
      }
    });

    it('should throw P2025 when deleting non-existent data source', async () => {
      try {
        await prisma.dataSource.delete({
          where: { id: '00000000-0000-0000-0000-000000000000' },
        });
        expect.unreachable('Should have thrown');
      } catch (error) {
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
      }
    });
  });
});
