import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataPointService } from './data-point.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DataPointService', () => {
  let service: DataPointService;
  let prisma: {
    dataSource: {
      findFirst: ReturnType<typeof vi.fn>;
    };
    dataPoint: {
      create: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
      aggregate: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';

  const mockDataPoint = {
    id: 'dp-1',
    tenantId,
    dataSourceId: 'ds-1',
    metric: 'revenue',
    value: 42.5,
    dimensions: { region: 'US' },
    timestamp: new Date('2025-01-15'),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        findFirst: vi.fn(),
      },
      dataPoint: {
        create: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        aggregate: vi.fn(),
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
    it('should create a data point', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.dataPoint.create.mockResolvedValue(mockDataPoint);

      const result = await service.create(tenantId, {
        dataSourceId: 'ds-1',
        metric: 'revenue',
        value: 42.5,
        timestamp: '2025-01-15T00:00:00Z',
      });

      expect(result.id).toBe('dp-1');
    });

    it('should throw NotFoundException if data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, {
          dataSourceId: 'ds-999',
          metric: 'revenue',
          value: 10,
          timestamp: '2025-01-15T00:00:00Z',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should verify data source belongs to tenant', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.create(tenantId, {
          dataSourceId: 'ds-other',
          metric: 'revenue',
          value: 10,
          timestamp: '2025-01-15T00:00:00Z',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-other', tenantId },
      });
    });

    it('should default dimensions to empty object', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.dataPoint.create.mockResolvedValue(mockDataPoint);

      await service.create(tenantId, {
        dataSourceId: 'ds-1',
        metric: 'revenue',
        value: 10,
        timestamp: '2025-01-15T00:00:00Z',
      });

      expect(prisma.dataPoint.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ dimensions: {} }),
      });
    });
  });

  describe('createBatch', () => {
    it('should create multiple data points', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.dataPoint.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createBatch(tenantId, {
        dataPoints: [
          { dataSourceId: 'ds-1', metric: 'revenue', value: 10, timestamp: '2025-01-15T00:00:00Z' },
          { dataSourceId: 'ds-1', metric: 'revenue', value: 20, timestamp: '2025-01-16T00:00:00Z' },
        ],
      });

      expect(result.count).toBe(2);
    });

    it('should throw NotFoundException if any data source not found', async () => {
      prisma.dataSource.findFirst
        .mockResolvedValueOnce({ id: 'ds-1', tenantId })
        .mockResolvedValueOnce(null);

      await expect(
        service.createBatch(tenantId, {
          dataPoints: [
            { dataSourceId: 'ds-1', metric: 'revenue', value: 10, timestamp: '2025-01-15T00:00:00Z' },
            { dataSourceId: 'ds-2', metric: 'revenue', value: 20, timestamp: '2025-01-16T00:00:00Z' },
          ],
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should deduplicate data source IDs before validation', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId });
      prisma.dataPoint.createMany.mockResolvedValue({ count: 2 });

      await service.createBatch(tenantId, {
        dataPoints: [
          { dataSourceId: 'ds-1', metric: 'a', value: 1, timestamp: '2025-01-15T00:00:00Z' },
          { dataSourceId: 'ds-1', metric: 'b', value: 2, timestamp: '2025-01-16T00:00:00Z' },
        ],
      });

      expect(prisma.dataSource.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('query', () => {
    it('should return paginated data points', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([mockDataPoint]);
      prisma.dataPoint.count.mockResolvedValue(1);

      const result = await service.query(tenantId, {});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(100);
      expect(result.offset).toBe(0);
    });

    it('should filter by dataSourceId', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      prisma.dataPoint.count.mockResolvedValue(0);

      await service.query(tenantId, { dataSourceId: 'ds-1' });

      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ dataSourceId: 'ds-1' }),
        }),
      );
    });

    it('should filter by metric', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      prisma.dataPoint.count.mockResolvedValue(0);

      await service.query(tenantId, { metric: 'revenue' });

      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ metric: 'revenue' }),
        }),
      );
    });

    it('should filter by date range', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      prisma.dataPoint.count.mockResolvedValue(0);

      await service.query(tenantId, {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            timestamp: {
              gte: new Date('2025-01-01'),
              lte: new Date('2025-12-31'),
            },
          }),
        }),
      );
    });

    it('should apply custom limit and offset', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      prisma.dataPoint.count.mockResolvedValue(0);

      const result = await service.query(tenantId, { limit: 10, offset: 20 });

      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10, skip: 20 }),
      );
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(20);
    });
  });

  describe('getMetrics', () => {
    it('should return distinct metric names', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([
        { metric: 'revenue' },
        { metric: 'users' },
      ]);

      const result = await service.getMetrics(tenantId);

      expect(result).toEqual(['revenue', 'users']);
      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        select: { metric: true },
        distinct: ['metric'],
      });
    });
  });

  describe('getAggregation', () => {
    it('should return aggregation results', async () => {
      prisma.dataPoint.aggregate.mockResolvedValue({
        _avg: { value: 25 },
        _sum: { value: 100 },
        _min: { value: 10 },
        _max: { value: 50 },
        _count: 4,
      });

      const result = await service.getAggregation(
        tenantId,
        'revenue',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toEqual({
        metric: 'revenue',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        avg: 25,
        sum: 100,
        min: 10,
        max: 50,
        count: 4,
      });
    });
  });
});
