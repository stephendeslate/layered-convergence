import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AggregationService } from './aggregation.service';

const mockPrisma = {
  fieldMapping: {
    findMany: vi.fn(),
  },
  dataPoint: {
    findMany: vi.fn(),
  },
  aggregatedDataPoint: {
    upsert: vi.fn(),
  },
};

describe('AggregationService', () => {
  let service: AggregationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AggregationService(mockPrisma as any);
  });

  describe('aggregateDataPoints', () => {
    it('should aggregate data points into time-bucketed summaries', async () => {
      mockPrisma.fieldMapping.findMany.mockResolvedValue([
        { targetField: 'region', fieldRole: 'DIMENSION' },
        { targetField: 'revenue', fieldRole: 'METRIC' },
      ]);

      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          dimensions: { region: 'US' },
          metrics: { revenue: 1500 },
          timestamp: new Date('2026-03-15T10:00:00Z'),
        },
        {
          dimensions: { region: 'US' },
          metrics: { revenue: 2000 },
          timestamp: new Date('2026-03-15T14:00:00Z'),
        },
        {
          dimensions: { region: 'EU' },
          metrics: { revenue: 800 },
          timestamp: new Date('2026-03-15T12:00:00Z'),
        },
      ]);

      mockPrisma.aggregatedDataPoint.upsert.mockResolvedValue({});

      await service.aggregateDataPoints('ds-1', 'tenant-1', {
        from: new Date('2026-03-15'),
        to: new Date('2026-03-16'),
      });

      // Should upsert for each period x dimension x metric combination
      expect(mockPrisma.aggregatedDataPoint.upsert).toHaveBeenCalled();
      const calls = mockPrisma.aggregatedDataPoint.upsert.mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      // Check that SUM/AVG/MIN/MAX/COUNT values are computed
      const firstCall = calls[0][0];
      expect(firstCall.create).toHaveProperty('sumValue');
      expect(firstCall.create).toHaveProperty('avgValue');
      expect(firstCall.create).toHaveProperty('countValue');
      expect(firstCall.create).toHaveProperty('minValue');
      expect(firstCall.create).toHaveProperty('maxValue');
    });

    it('should skip when no metric fields exist', async () => {
      mockPrisma.fieldMapping.findMany.mockResolvedValue([
        { targetField: 'region', fieldRole: 'DIMENSION' },
      ]);

      await service.aggregateDataPoints('ds-1', 'tenant-1', {
        from: new Date(),
        to: new Date(),
      });

      expect(mockPrisma.dataPoint.findMany).not.toHaveBeenCalled();
    });

    it('should skip when no data points in range', async () => {
      mockPrisma.fieldMapping.findMany.mockResolvedValue([
        { targetField: 'revenue', fieldRole: 'METRIC' },
      ]);
      mockPrisma.dataPoint.findMany.mockResolvedValue([]);

      await service.aggregateDataPoints('ds-1', 'tenant-1', {
        from: new Date(),
        to: new Date(),
      });

      expect(mockPrisma.aggregatedDataPoint.upsert).not.toHaveBeenCalled();
    });

    it('should correctly compute aggregation values', async () => {
      mockPrisma.fieldMapping.findMany.mockResolvedValue([
        { targetField: 'revenue', fieldRole: 'METRIC' },
      ]);

      mockPrisma.dataPoint.findMany.mockResolvedValue([
        {
          dimensions: {},
          metrics: { revenue: 100 },
          timestamp: new Date('2026-03-15T10:00:00Z'),
        },
        {
          dimensions: {},
          metrics: { revenue: 200 },
          timestamp: new Date('2026-03-15T11:00:00Z'),
        },
        {
          dimensions: {},
          metrics: { revenue: 300 },
          timestamp: new Date('2026-03-15T12:00:00Z'),
        },
      ]);

      mockPrisma.aggregatedDataPoint.upsert.mockResolvedValue({});

      await service.aggregateDataPoints('ds-1', 'tenant-1', {
        from: new Date('2026-03-15'),
        to: new Date('2026-03-16'),
      });

      // Find the DAILY aggregation call (all 3 records in same day)
      const dailyCalls = mockPrisma.aggregatedDataPoint.upsert.mock.calls.filter(
        (call: any) => call[0].create.period === 'DAILY',
      );
      expect(dailyCalls.length).toBeGreaterThan(0);

      const dailyCreate = dailyCalls[0][0].create;
      expect(dailyCreate.sumValue).toBe(600);
      expect(dailyCreate.avgValue).toBe(200);
      expect(dailyCreate.countValue).toBe(3);
      expect(dailyCreate.minValue).toBe(100);
      expect(dailyCreate.maxValue).toBe(300);
    });
  });

  describe('truncateToPeriod', () => {
    it('should truncate to hour', () => {
      const date = new Date('2026-03-15T14:35:22Z');
      const result = service.truncateToPeriod(date, 'HOURLY');
      expect(result.toISOString()).toBe('2026-03-15T14:00:00.000Z');
    });

    it('should truncate to day', () => {
      const date = new Date('2026-03-15T14:35:22Z');
      const result = service.truncateToPeriod(date, 'DAILY');
      expect(result.toISOString()).toBe('2026-03-15T00:00:00.000Z');
    });

    it('should truncate to Monday of the week', () => {
      // March 15, 2026 is a Sunday
      const date = new Date('2026-03-15T14:35:22Z');
      const result = service.truncateToPeriod(date, 'WEEKLY');
      expect(result.toISOString()).toBe('2026-03-09T00:00:00.000Z');
    });

    it('should truncate to first of month', () => {
      const date = new Date('2026-03-15T14:35:22Z');
      const result = service.truncateToPeriod(date, 'MONTHLY');
      expect(result.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    });
  });

  describe('buildDimensionKey', () => {
    it('should build sorted key from dimension fields', () => {
      const key = service.buildDimensionKey(
        { region: 'US', product: 'Widget A' },
        [{ targetField: 'product' }, { targetField: 'region' }],
      );
      expect(key).toBe('product=Widget A|region=US');
    });

    it('should handle null dimension values', () => {
      const key = service.buildDimensionKey(
        { region: 'US' },
        [{ targetField: 'product' }, { targetField: 'region' }],
      );
      expect(key).toBe('product=NULL|region=US');
    });
  });
});
