import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataPointService } from './data-point.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  dataPoint: {
    create: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
    aggregate: vi.fn(),
  },
};

describe('DataPointService', () => {
  let service: DataPointService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DataPointService(mockPrisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a data point with tenantId', async () => {
      const dto = {
        metric: 'cpu_usage',
        value: 85.5,
        timestamp: '2024-01-01T00:00:00Z',
        dataSourceId: 'ds-1',
      };
      const expected = { id: 'dp-1', ...dto, tenantId: 'tenant-1' };
      mockPrisma.dataPoint.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.dataPoint.create).toHaveBeenCalledWith({
        data: {
          metric: 'cpu_usage',
          value: 85.5,
          timestamp: new Date('2024-01-01T00:00:00Z'),
          dimensions: {},
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
        },
      });
    });

    it('should create a data point with dimensions', async () => {
      const dto = {
        metric: 'cpu_usage',
        value: 85.5,
        timestamp: '2024-01-01T00:00:00Z',
        dimensions: { host: 'server-1', region: 'us-east' },
        dataSourceId: 'ds-1',
      };
      mockPrisma.dataPoint.create.mockResolvedValue({ id: 'dp-1', ...dto });

      await service.create('tenant-1', dto);

      expect(mockPrisma.dataPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          dimensions: { host: 'server-1', region: 'us-east' },
        }),
      });
    });
  });

  describe('createBatch', () => {
    it('should create multiple data points', async () => {
      const dtos = [
        { metric: 'm1', value: 1, timestamp: '2024-01-01T00:00:00Z', dataSourceId: 'ds-1' },
        { metric: 'm2', value: 2, timestamp: '2024-01-01T01:00:00Z', dataSourceId: 'ds-1' },
      ];
      mockPrisma.dataPoint.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createBatch('tenant-1', dtos);

      expect(result).toEqual({ count: 2 });
      expect(mockPrisma.dataPoint.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ metric: 'm1', tenantId: 'tenant-1' }),
          expect.objectContaining({ metric: 'm2', tenantId: 'tenant-1' }),
        ]),
      });
    });
  });

  describe('query', () => {
    it('should query data points with tenant filter', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);

      await service.query('tenant-1', {});

      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        orderBy: { timestamp: 'desc' },
        take: 1000,
      });
    });

    it('should query with metric filter', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);

      await service.query('tenant-1', { metric: 'cpu_usage' });

      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', metric: 'cpu_usage' },
        orderBy: { timestamp: 'desc' },
        take: 1000,
      });
    });

    it('should query with date range', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);

      await service.query('tenant-1', {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      });

      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 'tenant-1',
          timestamp: {
            gte: new Date('2024-01-01T00:00:00Z'),
            lte: new Date('2024-01-31T23:59:59Z'),
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 1000,
      });
    });

    it('should aggregate with avg', async () => {
      mockPrisma.dataPoint.aggregate.mockResolvedValue({
        _avg: { value: 42.5 },
        _sum: null,
        _min: null,
        _max: null,
        _count: null,
      });

      const result = await service.query('tenant-1', { aggregation: 'avg' as any });

      expect(result).toEqual({ aggregation: 'avg', result: 42.5 });
    });

    it('should aggregate with sum', async () => {
      mockPrisma.dataPoint.aggregate.mockResolvedValue({
        _avg: null,
        _sum: { value: 100 },
        _min: null,
        _max: null,
        _count: null,
      });

      const result = await service.query('tenant-1', { aggregation: 'sum' as any });

      expect(result).toEqual({ aggregation: 'sum', result: 100 });
    });

    it('should aggregate with count', async () => {
      mockPrisma.dataPoint.aggregate.mockResolvedValue({
        _avg: null,
        _sum: null,
        _min: null,
        _max: null,
        _count: { value: 50 },
      });

      const result = await service.query('tenant-1', { aggregation: 'count' as any });

      expect(result).toEqual({ aggregation: 'count', result: 50 });
    });

    it('should query with dataSourceId filter', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);

      await service.query('tenant-1', { dataSourceId: 'ds-1' });

      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', dataSourceId: 'ds-1' },
        orderBy: { timestamp: 'desc' },
        take: 1000,
      });
    });
  });

  describe('getMetrics', () => {
    it('should return distinct metric names', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metric: 'cpu_usage' },
        { metric: 'memory_usage' },
      ]);

      const result = await service.getMetrics('tenant-1');

      expect(result).toEqual(['cpu_usage', 'memory_usage']);
    });
  });
});
