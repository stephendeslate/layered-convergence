import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataPointService } from './data-point.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DataPointService', () => {
  let service: DataPointService;
  let prisma: {
    dataPoint: {
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      dataPoint: {
        findMany: vi.fn(),
        create: vi.fn(),
        createMany: vi.fn(),
      },
    };
    service = new DataPointService(prisma as unknown as PrismaService);
  });

  it('should return data points for a tenant', async () => {
    const points = [{ id: 'dp1', tenantId: 't1', metric: 'cpu', value: 42.5 }];
    prisma.dataPoint.findMany.mockResolvedValue(points);

    const result = await service.findAll('t1');

    expect(result).toEqual(points);
  });

  it('should filter by dataSourceId and metric', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([]);

    await service.findAll('t1', 'ds1', 'cpu');

    expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 't1', dataSourceId: 'ds1', metric: 'cpu' },
      }),
    );
  });

  it('should create a data point', async () => {
    const created = { id: 'dp1', tenantId: 't1', metric: 'cpu', value: 55.0 };
    prisma.dataPoint.create.mockResolvedValue(created);

    const result = await service.create('t1', {
      dataSourceId: 'ds1',
      metric: 'cpu',
      value: 55.0,
      timestamp: '2026-01-01T00:00:00Z',
    });

    expect(result).toEqual(created);
  });

  it('should create many data points', async () => {
    prisma.dataPoint.createMany.mockResolvedValue({ count: 2 });

    const result = await service.createMany('t1', [
      { dataSourceId: 'ds1', metric: 'cpu', value: 50, timestamp: '2026-01-01T00:00:00Z' },
      { dataSourceId: 'ds1', metric: 'memory', value: 70, timestamp: '2026-01-01T00:00:00Z' },
    ]);

    expect(result.count).toBe(2);
  });
});
