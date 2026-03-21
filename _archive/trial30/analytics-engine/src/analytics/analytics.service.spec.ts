import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService } from './analytics.service';

function createMockPrisma() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return {
    dataPoint: {
      findMany: async () => [
        { id: 'dp-1', timestamp: yesterday, dimensions: { page: '/home' }, metrics: { views: 100, clicks: 20 } },
        { id: 'dp-2', timestamp: now, dimensions: { page: '/about' }, metrics: { views: 50, clicks: 10 } },
      ],
    },
  } as any;
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    service = new AnalyticsService(createMockPrisma());
  });

  it('should query analytics with default granularity', async () => {
    const result = await service.query({ dataSourceId: 'ds-1' });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should query analytics with hourly granularity', async () => {
    const result = await service.query({ dataSourceId: 'ds-1', granularity: 'hour' });
    expect(result).toBeDefined();
  });

  it('should query analytics with daily granularity', async () => {
    const result = await service.query({ dataSourceId: 'ds-1', granularity: 'day' });
    expect(result).toBeDefined();
  });

  it('should query analytics with weekly granularity', async () => {
    const result = await service.query({ dataSourceId: 'ds-1', granularity: 'week' });
    expect(result).toBeDefined();
  });

  it('should query analytics with monthly granularity', async () => {
    const result = await service.query({ dataSourceId: 'ds-1', granularity: 'month' });
    expect(result).toBeDefined();
  });

  it('should query analytics with date range', async () => {
    const result = await service.query({
      dataSourceId: 'ds-1',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });
    expect(result).toBeDefined();
  });

  it('should aggregate metrics correctly', async () => {
    const result = await service.query({ dataSourceId: 'ds-1', granularity: 'month' });
    const totalViews = result.reduce((sum, r) => sum + (r.metrics.views || 0), 0);
    expect(totalViews).toBe(150);
  });

  it('should get KPI for a data source', async () => {
    const result = await service.getKpi('ds-1');
    expect(result.dataSourceId).toBe('ds-1');
    expect(result.period).toBe('30d');
    expect(result.totalDataPoints).toBe(2);
  });

  it('should return aggregated results with period keys', async () => {
    const result = await service.query({ dataSourceId: 'ds-1', granularity: 'day' });
    for (const item of result) {
      expect(item.period).toBeDefined();
      expect(item.metrics).toBeDefined();
    }
  });
});
