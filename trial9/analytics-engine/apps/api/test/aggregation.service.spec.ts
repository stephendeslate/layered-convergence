import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AggregationService } from '../src/modules/aggregation/aggregation.service';
import { PrismaService } from '../src/config/prisma.service';

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

  it('should aggregate data points into daily buckets', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([
      { timestamp: new Date('2024-01-15T08:00:00Z'), metrics: { views: 100, duration: 30 } },
      { timestamp: new Date('2024-01-15T14:00:00Z'), metrics: { views: 200, duration: 45 } },
      { timestamp: new Date('2024-01-16T10:00:00Z'), metrics: { views: 150, duration: 20 } },
    ]);

    const result = await service.aggregate(
      'tenant-1', 'source-1',
      new Date('2024-01-15'), new Date('2024-01-17'),
      'daily',
    );

    expect(result).toHaveLength(2);
    const jan15 = result.find(b => b.bucket === '2024-01-15');
    expect(jan15).toBeDefined();
    expect(jan15!.count).toBe(2);
    expect(jan15!.metrics.views).toBe(300);
    expect(jan15!.metrics.duration).toBe(75);
  });

  it('should aggregate data points into hourly buckets', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([
      { timestamp: new Date('2024-01-15T08:15:00Z'), metrics: { views: 50 } },
      { timestamp: new Date('2024-01-15T08:45:00Z'), metrics: { views: 75 } },
      { timestamp: new Date('2024-01-15T09:30:00Z'), metrics: { views: 100 } },
    ]);

    const result = await service.aggregate(
      'tenant-1', 'source-1',
      new Date('2024-01-15T08:00:00Z'), new Date('2024-01-15T10:00:00Z'),
      'hourly',
    );

    expect(result).toHaveLength(2);
    const hour8 = result.find(b => b.bucket.includes('08:00:00'));
    expect(hour8).toBeDefined();
    expect(hour8!.count).toBe(2);
    expect(hour8!.metrics.views).toBe(125);
  });

  it('should return empty array for no data points', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([]);

    const result = await service.aggregate(
      'tenant-1', 'source-1',
      new Date('2024-01-15'), new Date('2024-01-17'),
      'daily',
    );

    expect(result).toHaveLength(0);
  });
});
