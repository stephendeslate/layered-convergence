import { describe, it, expect, beforeEach, vi } from 'vitest';
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

  describe('create', () => {
    it('should create a data point', async () => {
      const dto = {
        dataSourceId: 'ds-1',
        timestamp: '2024-01-01T00:00:00Z',
        dimensions: { region: 'US' },
        metrics: { value: 100 },
      };
      prisma.dataPoint.create.mockResolvedValue({ id: 'dp-1' });
      const result = await service.create('t-1', dto);
      expect(result.id).toBe('dp-1');
    });

    it('should pass tenantId to create', async () => {
      const dto = {
        dataSourceId: 'ds-1',
        timestamp: '2024-01-01T00:00:00Z',
        dimensions: {},
        metrics: {},
      };
      prisma.dataPoint.create.mockResolvedValue({ id: 'dp-1' });
      await service.create('t-1', dto);
      expect(prisma.dataPoint.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tenantId: 't-1' }),
        }),
      );
    });

    it('should convert timestamp string to Date', async () => {
      const dto = {
        dataSourceId: 'ds-1',
        timestamp: '2024-06-15T12:00:00Z',
        dimensions: {},
        metrics: {},
      };
      prisma.dataPoint.create.mockResolvedValue({ id: 'dp-1' });
      await service.create('t-1', dto);
      const callData = prisma.dataPoint.create.mock.calls[0][0].data;
      expect(callData.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('createMany', () => {
    it('should create multiple data points', async () => {
      const points = [
        { timestamp: new Date(), dimensions: {}, metrics: {} },
        { timestamp: new Date(), dimensions: {}, metrics: {} },
      ];
      prisma.dataPoint.createMany.mockResolvedValue({ count: 2 });
      const result = await service.createMany('t-1', 'ds-1', points);
      expect(result.count).toBe(2);
    });
  });

  describe('query', () => {
    it('should query data points by dataSourceId', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([{ id: 'dp-1' }]);
      const result = await service.query('t-1', { dataSourceId: 'ds-1' });
      expect(result).toHaveLength(1);
    });

    it('should filter by startDate and endDate', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      await service.query('t-1', {
        dataSourceId: 'ds-1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            timestamp: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it('should order results by timestamp ascending', async () => {
      prisma.dataPoint.findMany.mockResolvedValue([]);
      await service.query('t-1', { dataSourceId: 'ds-1' });
      expect(prisma.dataPoint.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { timestamp: 'asc' },
        }),
      );
    });
  });

  describe('count', () => {
    it('should count data points for tenant and data source', async () => {
      prisma.dataPoint.count.mockResolvedValue(42);
      const result = await service.count('t-1', 'ds-1');
      expect(result).toBe(42);
    });
  });
});
