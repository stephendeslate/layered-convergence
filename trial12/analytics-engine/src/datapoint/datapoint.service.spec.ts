import { DataPointService } from './datapoint.service.js';

describe('DataPointService', () => {
  let service: DataPointService;
  let mockPrisma: any;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockPrisma = {
      dataPoint: {
        create: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
      },
    };
    service = new DataPointService(mockPrisma);
  });

  describe('create', () => {
    it('should create a data point', async () => {
      mockPrisma.dataPoint.create.mockResolvedValue({ id: '1' });
      const result = await service.create(tenantId, {
        dataSourceId: 'ds1',
        timestamp: '2024-01-01T00:00:00Z',
        dimensions: { region: 'US' },
        metrics: { value: 42 },
      });
      expect(result).toBeDefined();
    });
  });

  describe('createMany', () => {
    it('should create multiple data points', async () => {
      mockPrisma.dataPoint.createMany.mockResolvedValue({ count: 2 });
      const result = await service.createMany(tenantId, 'ds1', [
        {
          timestamp: new Date(),
          dimensions: { region: 'US' },
          metrics: { value: 1 },
        },
        {
          timestamp: new Date(),
          dimensions: { region: 'EU' },
          metrics: { value: 2 },
        },
      ]);
      expect(result.count).toBe(2);
    });
  });

  describe('query', () => {
    it('should return data points with filters', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { id: '1', metrics: { value: 10 }, dimensions: {} },
      ]);
      const result = await service.query(tenantId, { dataSourceId: 'ds1' });
      expect(result).toHaveLength(1);
    });

    it('should aggregate with sum', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metrics: { value: 10 }, dimensions: {} },
        { metrics: { value: 20 }, dimensions: {} },
      ]);
      const result = await service.query(tenantId, {
        aggregation: 'sum',
      });
      expect((result as Record<string, number>).value).toBe(30);
    });

    it('should aggregate with avg', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metrics: { value: 10 }, dimensions: {} },
        { metrics: { value: 20 }, dimensions: {} },
      ]);
      const result = await service.query(tenantId, {
        aggregation: 'avg',
      });
      expect((result as Record<string, number>).value).toBe(15);
    });

    it('should group by dimension', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metrics: { value: 10 }, dimensions: { region: 'US' } },
        { metrics: { value: 20 }, dimensions: { region: 'EU' } },
        { metrics: { value: 5 }, dimensions: { region: 'US' } },
      ]);
      const result = await service.query(tenantId, {
        aggregation: 'sum',
        groupBy: 'region',
      });
      expect((result as any).US.value).toBe(15);
      expect((result as any).EU.value).toBe(20);
    });
  });
});
