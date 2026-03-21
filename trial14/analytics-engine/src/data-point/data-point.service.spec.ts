import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataPointService } from './data-point.service';

describe('DataPointService', () => {
  let service: DataPointService;
  let mockPrisma: any;

  const mockPoint = {
    id: 'dp-1',
    tenantId: 'tenant-1',
    dataSourceId: 'ds-1',
    timestamp: new Date('2024-01-01'),
    dimensions: { page: '/home' },
    metrics: { views: 100 },
  };

  beforeEach(() => {
    mockPrisma = {
      dataPoint: {
        create: vi.fn().mockResolvedValue(mockPoint),
        createMany: vi.fn().mockResolvedValue({ count: 2 }),
        findMany: vi.fn().mockResolvedValue([mockPoint]),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    };
    service = new DataPointService(mockPrisma);
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
    expect(result).toEqual(mockPoint);
  });

  it('should create with default empty objects', async () => {
    await service.create('tenant-1', { dataSourceId: 'ds-1', timestamp: '2024-01-01T00:00:00Z' });
    const createCall = mockPrisma.dataPoint.create.mock.calls[0][0];
    expect(createCall.data.dimensions).toEqual({});
    expect(createCall.data.metrics).toEqual({});
  });

  it('should create many data points', async () => {
    const points = [
      { timestamp: new Date(), dimensions: {}, metrics: { a: 1 } },
      { timestamp: new Date(), dimensions: {}, metrics: { a: 2 } },
    ];
    const result = await service.createMany('tenant-1', 'ds-1', points);
    expect(result.count).toBe(2);
  });

  it('should query data points without date filters', async () => {
    const result = await service.query('tenant-1', 'ds-1');
    expect(result).toHaveLength(1);
    expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', dataSourceId: 'ds-1' },
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should query with start date filter', async () => {
    await service.query('tenant-1', 'ds-1', '2024-01-01');
    const call = mockPrisma.dataPoint.findMany.mock.calls[0][0];
    expect(call.where.timestamp.gte).toBeInstanceOf(Date);
  });

  it('should query with end date filter', async () => {
    await service.query('tenant-1', 'ds-1', undefined, '2024-12-31');
    const call = mockPrisma.dataPoint.findMany.mock.calls[0][0];
    expect(call.where.timestamp.lte).toBeInstanceOf(Date);
  });

  it('should query with both date filters', async () => {
    await service.query('tenant-1', 'ds-1', '2024-01-01', '2024-12-31');
    const call = mockPrisma.dataPoint.findMany.mock.calls[0][0];
    expect(call.where.timestamp.gte).toBeInstanceOf(Date);
    expect(call.where.timestamp.lte).toBeInstanceOf(Date);
  });

  it('should delete by data source', async () => {
    const result = await service.deleteByDataSource('ds-1');
    expect(result.count).toBe(1);
  });
});
