import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { DataPointService } from './data-point.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DataPointService', () => {
  let service: DataPointService;
  let prisma: {
    dataPoint: {
      create: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
  };

  const mockDataPoint = {
    id: 'dp-1',
    tenantId: 'tenant-1',
    dataSourceId: 'ds-1',
    timestamp: new Date('2024-01-01'),
    dimensions: { page: '/home' },
    metrics: { views: 100 },
  };

  beforeEach(async () => {
    prisma = {
      dataPoint: {
        create: vi.fn().mockResolvedValue(mockDataPoint),
        createMany: vi.fn().mockResolvedValue({ count: 3 }),
        findMany: vi.fn().mockResolvedValue([mockDataPoint]),
        count: vi.fn().mockResolvedValue(42),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        DataPointService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataPointService>(DataPointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a data point', async () => {
    const result = await service.create('tenant-1', {
      dataSourceId: 'ds-1',
      timestamp: '2024-01-01T00:00:00Z',
      dimensions: { page: '/home' },
      metrics: { views: 100 },
    });
    expect(result).toEqual(mockDataPoint);
  });

  it('should create many data points', async () => {
    const result = await service.createMany('tenant-1', 'ds-1', [
      { timestamp: new Date(), dimensions: {}, metrics: {} },
      { timestamp: new Date(), dimensions: {}, metrics: {} },
      { timestamp: new Date(), dimensions: {}, metrics: {} },
    ]);
    expect(result.count).toBe(3);
  });

  it('should query data points', async () => {
    const result = await service.query('tenant-1', { dataSourceId: 'ds-1' });
    expect(result).toHaveLength(1);
  });

  it('should query with date range', async () => {
    await service.query('tenant-1', {
      dataSourceId: 'ds-1',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
    });
    expect(prisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        timestamp: expect.objectContaining({
          gte: expect.any(Date),
          lte: expect.any(Date),
        }),
      }),
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should query with only startDate', async () => {
    await service.query('tenant-1', {
      dataSourceId: 'ds-1',
      startDate: '2024-01-01T00:00:00Z',
    });
    expect(prisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        timestamp: { gte: expect.any(Date) },
      }),
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should count data points', async () => {
    const result = await service.count('tenant-1', 'ds-1');
    expect(result).toBe(42);
  });
});
