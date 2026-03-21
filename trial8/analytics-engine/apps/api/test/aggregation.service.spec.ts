import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AggregationService } from '../src/modules/aggregation/aggregation.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AggregationService', () => {
  let service: AggregationService;
  let prisma: { dataPoint: { findMany: ReturnType<typeof vi.fn>; findFirst: ReturnType<typeof vi.fn> }; dataSource: { findUniqueOrThrow: ReturnType<typeof vi.fn> } };

  beforeEach(() => {
    prisma = {
      dataPoint: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      dataSource: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'ds1', tenantId: 't1', name: 'Test Source' }),
      },
    };
    service = new AggregationService(prisma as unknown as PrismaService);
  });

  it('returns empty array when no data points exist', async () => {
    const result = await service.aggregate('t1', 'ds1', 'day');
    expect(result).toEqual([]);
  });

  it('groups data points by day', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([
      { timestamp: new Date('2025-01-15T10:00:00Z'), metrics: { pageViews: 100, sessions: 10 } },
      { timestamp: new Date('2025-01-15T14:00:00Z'), metrics: { pageViews: 200, sessions: 20 } },
      { timestamp: new Date('2025-01-16T10:00:00Z'), metrics: { pageViews: 150, sessions: 15 } },
    ]);

    const result = await service.aggregate('t1', 'ds1', 'day');

    expect(result).toHaveLength(2);
    expect(result[0].count).toBe(2); // 2 points on Jan 15
    expect(result[0].metrics.pageViews).toBe(300);
    expect(result[1].count).toBe(1); // 1 point on Jan 16
  });

  it('runAggregationJob skips when no data exists', async () => {
    const result = await service.runAggregationJob('ds1');
    expect(result).toEqual({ aggregated: 0 });
  });
});
