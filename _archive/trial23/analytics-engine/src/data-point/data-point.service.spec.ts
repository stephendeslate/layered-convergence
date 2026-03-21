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

  const mockPoint = {
    id: 'dp-1',
    tenantId: 't-1',
    dataSourceId: 'ds-1',
    timestamp: new Date('2024-01-01T00:00:00Z'),
    dimensions: { page: '/home' },
    metrics: { views: 100 },
  };

  beforeEach(async () => {
    prisma = {
      dataPoint: {
        create: vi.fn().mockResolvedValue(mockPoint),
        createMany: vi.fn().mockResolvedValue({ count: 3 }),
        findMany: vi.fn().mockResolvedValue([mockPoint]),
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
    const result = await service.create('t-1', {
      dataSourceId: 'ds-1',
      timestamp: '2024-01-01T00:00:00Z',
      dimensions: { page: '/home' },
      metrics: { views: 100 },
    });
    expect(result.id).toBe('dp-1');
  });

  it('should convert timestamp string to Date', async () => {
    await service.create('t-1', {
      dataSourceId: 'ds-1',
      timestamp: '2024-01-01T00:00:00Z',
      dimensions: {},
      metrics: {},
    });
    expect(prisma.dataPoint.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        timestamp: expect.any(Date),
      }),
    });
  });

  it('should create many data points', async () => {
    const result = await service.createMany('t-1', 'ds-1', [
      { timestamp: new Date(), dimensions: { a: 1 }, metrics: { b: 2 } },
      { timestamp: new Date(), dimensions: { a: 3 }, metrics: { b: 4 } },
    ]);
    expect(result.count).toBe(3);
  });

  it('should query data points for tenant', async () => {
    await service.query('t-1', { dataSourceId: 'ds-1' });
    expect(prisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: { tenantId: 't-1', dataSourceId: 'ds-1' },
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should query with date range filter', async () => {
    await service.query('t-1', {
      dataSourceId: 'ds-1',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    });
    expect(prisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: {
        tenantId: 't-1',
        dataSourceId: 'ds-1',
        timestamp: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should query with only startDate', async () => {
    await service.query('t-1', {
      dataSourceId: 'ds-1',
      startDate: '2024-01-01',
    });
    expect(prisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: {
        tenantId: 't-1',
        dataSourceId: 'ds-1',
        timestamp: {
          gte: expect.any(Date),
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should count data points for tenant and data source', async () => {
    const result = await service.count('t-1', 'ds-1');
    expect(result).toBe(42);
  });
});
