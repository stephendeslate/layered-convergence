import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AggregationService } from './aggregation.service.js';
import { TimeBucket } from './dto/aggregation-query.dto.js';

const mockPrisma = {
  dataPoint: {
    findMany: vi.fn(),
  },
};

describe('AggregationService', () => {
  let service: AggregationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AggregationService(mockPrisma as any);
  });

  describe('aggregate', () => {
    it('should return empty array for no data points', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      const result = await service.aggregate('t-1', 'ds-1', TimeBucket.DAILY);
      expect(result).toEqual([]);
    });

    it('should bucket data by day', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          timestamp: '2024-01-15T10:00:00Z',
          metrics: { views: 10 },
        },
        {
          timestamp: '2024-01-15T14:00:00Z',
          metrics: { views: 20 },
        },
        {
          timestamp: '2024-01-16T10:00:00Z',
          metrics: { views: 5 },
        },
      ]);
      const result = await service.aggregate('t-1', 'ds-1', TimeBucket.DAILY);
      expect(result).toHaveLength(2);
      expect(result[0].metrics.views).toBe(30);
      expect(result[1].metrics.views).toBe(5);
    });

    it('should bucket data by hour', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          timestamp: '2024-01-15T10:15:00Z',
          metrics: { views: 5 },
        },
        {
          timestamp: '2024-01-15T10:45:00Z',
          metrics: { views: 15 },
        },
      ]);
      const result = await service.aggregate('t-1', 'ds-1', TimeBucket.HOURLY);
      expect(result).toHaveLength(1);
      expect(result[0].metrics.views).toBe(20);
    });

    it('should bucket data by week', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          timestamp: '2024-01-15T10:00:00Z',
          metrics: { views: 10 },
        },
        {
          timestamp: '2024-01-17T10:00:00Z',
          metrics: { views: 20 },
        },
      ]);
      const result = await service.aggregate('t-1', 'ds-1', TimeBucket.WEEKLY);
      expect(result).toHaveLength(1);
      expect(result[0].metrics.views).toBe(30);
    });

    it('should filter by metricKey', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          timestamp: '2024-01-15T10:00:00Z',
          metrics: { views: 10, clicks: 5 },
        },
      ]);
      const result = await service.aggregate(
        't-1',
        'ds-1',
        TimeBucket.DAILY,
        undefined,
        undefined,
        'views',
      );
      expect(result[0].metrics).toEqual({ views: 10 });
      expect(result[0].metrics.clicks).toBeUndefined();
    });

    it('should filter by startDate', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      await service.aggregate(
        't-1',
        'ds-1',
        TimeBucket.DAILY,
        '2024-01-01',
      );
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
          }),
        }),
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should filter by endDate', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      await service.aggregate(
        't-1',
        'ds-1',
        TimeBucket.DAILY,
        undefined,
        '2024-12-31',
      );
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          timestamp: expect.objectContaining({
            lte: expect.any(Date),
          }),
        }),
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should sum numeric metrics within a bucket', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { timestamp: '2024-01-15T10:00:00Z', metrics: { a: 1, b: 2 } },
        { timestamp: '2024-01-15T14:00:00Z', metrics: { a: 3, b: 4 } },
      ]);
      const result = await service.aggregate('t-1', 'ds-1', TimeBucket.DAILY);
      expect(result[0].metrics).toEqual({ a: 4, b: 6 });
    });

    it('should ignore non-numeric metric values', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          timestamp: '2024-01-15T10:00:00Z',
          metrics: { count: 5, label: 'test' },
        },
      ]);
      const result = await service.aggregate('t-1', 'ds-1', TimeBucket.DAILY);
      expect(result[0].metrics).toEqual({ count: 5 });
    });

    it('should scope query by tenantId and dataSourceId', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      await service.aggregate('t-1', 'ds-1', TimeBucket.DAILY);
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't-1', dataSourceId: 'ds-1' },
        orderBy: { timestamp: 'asc' },
      });
    });
  });
});
