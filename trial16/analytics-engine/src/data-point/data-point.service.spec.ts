import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
      aggregate: ReturnType<typeof vi.fn>;
    };
    dataSource: {
      findFirst: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';
  const otherTenantId = 'tenant-2';

  const mockDataPoint = {
    id: 'dp-1',
    tenantId,
    dataSourceId: 'ds-1',
    metric: 'page_views',
    value: 1500,
    dimensions: { country: 'US' },
    timestamp: new Date('2026-03-01'),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      dataPoint: {
        create: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        aggregate: vi.fn(),
      },
      dataSource: {
        findFirst: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataPointService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataPointService>(DataPointService);
  });

  describe('create', () => {
    const createDto = {
      dataSourceId: 'ds-1',
      metric: 'page_views',
      value: 1500,
      timestamp: '2026-03-01T00:00:00Z',
    };

    it('should create a data point', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.dataPoint.create.mockResolvedValue(mockDataPoint);

      const result = await service.create(tenantId, createDto);

      expect(result.metric).toBe('page_views');
      expect(result.value).toBe(1500);
    });

    it('should throw NotFoundException if data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.create(tenantId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should verify data source belongs to tenant', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.create(otherTenantId, createDto),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId: otherTenantId },
      });
    });

    it('should create with empty dimensions when not provided', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.dataPoint.create.mockResolvedValue(mockDataPoint);

      await service.create(tenantId, createDto);

      expect(prisma.dataPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ dimensions: {} }),
      });
    });

    it('should create with provided dimensions', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.dataPoint.create.mockResolvedValue(mockDataPoint);

      await service.create(tenantId, {
        ...createDto,
        dimensions: { country: 'US' },
      });

      expect(prisma.dataPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ dimensions: { country: 'US' } }),
      });
    });

    it('should convert timestamp string to Date', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.dataPoint.create.mockResolvedValue(mockDataPoint);

      await service.create(tenantId, createDto);

      expect(prisma.dataPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ timestamp: expect.any(Date) }),
      });
    });
  });

  describe('createBatch', () => {
    const batchDto = {
      dataPoints: [
        {
          dataSourceId: 'ds-1',
          metric: 'page_views',
          value: 100,
          timestamp: '2026-03-01T00:00:00Z',
        },
        {
          dataSourceId: 'ds-1',
          metric: 'page_views',
          value: 200,
          timestamp: '2026-03-02T00:00:00Z',
        },
      ],
    };

    it('should create multiple data points', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.dataPoint.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createBatch(tenantId, batchDto);

      expect(result.count).toBe(2);
    });

    it('should verify all data sources belong to tenant', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.createBatch(tenantId, batchDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle batch with multiple data sources', async () => {
      const multiSourceBatch = {
        dataPoints: [
          { dataSourceId: 'ds-1', metric: 'm1', value: 1, timestamp: '2026-03-01T00:00:00Z' },
          { dataSourceId: 'ds-2', metric: 'm2', value: 2, timestamp: '2026-03-01T00:00:00Z' },
        ],
      };

      prisma.dataSource.findFirst
        .mockResolvedValueOnce({ id: 'ds-1', tenantId })
        .mockResolvedValueOnce({ id: 'ds-2', tenantId });
      prisma.dataPoint.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createBatch(tenantId, multiSourceBatch);

      expect(result.count).toBe(2);
      expect(prisma.dataSource.findFirst).toHaveBeenCalledTimes(2);
    });

    it('should reject batch if any data source not owned by tenant', async () => {
      const multiSourceBatch = {
        dataPoints: [
          { dataSourceId: 'ds-1', metric: 'm1', value: 1, timestamp: '2026-03-01T00:00:00Z' },
          { dataSourceId: 'ds-evil', metric: 'm2', value: 2, timestamp: '2026-03-01T00:00:00Z' },
        ],
      };

      prisma.dataSource.findFirst
        .mockResolvedValueOnce({ id: 'ds-1', tenantId })
        .mockResolvedValueOnce(null);

      await expect(
        service.createBatch(tenantId, multiSourceBatch),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('query', () => {
    it('should query data points with default pagination', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([mockDataPoint]);
      prisma.dataPoint.count.mockResolvedValue(1);

      const result = await service.query(tenantId, {});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(100);
      expect(result.offset).toBe(0);
    });

    it('should filter by metric', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      prisma.dataPoint.count.mockResolvedValue(0);

      await service.query(tenantId, { metric: 'page_views' });

      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ metric: 'page_views' }),
        }),
      );
    });

    it('should filter by data source', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      prisma.dataPoint.count.mockResolvedValue(0);

      await service.query(tenantId, { dataSourceId: 'ds-1' });

      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ dataSourceId: 'ds-1' }),
        }),
      );
    });

    it('should filter by date range', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      prisma.dataPoint.count.mockResolvedValue(0);

      await service.query(tenantId, {
        startDate: '2026-01-01',
        endDate: '2026-03-31',
      });

      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            timestamp: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        }),
      );
    });

    it('should support custom limit and offset', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      prisma.dataPoint.count.mockResolvedValue(0);

      const result = await service.query(tenantId, { limit: 50, offset: 10 });

      expect(result.limit).toBe(50);
      expect(result.offset).toBe(10);
    });

    it('should always filter by tenantId', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      prisma.dataPoint.count.mockResolvedValue(0);

      await service.query(tenantId, {});

      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId }),
        }),
      );
    });
  });

  describe('getMetrics', () => {
    it('should return distinct metric names', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([
        { metric: 'page_views' },
        { metric: 'conversions' },
      ]);

      const result = await service.getMetrics(tenantId);

      expect(result).toEqual(['page_views', 'conversions']);
    });

    it('should return empty array when no metrics exist', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);

      const result = await service.getMetrics(tenantId);

      expect(result).toEqual([]);
    });
  });

  describe('getAggregation', () => {
    it('should return aggregated values', async () => {
      prisma.dataPoint.aggregate.mockResolvedValue({
        _avg: { value: 150 },
        _sum: { value: 300 },
        _min: { value: 100 },
        _max: { value: 200 },
        _count: 2,
      });

      const result = await service.getAggregation(
        tenantId,
        'page_views',
        '2026-01-01',
        '2026-03-31',
      );

      expect(result.avg).toBe(150);
      expect(result.sum).toBe(300);
      expect(result.min).toBe(100);
      expect(result.max).toBe(200);
      expect(result.count).toBe(2);
    });

    it('should filter by tenantId and metric', async () => {
      prisma.dataPoint.aggregate.mockResolvedValue({
        _avg: { value: null },
        _sum: { value: null },
        _min: { value: null },
        _max: { value: null },
        _count: 0,
      });

      await service.getAggregation(tenantId, 'revenue', '2026-01-01', '2026-03-31');

      expect(prisma.dataPoint.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId, metric: 'revenue' }),
        }),
      );
    });
  });
});
