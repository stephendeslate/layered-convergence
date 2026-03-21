import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AggregationService } from './aggregation.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AggregationService', () => {
  let service: AggregationService;
  let prisma: { dataPoint: { findMany: ReturnType<typeof vi.fn> } };

  beforeEach(() => {
    prisma = {
      dataPoint: {
        findMany: vi.fn(),
      },
    };
    service = new AggregationService(prisma as unknown as PrismaService);
  });

  it('should aggregate data points by daily granularity', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([
      {
        id: '1',
        tenantId: 'tenant1',
        dataSourceId: 'ds1',
        timestamp: new Date('2026-03-15T10:00:00Z'),
        dimensions: { page: '/home' },
        metrics: { views: 100, clicks: 10 },
      },
      {
        id: '2',
        tenantId: 'tenant1',
        dataSourceId: 'ds1',
        timestamp: new Date('2026-03-15T14:00:00Z'),
        dimensions: { page: '/about' },
        metrics: { views: 50, clicks: 5 },
      },
    ]);

    const result = await service.aggregate(
      'tenant1',
      'ds1',
      'daily',
      new Date('2026-03-15'),
      new Date('2026-03-16'),
    );

    expect(result).toHaveLength(1);
    expect(result[0].metrics.views).toBe(150);
    expect(result[0].metrics.clicks).toBe(15);
    expect(result[0].count).toBe(2);
  });

  it('should aggregate into separate hourly buckets', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([
      {
        id: '1',
        tenantId: 'tenant1',
        dataSourceId: 'ds1',
        timestamp: new Date('2026-03-15T10:30:00Z'),
        dimensions: {},
        metrics: { views: 100 },
      },
      {
        id: '2',
        tenantId: 'tenant1',
        dataSourceId: 'ds1',
        timestamp: new Date('2026-03-15T11:30:00Z'),
        dimensions: {},
        metrics: { views: 200 },
      },
    ]);

    const result = await service.aggregate(
      'tenant1',
      'ds1',
      'hourly',
      new Date('2026-03-15'),
      new Date('2026-03-16'),
    );

    expect(result).toHaveLength(2);
    expect(result[0].metrics.views).toBe(100);
    expect(result[1].metrics.views).toBe(200);
  });

  it('should return empty array for no data points', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([]);

    const result = await service.aggregate(
      'tenant1',
      'ds1',
      'daily',
      new Date('2026-03-15'),
      new Date('2026-03-16'),
    );

    expect(result).toHaveLength(0);
  });
});
