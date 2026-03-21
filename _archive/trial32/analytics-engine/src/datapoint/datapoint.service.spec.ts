import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataPointService } from './datapoint.service.js';

const mockPrisma = {
  dataPoint: {
    create: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
  },
};

describe('DataPointService', () => {
  let service: DataPointService;
  const tenantId = 'tenant-uuid';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DataPointService(mockPrisma as any);
  });

  describe('create', () => {
    it('should create a data point', async () => {
      mockPrisma.dataPoint.create.mockResolvedValue({ id: 'dp-1' });
      const result = await service.create(tenantId, {
        dataSourceId: 'ds-1',
        timestamp: '2024-01-01T00:00:00Z',
        dimensions: { region: 'us' },
        metrics: { revenue: 100 },
      });
      expect(result.id).toBe('dp-1');
    });

    it('should set tenantId on creation', async () => {
      mockPrisma.dataPoint.create.mockResolvedValue({});
      await service.create(tenantId, {
        dataSourceId: 'ds-1',
        timestamp: '2024-01-01T00:00:00Z',
        dimensions: {},
        metrics: {},
      });
      expect(mockPrisma.dataPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId }),
      });
    });
  });

  describe('createMany', () => {
    it('should create multiple data points', async () => {
      mockPrisma.dataPoint.createMany.mockResolvedValue({ count: 2 });
      const result = await service.createMany(tenantId, 'ds-1', [
        { timestamp: new Date(), dimensions: {}, metrics: { a: 1 } },
        { timestamp: new Date(), dimensions: {}, metrics: { a: 2 } },
      ]);
      expect(result.count).toBe(2);
    });
  });

  describe('query', () => {
    it('should return data points for tenant', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([{ id: 'dp-1' }]);
      const result = await service.query(tenantId, {});
      expect(result).toHaveLength(1);
    });

    it('should filter by dataSourceId', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      await service.query(tenantId, { dataSourceId: 'ds-1' });
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({ dataSourceId: 'ds-1' }),
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should filter by startDate', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      await service.query(tenantId, { startDate: '2024-01-01' });
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
          }),
        }),
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should filter by endDate', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      await service.query(tenantId, { endDate: '2024-12-31' });
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          timestamp: expect.objectContaining({
            lte: expect.any(Date),
          }),
        }),
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should aggregate with sum', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metrics: { revenue: 100 }, dimensions: {} },
        { metrics: { revenue: 200 }, dimensions: {} },
      ]);
      const result = await service.query(tenantId, { aggregation: 'sum' });
      expect(result).toEqual({ revenue: 300 });
    });

    it('should aggregate with avg', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metrics: { revenue: 100 }, dimensions: {} },
        { metrics: { revenue: 200 }, dimensions: {} },
      ]);
      const result = await service.query(tenantId, { aggregation: 'avg' });
      expect(result).toEqual({ revenue: 150 });
    });

    it('should aggregate with count', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metrics: { revenue: 100 }, dimensions: {} },
        { metrics: { revenue: 200 }, dimensions: {} },
      ]);
      const result = await service.query(tenantId, { aggregation: 'count' });
      expect(result).toEqual({ revenue: 2 });
    });

    it('should aggregate with min', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metrics: { revenue: 100 }, dimensions: {} },
        { metrics: { revenue: 200 }, dimensions: {} },
      ]);
      const result = await service.query(tenantId, { aggregation: 'min' });
      expect(result).toEqual({ revenue: 100 });
    });

    it('should aggregate with max', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metrics: { revenue: 100 }, dimensions: {} },
        { metrics: { revenue: 200 }, dimensions: {} },
      ]);
      const result = await service.query(tenantId, { aggregation: 'max' });
      expect(result).toEqual({ revenue: 200 });
    });

    it('should support groupBy', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metrics: { revenue: 100 }, dimensions: { region: 'us' } },
        { metrics: { revenue: 200 }, dimensions: { region: 'eu' } },
        { metrics: { revenue: 50 }, dimensions: { region: 'us' } },
      ]);
      const result = await service.query(tenantId, {
        aggregation: 'sum',
        groupBy: 'region',
      });
      expect(result).toEqual({
        us: { revenue: 150 },
        eu: { revenue: 200 },
      });
    });

    it('should return raw data when no aggregation', async () => {
      const data = [{ id: 'dp-1' }, { id: 'dp-2' }];
      mockPrisma.dataPoint.findMany.mockResolvedValue(data);
      const result = await service.query(tenantId, {});
      expect(result).toEqual(data);
    });
  });
});
