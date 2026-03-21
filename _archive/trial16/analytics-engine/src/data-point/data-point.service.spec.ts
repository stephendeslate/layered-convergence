import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataPointService } from './data-point.service';

describe('DataPointService', () => {
  let service: DataPointService;
  let mockPrisma: any;

  const mockPoint = {
    id: 'dp-1',
    tenantId: 'tenant-1',
    dataSourceId: 'ds-1',
    timestamp: new Date('2024-01-15'),
    dimensions: { page: '/home' },
    metrics: { views: 100 },
  };

  beforeEach(() => {
    mockPrisma = {
      dataPoint: {
        create: vi.fn().mockResolvedValue(mockPoint),
        createMany: vi.fn().mockResolvedValue({ count: 3 }),
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
      timestamp: '2024-01-15T00:00:00Z',
      dimensions: { page: '/home' },
      metrics: { views: 100 },
    });
    expect(result).toEqual(mockPoint);
  });

  it('should create many data points', async () => {
    const result = await service.createMany('tenant-1', 'ds-1', [
      { timestamp: new Date(), dimensions: {}, metrics: {} },
      { timestamp: new Date(), dimensions: {}, metrics: {} },
      { timestamp: new Date(), dimensions: {}, metrics: {} },
    ]);
    expect(result.count).toBe(3);
  });

  it('should query data points without date filter', async () => {
    const result = await service.query('tenant-1', 'ds-1');
    expect(result).toHaveLength(1);
    expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1', dataSourceId: 'ds-1' },
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should query data points with start date', async () => {
    await service.query('tenant-1', 'ds-1', '2024-01-01');
    expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-1',
        dataSourceId: 'ds-1',
        timestamp: { gte: expect.any(Date) },
      },
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should query data points with both start and end date', async () => {
    await service.query('tenant-1', 'ds-1', '2024-01-01', '2024-12-31');
    expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-1',
        dataSourceId: 'ds-1',
        timestamp: { gte: expect.any(Date), lte: expect.any(Date) },
      },
      orderBy: { timestamp: 'asc' },
    });
  });

  it('should delete data points by data source', async () => {
    const result = await service.deleteByDataSource('ds-1');
    expect(result.count).toBe(1);
  });
});
