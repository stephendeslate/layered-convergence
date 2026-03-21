import { AnalyticsService } from './analytics.service';

const mockPrisma = {
  dataPoint: {
    findMany: vi.fn(),
  },
};

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('query', () => {
    it('should query data points by dataSourceId', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      const result = await service.query({ dataSourceId: 'ds1' });
      expect(result).toEqual([]);
      expect(mockPrisma.dataPoint.findMany).toHaveBeenCalledWith({
        where: { dataSourceId: 'ds1' },
        orderBy: { timestamp: 'asc' },
      });
    });

    it('should filter by date range', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      await service.query({
        dataSourceId: 'ds1',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });
      const call = mockPrisma.dataPoint.findMany.mock.calls[0][0];
      expect(call.where.timestamp.gte).toBeInstanceOf(Date);
      expect(call.where.timestamp.lte).toBeInstanceOf(Date);
    });

    it('should aggregate by day by default', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { timestamp: new Date('2024-01-01T10:00:00Z'), metrics: { views: 10 }, dimensions: {} },
        { timestamp: new Date('2024-01-01T14:00:00Z'), metrics: { views: 20 }, dimensions: {} },
        { timestamp: new Date('2024-01-02T10:00:00Z'), metrics: { views: 30 }, dimensions: {} },
      ]);
      const result = await service.query({ dataSourceId: 'ds1' });
      expect(result).toHaveLength(2);
      expect(result[0].metrics.views).toBe(30);
      expect(result[1].metrics.views).toBe(30);
    });

    it('should aggregate by hour', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { timestamp: new Date('2024-01-01T10:15:00Z'), metrics: { views: 10 }, dimensions: {} },
        { timestamp: new Date('2024-01-01T10:45:00Z'), metrics: { views: 20 }, dimensions: {} },
      ]);
      const result = await service.query({ dataSourceId: 'ds1', granularity: 'hour' });
      expect(result).toHaveLength(1);
      expect(result[0].metrics.views).toBe(30);
    });

    it('should aggregate by month', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { timestamp: new Date('2024-01-15'), metrics: { views: 10 }, dimensions: {} },
        { timestamp: new Date('2024-01-20'), metrics: { views: 20 }, dimensions: {} },
      ]);
      const result = await service.query({ dataSourceId: 'ds1', granularity: 'month' });
      expect(result).toHaveLength(1);
      expect(result[0].period).toBe('2024-01');
    });

    it('should aggregate by week', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { timestamp: new Date('2024-01-01'), metrics: { views: 5 }, dimensions: {} },
        { timestamp: new Date('2024-01-02'), metrics: { views: 15 }, dimensions: {} },
      ]);
      const result = await service.query({ dataSourceId: 'ds1', granularity: 'week' });
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should skip non-numeric metric values', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { timestamp: new Date('2024-01-01'), metrics: { views: 10, label: 'test' }, dimensions: {} },
      ]);
      const result = await service.query({ dataSourceId: 'ds1' });
      expect(result[0].metrics.views).toBe(10);
      expect(result[0].metrics.label).toBeUndefined();
    });
  });

  describe('getKpi', () => {
    it('should return KPI data for last 30 days', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([
        { metrics: { views: 100, clicks: 50 } },
        { metrics: { views: 200, clicks: 75 } },
      ]);
      const result = await service.getKpi('ds1');
      expect(result.dataSourceId).toBe('ds1');
      expect(result.period).toBe('30d');
      expect(result.totalDataPoints).toBe(2);
      expect(result.metrics.views).toBe(300);
      expect(result.metrics.clicks).toBe(125);
    });

    it('should return empty metrics when no data points', async () => {
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);
      const result = await service.getKpi('ds1');
      expect(result.totalDataPoints).toBe(0);
      expect(result.metrics).toEqual({});
    });
  });
});
