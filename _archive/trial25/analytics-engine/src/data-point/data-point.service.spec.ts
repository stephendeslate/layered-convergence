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
    dimensions: { region: 'US' },
    metrics: { value: 42 },
  };

  beforeEach(async () => {
    prisma = {
      dataPoint: {
        create: vi.fn().mockResolvedValue(mockDataPoint),
        createMany: vi.fn().mockResolvedValue({ count: 3 }),
        findMany: vi.fn().mockResolvedValue([mockDataPoint]),
        count: vi.fn().mockResolvedValue(10),
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
      dimensions: { region: 'US' },
      metrics: { value: 42 },
    });
    expect(result).toEqual(mockDataPoint);
  });

  it('should pass correct data to prisma create', async () => {
    await service.create('tenant-1', {
      dataSourceId: 'ds-1',
      timestamp: '2024-01-01T00:00:00Z',
      dimensions: { region: 'US' },
      metrics: { value: 42 },
    });
    const callArgs = prisma.dataPoint.create.mock.calls[0][0];
    expect(callArgs.data.tenantId).toBe('tenant-1');
    expect(callArgs.data.dataSourceId).toBe('ds-1');
    expect(callArgs.data.timestamp).toBeInstanceOf(Date);
  });

  it('should create many data points', async () => {
    const points = [
      { timestamp: new Date(), dimensions: { a: 1 }, metrics: { b: 2 } },
      { timestamp: new Date(), dimensions: { a: 3 }, metrics: { b: 4 } },
    ];
    const result = await service.createMany('tenant-1', 'ds-1', points);
    expect(result.count).toBe(3);
  });

  it('should query data points', async () => {
    const result = await service.query('tenant-1', { dataSourceId: 'ds-1' });
    expect(result).toEqual([mockDataPoint]);
    expect(prisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', dataSourceId: 'ds-1' },
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should query data points with start date', async () => {
    await service.query('tenant-1', {
      dataSourceId: 'ds-1',
      startDate: '2024-01-01',
    });
    const callArgs = prisma.dataPoint.findMany.mock.calls[0][0];
    expect(callArgs.where.timestamp).toBeDefined();
    expect(callArgs.where.timestamp.gte).toBeInstanceOf(Date);
  });

  it('should query data points with end date', async () => {
    await service.query('tenant-1', {
      dataSourceId: 'ds-1',
      endDate: '2024-12-31',
    });
    const callArgs = prisma.dataPoint.findMany.mock.calls[0][0];
    expect(callArgs.where.timestamp.lte).toBeInstanceOf(Date);
  });

  it('should query data points with both date filters', async () => {
    await service.query('tenant-1', {
      dataSourceId: 'ds-1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    const callArgs = prisma.dataPoint.findMany.mock.calls[0][0];
    expect(callArgs.where.timestamp.gte).toBeInstanceOf(Date);
    expect(callArgs.where.timestamp.lte).toBeInstanceOf(Date);
  });

  it('should count data points', async () => {
    const result = await service.count('tenant-1', 'ds-1');
    expect(result).toBe(10);
    expect(prisma.dataPoint.count).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', dataSourceId: 'ds-1' },
    });
  });
});
