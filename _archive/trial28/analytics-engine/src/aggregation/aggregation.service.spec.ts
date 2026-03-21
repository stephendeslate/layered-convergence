import { Test } from '@nestjs/testing';
import { AggregationService } from './aggregation.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  dataPoint: {
    findMany: vi.fn(),
  },
};

describe('AggregationService', () => {
  let service: AggregationService;
  const tenantId = 'tenant-uuid-1';
  const dataSourceId = 'ds-uuid-1';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AggregationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(AggregationService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('aggregateByTimeBucket', () => {
    it('should return empty array when no data points', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);

      const result = await service.aggregateByTimeBucket(
        tenantId,
        dataSourceId,
        'daily',
      );
      expect(result).toEqual([]);
    });

    it('should bucket data points by hour', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          id: 'dp1',
          timestamp: new Date('2025-01-01T10:15:00Z'),
          metrics: { revenue: 100 },
        },
        {
          id: 'dp2',
          timestamp: new Date('2025-01-01T10:45:00Z'),
          metrics: { revenue: 200 },
        },
        {
          id: 'dp3',
          timestamp: new Date('2025-01-01T11:15:00Z'),
          metrics: { revenue: 50 },
        },
      ]);

      const result = await service.aggregateByTimeBucket(
        tenantId,
        dataSourceId,
        'hourly',
      );
      expect(result.length).toBeGreaterThanOrEqual(2);
      const firstBucket = result.find((r) => r.count === 2);
      expect(firstBucket).toBeDefined();
      expect(firstBucket!.metrics.revenue).toBe(300);
    });

    it('should bucket data points by day', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          id: 'dp1',
          timestamp: new Date('2025-01-01T10:00:00Z'),
          metrics: { clicks: 10 },
        },
        {
          id: 'dp2',
          timestamp: new Date('2025-01-01T14:00:00Z'),
          metrics: { clicks: 20 },
        },
        {
          id: 'dp3',
          timestamp: new Date('2025-01-02T10:00:00Z'),
          metrics: { clicks: 5 },
        },
      ]);

      const result = await service.aggregateByTimeBucket(
        tenantId,
        dataSourceId,
        'daily',
      );
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('should bucket data points by week', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          id: 'dp1',
          timestamp: new Date('2025-01-06T10:00:00Z'),
          metrics: { views: 100 },
        },
        {
          id: 'dp2',
          timestamp: new Date('2025-01-07T10:00:00Z'),
          metrics: { views: 200 },
        },
      ]);

      const result = await service.aggregateByTimeBucket(
        tenantId,
        dataSourceId,
        'weekly',
      );
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by date range when provided', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);

      await service.aggregateByTimeBucket(
        tenantId,
        dataSourceId,
        'daily',
        new Date('2025-01-01'),
        new Date('2025-01-31'),
      );

      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          dataSourceId,
          timestamp: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should aggregate multiple metric keys', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          id: 'dp1',
          timestamp: new Date('2025-01-01T10:00:00Z'),
          metrics: { revenue: 100, clicks: 10 },
        },
        {
          id: 'dp2',
          timestamp: new Date('2025-01-01T11:00:00Z'),
          metrics: { revenue: 200, clicks: 20 },
        },
      ]);

      const result = await service.aggregateByTimeBucket(
        tenantId,
        dataSourceId,
        'daily',
      );
      expect(result).toHaveLength(1);
      expect(result[0].metrics.revenue).toBe(300);
      expect(result[0].metrics.clicks).toBe(30);
    });
  });
});
