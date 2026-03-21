import { describe, it, expect, beforeEach } from 'vitest';
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

  beforeEach(async () => {
    prisma = {
      dataPoint: {
        create: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        DataPointService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DataPointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a data point', async () => {
    prisma.dataPoint.create.mockResolvedValue({ id: 'dp1' });
    const result = await service.create('t1', {
      dataSourceId: 'ds1',
      timestamp: '2024-01-01T00:00:00Z',
      dimensions: { region: 'US' },
      metrics: { revenue: 100 },
    });
    expect(result.id).toBe('dp1');
  });

  it('should create many data points', async () => {
    prisma.dataPoint.createMany.mockResolvedValue({ count: 3 });
    const result = await service.createMany('t1', 'ds1', [
      { timestamp: new Date(), dimensions: {}, metrics: {} },
      { timestamp: new Date(), dimensions: {}, metrics: {} },
      { timestamp: new Date(), dimensions: {}, metrics: {} },
    ]);
    expect(result.count).toBe(3);
  });

  it('should query data points without date range', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([{ id: 'dp1' }]);
    const result = await service.query('t1', { dataSourceId: 'ds1' });
    expect(result).toHaveLength(1);
  });

  it('should query data points with start date', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([]);
    await service.query('t1', {
      dataSourceId: 'ds1',
      startDate: '2024-01-01',
    });
    const call = prisma.dataPoint.findMany.mock.calls[0][0];
    expect(call.where.timestamp).toBeDefined();
    expect(call.where.timestamp.gte).toBeInstanceOf(Date);
  });

  it('should query data points with end date', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([]);
    await service.query('t1', {
      dataSourceId: 'ds1',
      endDate: '2024-12-31',
    });
    const call = prisma.dataPoint.findMany.mock.calls[0][0];
    expect(call.where.timestamp.lte).toBeInstanceOf(Date);
  });

  it('should query data points with both dates', async () => {
    prisma.dataPoint.findMany.mockResolvedValue([]);
    await service.query('t1', {
      dataSourceId: 'ds1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    const call = prisma.dataPoint.findMany.mock.calls[0][0];
    expect(call.where.timestamp.gte).toBeInstanceOf(Date);
    expect(call.where.timestamp.lte).toBeInstanceOf(Date);
  });

  it('should count data points', async () => {
    prisma.dataPoint.count.mockResolvedValue(42);
    const result = await service.count('t1', 'ds1');
    expect(result).toBe(42);
  });

  it('should include tenantId in count query', async () => {
    prisma.dataPoint.count.mockResolvedValue(0);
    await service.count('t1', 'ds1');
    expect(prisma.dataPoint.count).toHaveBeenCalledWith({
      where: { tenantId: 't1', dataSourceId: 'ds1' },
    });
  });
});
