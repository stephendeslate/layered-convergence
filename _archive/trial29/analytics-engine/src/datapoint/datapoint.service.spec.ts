import { Test } from '@nestjs/testing';
import { DataPointService } from './datapoint.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  dataPoint: {
    create: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn(),
  },
};

describe('DataPointService', () => {
  let service: DataPointService;
  const tenantId = 'tenant-uuid-1';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DataPointService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(DataPointService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a data point', async () => {
      const dto = {
        dataSourceId: 'ds1',
        timestamp: '2025-01-01T00:00:00Z',
        dimensions: { region: 'us' },
        metrics: { revenue: 100 },
      };
      mockPrisma.dataPoint.create.mockResolvedValue({ id: 'dp1', ...dto });

      const result = await service.create(tenantId, dto);
      expect(mockPrisma.dataPoint.create).toHaveBeenCalledWith({
        data: {
          tenantId,
          dataSourceId: 'ds1',
          timestamp: expect.any(Date),
          dimensions: { region: 'us' },
          metrics: { revenue: 100 },
        },
      });
      expect(result).toBeDefined();
    });
  });

  describe('createMany', () => {
    it('should create multiple data points', async () => {
      const points = [
        {
          timestamp: new Date(),
          dimensions: { region: 'us' },
          metrics: { revenue: 100 },
        },
        {
          timestamp: new Date(),
          dimensions: { region: 'eu' },
          metrics: { revenue: 200 },
        },
      ];
      mockPrisma.dataPoint.createMany.mockResolvedValue({ count: 2 });

      const result = await service.createMany(tenantId, 'ds1', points);
      expect(result.count).toBe(2);
    });
  });

  describe('query', () => {
    it('should query data points by tenant', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([{ id: 'dp1' }]);

      const result = await service.query(tenantId, {});
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        orderBy: { timestamp: 'asc' },
      });
      expect(result).toHaveLength(1);
    });

    it('should filter by dataSourceId', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);

      await service.query(tenantId, { dataSourceId: 'ds1' });
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: { tenantId, dataSourceId: 'ds1' },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should filter by date range', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);

      await service.query(tenantId, {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: {
          tenantId,
          timestamp: {
            gte: expect.any(Date),
            lte: expect.any(Date),
          },
        },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should compute sum aggregation', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { id: 'dp1', metrics: { revenue: 100 }, dimensions: {} },
        { id: 'dp2', metrics: { revenue: 200 }, dimensions: {} },
      ]);

      const result = await service.query(tenantId, { aggregation: 'sum' });
      expect(result).toEqual({ revenue: 300 });
    });

    it('should compute avg aggregation', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { id: 'dp1', metrics: { revenue: 100 }, dimensions: {} },
        { id: 'dp2', metrics: { revenue: 200 }, dimensions: {} },
      ]);

      const result = await service.query(tenantId, { aggregation: 'avg' });
      expect(result).toEqual({ revenue: 150 });
    });

    it('should compute count aggregation', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { id: 'dp1', metrics: { revenue: 100 }, dimensions: {} },
        { id: 'dp2', metrics: { revenue: 200 }, dimensions: {} },
      ]);

      const result = await service.query(tenantId, { aggregation: 'count' });
      expect(result).toEqual({ revenue: 2 });
    });

    it('should compute min aggregation', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { id: 'dp1', metrics: { revenue: 100 }, dimensions: {} },
        { id: 'dp2', metrics: { revenue: 200 }, dimensions: {} },
      ]);

      const result = await service.query(tenantId, { aggregation: 'min' });
      expect(result).toEqual({ revenue: 100 });
    });

    it('should compute max aggregation', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { id: 'dp1', metrics: { revenue: 100 }, dimensions: {} },
        { id: 'dp2', metrics: { revenue: 200 }, dimensions: {} },
      ]);

      const result = await service.query(tenantId, { aggregation: 'max' });
      expect(result).toEqual({ revenue: 200 });
    });

    it('should group by dimension when specified', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { id: 'dp1', metrics: { revenue: 100 }, dimensions: { region: 'us' } },
        { id: 'dp2', metrics: { revenue: 200 }, dimensions: { region: 'eu' } },
        { id: 'dp3', metrics: { revenue: 150 }, dimensions: { region: 'us' } },
      ]);

      const result = await service.query(tenantId, {
        aggregation: 'sum',
        groupBy: 'region',
      });
      expect(result).toEqual({
        us: { revenue: 250 },
        eu: { revenue: 200 },
      });
    });
  });
});
