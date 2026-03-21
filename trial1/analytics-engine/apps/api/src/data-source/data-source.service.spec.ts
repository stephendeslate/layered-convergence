import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSourceService } from './data-source.service';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

// Mock Prisma
const mockPrisma = {
  dataSource: {
    count: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  dataSourceConfig: {
    create: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
  fieldMapping: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  syncRun: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn((fn: any) => fn(mockPrisma)),
};

const mockConnectorFactory = {
  getConnector: vi.fn(),
};

const mockAuditService = {
  log: vi.fn(),
};

const mockSyncQueue = {
  add: vi.fn(),
  getRepeatableJobs: vi.fn().mockResolvedValue([]),
  removeRepeatableByKey: vi.fn(),
};

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DataSourceService(
      mockPrisma as any,
      mockConnectorFactory as any,
      mockAuditService as any,
      mockSyncQueue as any,
    );
  });

  describe('create', () => {
    it('should create a data source with config and field mappings', async () => {
      mockPrisma.dataSource.count.mockResolvedValue(0);
      mockPrisma.dataSource.create.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
        name: 'Test API',
        connectorType: 'REST_API',
      });
      mockPrisma.dataSourceConfig.create.mockResolvedValue({});
      mockPrisma.fieldMapping.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds-1',
        name: 'Test API',
        connectorType: 'REST_API',
        fieldMappings: [],
      });

      const result = await service.create(
        'tenant-1',
        {
          name: 'Test API',
          connectorType: 'REST_API',
          config: { url: 'https://example.com/api' },
          fieldMappings: [
            {
              sourceField: 'region',
              targetField: 'region',
              fieldType: 'STRING',
              fieldRole: 'DIMENSION',
            },
            {
              sourceField: 'revenue',
              targetField: 'revenue',
              fieldType: 'NUMBER',
              fieldRole: 'METRIC',
            },
          ],
        },
        'FREE',
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('ds-1');
      expect(mockPrisma.dataSource.create).toHaveBeenCalled();
      expect(mockPrisma.dataSourceConfig.create).toHaveBeenCalled();
      expect(mockPrisma.fieldMapping.createMany).toHaveBeenCalled();
    });

    it('should enforce tier limits on data source count', async () => {
      mockPrisma.dataSource.count.mockResolvedValue(3);

      await expect(
        service.create('tenant-1', { name: 'Too Many', connectorType: 'CSV' }, 'FREE'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject non-MANUAL schedule for free tier', async () => {
      mockPrisma.dataSource.count.mockResolvedValue(0);

      await expect(
        service.create(
          'tenant-1',
          { name: 'Test', connectorType: 'REST_API', syncSchedule: 'HOURLY' },
          'FREE',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow higher limits for PRO tier', async () => {
      mockPrisma.dataSource.count.mockResolvedValue(10);
      mockPrisma.dataSource.create.mockResolvedValue({ id: 'ds-2' });
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds-2',
        fieldMappings: [],
      });

      const result = await service.create(
        'tenant-1',
        { name: 'Pro Source', connectorType: 'REST_API', syncSchedule: 'HOURLY' },
        'PRO',
      );

      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update data source name and schedule', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.dataSource.update.mockResolvedValue({ id: 'ds-1' });
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds-1',
        name: 'Updated',
        fieldMappings: [],
      });

      const result = await service.update('ds-1', 'tenant-1', {
        name: 'Updated',
        syncSchedule: 'DAILY',
      });

      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException for missing data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', 'tenant-1', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.dataSource.delete.mockResolvedValue({});

      await service.delete('ds-1', 'tenant-1');

      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
      });
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException for missing data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.delete('nonexistent', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('list', () => {
    it('should return paginated data sources', async () => {
      const sources = [
        { id: 'ds-1', name: 'A', syncRuns: [] },
        { id: 'ds-2', name: 'B', syncRuns: [] },
      ];
      mockPrisma.dataSource.findMany.mockResolvedValue(sources);

      const result = await service.list('tenant-1', { limit: 20 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.pagination.hasMore).toBe(false);
    });

    it('should support cursor-based pagination', async () => {
      const sources = Array.from({ length: 3 }, (_, i) => ({
        id: `ds-${i}`,
        name: `Source ${i}`,
        syncRuns: [],
      }));
      mockPrisma.dataSource.findMany.mockResolvedValue(sources);

      const result = await service.list('tenant-1', { limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.pagination.hasMore).toBe(true);
      expect(result.meta.pagination.cursor).toBe('ds-1');
    });
  });

  describe('get', () => {
    it('should return data source with sync runs', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        name: 'Test',
        fieldMappings: [],
        syncRuns: [{ id: 'sr-1', status: 'COMPLETED' }],
      });

      const result = await service.get('ds-1', 'tenant-1');

      expect(result.id).toBe('ds-1');
      expect(result.syncRuns).toHaveLength(1);
    });
  });

  describe('testConnection', () => {
    it('should test connection using the appropriate connector', async () => {
      const mockConnector = {
        testConnection: vi.fn().mockResolvedValue({
          valid: true,
          sampleData: [{ region: 'US', revenue: 1500 }],
        }),
      };
      mockConnectorFactory.getConnector.mockReturnValue(mockConnector);
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
        connectorType: 'REST_API',
        config: {
          configEncrypted: Buffer.from(
            JSON.stringify({ url: 'https://example.com' }),
          ),
        },
      });

      const result = await service.testConnection('ds-1', 'tenant-1');

      expect(result.valid).toBe(true);
      expect(result.sampleData).toHaveLength(1);
    });
  });

  describe('triggerSync', () => {
    it('should create a sync run and enqueue a job', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        tenantId: 'tenant-1',
        syncPaused: false,
      });
      mockPrisma.syncRun.findFirst.mockResolvedValue(null);
      mockPrisma.syncRun.create.mockResolvedValue({
        id: 'sr-1',
        status: 'IDLE',
      });

      const result = await service.triggerSync('ds-1', 'tenant-1');

      expect(result.syncRunId).toBe('sr-1');
      expect(mockSyncQueue.add).toHaveBeenCalled();
    });

    it('should reject if a sync is already running', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        syncPaused: false,
      });
      mockPrisma.syncRun.findFirst.mockResolvedValue({
        id: 'sr-existing',
        status: 'RUNNING',
      });

      await expect(
        service.triggerSync('ds-1', 'tenant-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should reject if sync is paused', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: 'ds-1',
        syncPaused: true,
      });

      await expect(
        service.triggerSync('ds-1', 'tenant-1'),
      ).rejects.toThrow(ConflictException);
    });
  });
});
