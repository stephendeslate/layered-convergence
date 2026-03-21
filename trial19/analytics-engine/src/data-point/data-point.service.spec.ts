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

  it('should find all data points for a tenant', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([]);
    const result = await service.findAll('t1');
    expect(result).toEqual([]);
  });

  it('should filter data points by metric', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([]);
    await service.findAll('t1', 'cpu_usage');
    expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 't1', metric: 'cpu_usage' } }),
    );
  });

  it('should create a data point with Decimal value', async () => {
    const created = { id: 'dp1', metric: 'cpu', value: '99.123456', tenantId: 't1' };
    prisma.dataPoint.create.mockResolvedValue(created);

    const result = await service.create('t1', {
      dataSourceId: 'ds1',
      metric: 'cpu',
      value: '99.123456',
      timestamp: '2024-01-01T00:00:00Z',
    });
    expect(result.metric).toBe('cpu');
  });

  it('should create batch data points', async () => {
    prisma.dataPoint.createMany.mockResolvedValue({ count: 2 });

    const result = await service.createBatch('t1', [
      { dataSourceId: 'ds1', metric: 'cpu', value: '50.5', timestamp: '2024-01-01T00:00:00Z' },
      { dataSourceId: 'ds1', metric: 'mem', value: '75.2', timestamp: '2024-01-01T00:00:00Z' },
    ]);
    expect(result.count).toBe(2);
  });
});
