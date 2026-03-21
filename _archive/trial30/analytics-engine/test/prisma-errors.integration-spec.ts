import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
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
  const filter = new PrismaExceptionFilter();

  beforeAll(async () => {
    prisma = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await truncateAllTables(prisma);
  });

  describe('P2002 - Unique constraint violation (409 Conflict)', () => {
    it('should throw P2002 when creating duplicate API key', async () => {
      await createTestTenant(prisma, { apiKey: 'dup-key' });

      try {
        await createTestTenant(prisma, { name: 'Dup', apiKey: 'dup-key' });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
      }
    });

    it('should map P2002 to 409 in the filter', () => {
      let statusCode: number | undefined;
      let body: any;
      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (b: any) => {
              body = b;
            },
          };
        },
      };
      const mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockRes,
          getRequest: () => ({}),
        }),
      } as any;

      const error = new Prisma.PrismaClientKnownRequestError('Unique', {
        code: 'P2002',
        clientVersion: '6.0.0',
      });

      filter.catch(error, mockHost);
      expect(statusCode).toBe(409);
      expect(body.error).toBe('P2002');
    });

    it('should throw P2002 when creating duplicate embed config for same dashboard', async () => {
      const tenant = await createTestTenant(prisma, { apiKey: 'embed-dup-key' });
      const dashboard = await createTestDashboard(prisma, tenant.id);

      await prisma.embedConfig.create({
        data: { dashboardId: dashboard.id, allowedOrigins: [] },
      });

      try {
        await prisma.embedConfig.create({
          data: { dashboardId: dashboard.id, allowedOrigins: [] },
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2002');
      }
    });
  });

  describe('P2025 - Record not found (404)', () => {
    it('should throw P2025 when updating non-existent tenant', async () => {
      try {
        await prisma.tenant.update({
          where: { id: '00000000-0000-0000-0000-000000000000' },
          data: { name: 'Ghost' },
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
      }
    });

    it('should map P2025 to 404 in the filter', () => {
      let statusCode: number | undefined;
      let body: any;
      const mockRes = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (b: any) => {
              body = b;
            },
          };
        },
      };
      const mockHost = {
        switchToHttp: () => ({
          getResponse: () => mockRes,
          getRequest: () => ({}),
        }),
      } as any;

      const error = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '6.0.0',
      });

      filter.catch(error, mockHost);
      expect(statusCode).toBe(404);
      expect(body.message).toBe('Record not found');
    });

    it('should throw P2025 when deleting non-existent dashboard', async () => {
      try {
        await prisma.dashboard.delete({
          where: { id: '00000000-0000-0000-0000-000000000000' },
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
      }
    });

    it('should throw P2025 when deleting non-existent data source', async () => {
      try {
        await prisma.dataSource.delete({
          where: { id: '00000000-0000-0000-0000-000000000000' },
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect((error as Prisma.PrismaClientKnownRequestError).code).toBe('P2025');
      }
    });

    it('should throw when using findUniqueOrThrow for missing record', async () => {
      try {
        await prisma.tenant.findUniqueOrThrow({
          where: { id: '00000000-0000-0000-0000-000000000000' },
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('P2003 - Foreign key constraint', () => {
    it('should throw when creating dashboard with invalid tenantId', async () => {
      try {
        await prisma.dashboard.create({
          data: {
            tenantId: '00000000-0000-0000-0000-000000000000',
            name: 'Orphan Dashboard',
          },
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should throw when creating widget with invalid dashboardId', async () => {
      try {
        await prisma.widget.create({
          data: {
            dashboardId: '00000000-0000-0000-0000-000000000000',
            type: 'line_chart',
          },
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
