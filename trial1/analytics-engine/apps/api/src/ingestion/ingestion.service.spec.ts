import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IngestionService } from './ingestion.service';
import { TransformService } from './transform.service';

const mockPrisma = {
  syncRun: {
    update: vi.fn(),
  },
  dataSource: {
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
  },
  dataSourceConfig: {
    findUnique: vi.fn(),
  },
  dataPoint: {
    createMany: vi.fn(),
  },
  deadLetterEvent: {
    createMany: vi.fn(),
    create: vi.fn(),
  },
  widget: {
    findMany: vi.fn().mockResolvedValue([]),
  },
};

const mockConnectorFactory = {
  getConnector: vi.fn(),
};

const mockAggregationQueue = {
  add: vi.fn(),
};

const mockCacheInvalidationQueue = {
  add: vi.fn(),
};

describe('IngestionService', () => {
  let service: IngestionService;
  let transformService: TransformService;

  beforeEach(() => {
    vi.clearAllMocks();
    transformService = new TransformService();
    service = new IngestionService(
      mockPrisma as any,
      mockConnectorFactory as any,
      transformService,
      mockAggregationQueue as any,
      mockCacheInvalidationQueue as any,
    );
  });

  describe('runSync', () => {
    it('should execute full pipeline: extract -> transform -> load', async () => {
      // Setup mock data source
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds-1',
        connectorType: 'REST_API',
        config: {
          configEncrypted: Buffer.from(JSON.stringify({ url: 'mock://data' })),
          transforms: [],
        },
        fieldMappings: [
          {
            sourceField: 'region',
            targetField: 'region',
            fieldType: 'STRING',
            fieldRole: 'DIMENSION',
            isRequired: true,
            sortOrder: 0,
          },
          {
            sourceField: 'revenue',
            targetField: 'revenue',
            fieldType: 'NUMBER',
            fieldRole: 'METRIC',
            isRequired: true,
            sortOrder: 1,
          },
        ],
      });

      // Mock connector
      const mockConnector = {
        extract: async function* () {
          yield [
            { region: 'US', revenue: 1500, date: '2026-03-01' },
            { region: 'EU', revenue: 2300, date: '2026-03-02' },
          ];
        },
      };
      mockConnectorFactory.getConnector.mockReturnValue(mockConnector);

      // Mock data point creation
      mockPrisma.dataPoint.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.syncRun.update.mockResolvedValue({});
      mockPrisma.dataSource.update.mockResolvedValue({ consecutiveFails: 0 });

      await service.runSync({
        dataSourceId: 'ds-1',
        tenantId: 'tenant-1',
        syncRunId: 'sr-1',
        triggeredBy: 'manual',
      });

      // Verify sync run was set to RUNNING then COMPLETED
      expect(mockPrisma.syncRun.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sr-1' },
          data: expect.objectContaining({ status: 'RUNNING' }),
        }),
      );
      expect(mockPrisma.syncRun.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'COMPLETED' }),
        }),
      );

      // Verify data points were created
      expect(mockPrisma.dataPoint.createMany).toHaveBeenCalled();

      // Verify aggregation job was enqueued
      expect(mockAggregationQueue.add).toHaveBeenCalled();
    });

    it('should handle dead letter records from transform failures', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds-1',
        connectorType: 'REST_API',
        config: {
          configEncrypted: Buffer.from(JSON.stringify({})),
          transforms: [],
        },
        fieldMappings: [
          {
            sourceField: 'revenue',
            targetField: 'revenue',
            fieldType: 'NUMBER',
            fieldRole: 'METRIC',
            isRequired: true,
            sortOrder: 0,
          },
        ],
      });

      const mockConnector = {
        extract: async function* () {
          yield [
            { revenue: 100 },
            { revenue: null }, // Will fail — required field
            { revenue: 300 },
          ];
        },
      };
      mockConnectorFactory.getConnector.mockReturnValue(mockConnector);

      mockPrisma.dataPoint.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.syncRun.update.mockResolvedValue({});
      mockPrisma.deadLetterEvent.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.dataSource.update.mockResolvedValue({ consecutiveFails: 0 });

      await service.runSync({
        dataSourceId: 'ds-1',
        tenantId: 'tenant-1',
        syncRunId: 'sr-1',
        triggeredBy: 'manual',
      });

      // Dead letters should have been written
      expect(mockPrisma.deadLetterEvent.createMany).toHaveBeenCalled();
    });

    it('should handle connector errors and mark sync as FAILED', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds-1',
        connectorType: 'REST_API',
        config: {
          configEncrypted: Buffer.from(JSON.stringify({})),
          transforms: [],
        },
        fieldMappings: [],
      });

      const mockConnector = {
        extract: async function* () {
          throw new Error('Connection refused');
        },
      };
      mockConnectorFactory.getConnector.mockReturnValue(mockConnector);

      mockPrisma.syncRun.update.mockResolvedValue({});
      mockPrisma.dataSource.update.mockResolvedValue({ consecutiveFails: 1 });
      mockPrisma.deadLetterEvent.create.mockResolvedValue({});

      await expect(
        service.runSync({
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
          syncRunId: 'sr-1',
          triggeredBy: 'manual',
        }),
      ).rejects.toThrow('Connection refused');

      // Verify status was set to FAILED
      expect(mockPrisma.syncRun.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'FAILED' }),
        }),
      );
    });

    it('should auto-pause after 3 consecutive failures', async () => {
      mockPrisma.dataSource.findUniqueOrThrow.mockResolvedValue({
        id: 'ds-1',
        connectorType: 'REST_API',
        config: {
          configEncrypted: Buffer.from(JSON.stringify({})),
          transforms: [],
        },
        fieldMappings: [],
      });

      const mockConnector = {
        extract: async function* () {
          throw new Error('Persistent error');
        },
      };
      mockConnectorFactory.getConnector.mockReturnValue(mockConnector);

      mockPrisma.syncRun.update.mockResolvedValue({});
      mockPrisma.dataSource.update
        .mockResolvedValueOnce({ consecutiveFails: 3, id: 'ds-1' })
        .mockResolvedValue({});
      mockPrisma.deadLetterEvent.create.mockResolvedValue({});

      await expect(
        service.runSync({
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
          syncRunId: 'sr-1',
          triggeredBy: 'manual',
        }),
      ).rejects.toThrow();

      // Should have been called to set syncPaused = true
      expect(mockPrisma.dataSource.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { syncPaused: true },
        }),
      );
    });
  });
});
