import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheService } from './cache.service';

const mockPrisma = {
  widget: {
    findMany: vi.fn(),
  },
  dashboard: {
    findFirst: vi.fn(),
  },
  tenant: {
    findUnique: vi.fn(),
  },
};

const mockRedis = {};

const mockQueryService = {
  invalidateCache: vi.fn(),
  executeQuery: vi.fn(),
};

const mockCacheInvalidationQueue = {
  add: vi.fn().mockResolvedValue(undefined),
};

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CacheService(
      mockPrisma as any,
      mockRedis as any,
      mockQueryService as any,
      mockCacheInvalidationQueue as any,
    );
  });

  describe('invalidateForDataSource', () => {
    it('should invalidate cache for all widgets using the data source', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([
        { id: 'w-1', dashboardId: 'dash-1' },
        { id: 'w-2', dashboardId: 'dash-1' },
      ]);
      mockQueryService.invalidateCache.mockResolvedValue(5);

      const result = await service.invalidateForDataSource('ds-1', 'tenant-1');

      expect(result).toBe(5);
      expect(mockQueryService.invalidateCache).toHaveBeenCalledWith(
        'tenant-1',
        ['w-1', 'w-2'],
      );
    });

    it('should return 0 when no widgets use the data source', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([]);

      const result = await service.invalidateForDataSource('ds-1', 'tenant-1');

      expect(result).toBe(0);
      expect(mockQueryService.invalidateCache).not.toHaveBeenCalled();
    });
  });

  describe('invalidateForDashboard', () => {
    it('should invalidate cache for all widgets on the dashboard', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([
        { id: 'w-1' },
        { id: 'w-2' },
        { id: 'w-3' },
      ]);
      mockQueryService.invalidateCache.mockResolvedValue(3);

      const result = await service.invalidateForDashboard('dash-1', 'tenant-1');

      expect(result).toBe(3);
      expect(mockQueryService.invalidateCache).toHaveBeenCalledWith(
        'tenant-1',
        ['w-1', 'w-2', 'w-3'],
      );
    });

    it('should return 0 when dashboard has no widgets', async () => {
      mockPrisma.widget.findMany.mockResolvedValue([]);

      const result = await service.invalidateForDashboard('dash-1', 'tenant-1');

      expect(result).toBe(0);
    });
  });

  describe('warmCache', () => {
    it('should pre-execute queries for all widgets on a dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        widgets: [
          {
            id: 'w-1',
            dataSourceId: 'ds-1',
            dimensionField: 'date',
            metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
            dateRangePreset: 'LAST_30_DAYS',
            dateRangeStart: null,
            dateRangeEnd: null,
            groupingPeriod: 'DAILY',
          },
          {
            id: 'w-2',
            dataSourceId: 'ds-1',
            dimensionField: 'category',
            metricFields: [{ field: 'count', aggregation: 'COUNT' }],
            dateRangePreset: 'LAST_7_DAYS',
            dateRangeStart: null,
            dateRangeEnd: null,
            groupingPeriod: 'DAILY',
          },
        ],
      });
      mockPrisma.tenant.findUnique.mockResolvedValue({ tier: 'PRO' });
      mockQueryService.executeQuery.mockResolvedValue({ rows: [] });

      const result = await service.warmCache('dash-1', 'tenant-1');

      expect(result).toBe(2);
      expect(mockQueryService.executeQuery).toHaveBeenCalledTimes(2);
      expect(mockQueryService.executeQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          widgetId: 'w-1',
          tenantId: 'tenant-1',
        }),
        'PRO',
      );
    });

    it('should return 0 when dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      const result = await service.warmCache('nonexistent', 'tenant-1');

      expect(result).toBe(0);
    });

    it('should default to FREE tier when tenant not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        widgets: [
          {
            id: 'w-1',
            dataSourceId: 'ds-1',
            dimensionField: 'date',
            metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
            dateRangePreset: 'LAST_30_DAYS',
            dateRangeStart: null,
            dateRangeEnd: null,
            groupingPeriod: 'DAILY',
          },
        ],
      });
      mockPrisma.tenant.findUnique.mockResolvedValue(null);
      mockQueryService.executeQuery.mockResolvedValue({ rows: [] });

      await service.warmCache('dash-1', 'tenant-1');

      expect(mockQueryService.executeQuery).toHaveBeenCalledWith(
        expect.any(Object),
        'FREE',
      );
    });

    it('should continue warming other widgets when one fails', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        widgets: [
          {
            id: 'w-1',
            dataSourceId: 'ds-1',
            dimensionField: 'date',
            metricFields: [],
            dateRangePreset: 'LAST_30_DAYS',
            dateRangeStart: null,
            dateRangeEnd: null,
            groupingPeriod: 'DAILY',
          },
          {
            id: 'w-2',
            dataSourceId: 'ds-1',
            dimensionField: 'date',
            metricFields: [],
            dateRangePreset: 'LAST_30_DAYS',
            dateRangeStart: null,
            dateRangeEnd: null,
            groupingPeriod: 'DAILY',
          },
        ],
      });
      mockPrisma.tenant.findUnique.mockResolvedValue({ tier: 'FREE' });
      mockQueryService.executeQuery
        .mockRejectedValueOnce(new Error('Query failed'))
        .mockResolvedValueOnce({ rows: [] });

      const result = await service.warmCache('dash-1', 'tenant-1');

      expect(result).toBe(1); // Only second widget succeeded
    });
  });

  describe('enqueueInvalidation', () => {
    it('should add a job to the cache invalidation queue', async () => {
      await service.enqueueInvalidation('ds-1', 'tenant-1', ['w-1'], [
        'dash-1',
      ]);

      expect(mockCacheInvalidationQueue.add).toHaveBeenCalledWith(
        'invalidate',
        {
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
          widgetIds: ['w-1'],
          dashboardIds: ['dash-1'],
        },
        expect.objectContaining({
          attempts: 1,
        }),
      );
    });
  });
});
