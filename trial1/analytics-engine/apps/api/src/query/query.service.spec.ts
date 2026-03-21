import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryService } from './query.service';

const mockPrisma = {
  aggregatedDataPoint: {
    findMany: vi.fn(),
  },
  dataPoint: {
    findMany: vi.fn(),
    count: vi.fn(),
  },
};

const mockRedis = {
  get: vi.fn(),
  setex: vi.fn(),
  scan: vi.fn(),
  del: vi.fn(),
};

describe('QueryService', () => {
  let service: QueryService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new QueryService(mockPrisma as any, mockRedis as any);
  });

  describe('executeQuery', () => {
    it('should return cached result if available', async () => {
      const cachedResult = {
        labels: ['2026-03-01'],
        series: [{ name: 'revenue (sum)', data: [1500] }],
        meta: { totalRows: 1, queryTime: 10, fromCache: false },
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedResult));

      const result = await service.executeQuery(
        {
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
          dimensionField: 'date',
          metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
          dateRange: { preset: 'LAST_30_DAYS' },
          groupingPeriod: 'DAILY',
        },
        'FREE',
      );

      expect(result.meta.fromCache).toBe(true);
      expect(result.labels).toEqual(['2026-03-01']);
      expect(mockPrisma.aggregatedDataPoint.findMany).not.toHaveBeenCalled();
    });

    it('should query aggregated data and cache result', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.aggregatedDataPoint.findMany.mockResolvedValue([
        {
          periodStart: new Date('2026-03-01'),
          dimensionKey: 'region=US',
          metricName: 'revenue',
          sumValue: 1500,
          avgValue: 750,
          countValue: 2,
          minValue: 500,
          maxValue: 1000,
        },
        {
          periodStart: new Date('2026-03-02'),
          dimensionKey: 'region=US',
          metricName: 'revenue',
          sumValue: 2300,
          avgValue: 1150,
          countValue: 2,
          minValue: 800,
          maxValue: 1500,
        },
      ]);

      const result = await service.executeQuery(
        {
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
          dimensionField: 'date',
          metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
          dateRange: { preset: 'LAST_30_DAYS' },
          groupingPeriod: 'DAILY',
        },
        'FREE',
      );

      expect(result.meta.fromCache).toBe(false);
      expect(result.labels).toHaveLength(2);
      expect(result.series).toHaveLength(1);
      expect(result.series[0].data).toHaveLength(2);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.stringContaining('query:tenant-1:'),
        300, // FREE tier TTL
        expect.any(String),
      );
    });

    it('should use correct TTL per tier', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.aggregatedDataPoint.findMany.mockResolvedValue([]);

      await service.executeQuery(
        {
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
          dimensionField: 'date',
          metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
          dateRange: { preset: 'LAST_30_DAYS' },
          groupingPeriod: 'DAILY',
        },
        'PRO',
      );

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.any(String),
        60, // PRO tier TTL
        expect.any(String),
      );
    });

    it('should use ENTERPRISE tier TTL', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.aggregatedDataPoint.findMany.mockResolvedValue([]);

      await service.executeQuery(
        {
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
          dimensionField: 'date',
          metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
          dateRange: { preset: 'LAST_30_DAYS' },
          groupingPeriod: 'DAILY',
        },
        'ENTERPRISE',
      );

      expect(mockRedis.setex).toHaveBeenCalledWith(
        expect.any(String),
        30, // ENTERPRISE tier TTL
        expect.any(String),
      );
    });

    it('should query raw data for NONE grouping period', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          dimensions: { region: 'US' },
          metrics: { revenue: 1500 },
          timestamp: new Date('2026-03-01'),
        },
      ]);
      mockPrisma.dataPoint.count.mockResolvedValue(1);

      const result = await service.executeQuery(
        {
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
          dimensionField: 'region',
          metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
          dateRange: { preset: 'LAST_30_DAYS' },
          groupingPeriod: 'NONE',
        },
        'FREE',
      );

      expect(result.labels).toEqual(['US']);
      expect(result.series[0].data).toEqual([1500]);
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalled();
    });
  });

  describe('previewQuery', () => {
    it('should not use cache', async () => {
      mockPrisma.aggregatedDataPoint.findMany.mockResolvedValue([]);

      const result = await service.previewQuery({
        dataSourceId: 'ds-1',
        tenantId: 'tenant-1',
        dimensionField: 'date',
        metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
        dateRange: { preset: 'LAST_30_DAYS' },
        groupingPeriod: 'DAILY',
      });

      expect(result.meta.fromCache).toBe(false);
      expect(mockRedis.get).not.toHaveBeenCalled();
      expect(mockRedis.setex).not.toHaveBeenCalled();
    });
  });

  describe('invalidateCache', () => {
    it('should delete matching cache keys', async () => {
      mockRedis.scan
        .mockResolvedValueOnce(['0', ['query:tenant-1:abc', 'query:tenant-1:def']]);
      mockRedis.del.mockResolvedValue(2);

      const deleted = await service.invalidateCache('tenant-1', ['w-1', 'w-2']);

      expect(deleted).toBe(2);
      expect(mockRedis.del).toHaveBeenCalledWith(
        'query:tenant-1:abc',
        'query:tenant-1:def',
      );
    });
  });
});
