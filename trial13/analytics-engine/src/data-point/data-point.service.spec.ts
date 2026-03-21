import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataPointService } from './data-point.service';

describe('DataPointService', () => {
  let service: DataPointService;
  let mockPrisma: any;

  const mockDataPoint = {
    id: 'dp-1',
    dataSourceId: 'ds-1',
    tenantId: 'tenant-1',
    timestamp: new Date('2024-01-15T00:00:00Z'),
    dimensions: { page: '/home' },
    metrics: { views: 100 },
  };

  beforeEach(() => {
    mockPrisma = {
      dataPoint: {
        create: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
        deleteMany: vi.fn(),
      },
    };
    service = new DataPointService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a data point', async () => {
      mockPrisma.dataPoint.create.mockResolvedValue(mockDataPoint);
      const result = await service.create('tenant-1', {
        dataSourceId: 'ds-1',
        timestamp: '2024-01-15T00:00:00Z',
        dimensions: { page: '/home' },
        metrics: { views: 100 },
      });
      expect(result).toEqual(mockDataPoint);
    });

    it('should use default empty objects for optional fields', async () => {
      mockPrisma.dataPoint.create.mockResolvedValue(mockDataPoint);
      await service.create('tenant-1', {
        dataSourceId: 'ds-1',
        timestamp: '2024-01-15T00:00:00Z',
      });
      expect(mockPrisma.dataPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dimensions: {},
          metrics: {},
        }),
      });
    });
  });

  describe('createMany', () => {
    it('should create multiple data points', async () => {
      mockPrisma.dataPoint.createMany.mockResolvedValue({ count: 2 });
      const result = await service.createMany('tenant-1', 'ds-1', [
        { timestamp: new Date(), dimensions: {}, metrics: {} },
        { timestamp: new Date(), dimensions: {}, metrics: {} },
      ]);
      expect(result.count).toBe(2);
    });
  });

  describe('query', () => {
    it('should query data points by tenant and data source', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([mockDataPoint]);
      const result = await service.query('tenant-1', 'ds-1');
      expect(result).toHaveLength(1);
    });

    it('should filter by date range when provided', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      await service.query('tenant-1', 'ds-1', '2024-01-01', '2024-01-31');
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should not include timestamp filter when no dates provided', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      await service.query('tenant-1', 'ds-1');
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', dataSourceId: 'ds-1' },
        orderBy: { timestamp: 'asc' },
      });
    });
  });

  describe('deleteByDataSource', () => {
    it('should delete all data points for a data source', async () => {
      mockPrisma.dataPoint.deleteMany.mockResolvedValue({ count: 10 });
      const result = await service.deleteByDataSource('ds-1');
      expect(result.count).toBe(10);
    });
  });
});
