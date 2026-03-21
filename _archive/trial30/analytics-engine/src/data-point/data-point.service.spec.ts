import { describe, it, expect, beforeEach } from 'vitest';
import { DataPointService } from './data-point.service';

function createMockPrisma() {
  return {
    dataPoint: {
      create: async (args: any) => ({ id: 'dp-1', ...args.data }),
      createMany: async (args: any) => ({ count: args.data.length }),
      findMany: async () => [{ id: 'dp-1', timestamp: new Date(), dimensions: {}, metrics: {} }],
      findUniqueOrThrow: async () => ({ id: 'dp-1' }),
      delete: async (args: any) => ({ id: args.where.id }),
      deleteMany: async () => ({ count: 5 }),
    },
  } as any;
}

describe('DataPointService', () => {
  let service: DataPointService;

  beforeEach(() => {
    service = new DataPointService(createMockPrisma());
  });

  it('should create a data point', async () => {
    const result = await service.create({
      dataSourceId: 'ds-1',
      timestamp: '2024-01-01T00:00:00Z',
      dimensions: { page: '/home' },
      metrics: { views: 100 },
    });
    expect(result.dataSourceId).toBe('ds-1');
  });

  it('should create many data points', async () => {
    const result = await service.createMany([
      { dataSourceId: 'ds-1', timestamp: '2024-01-01T00:00:00Z' },
      { dataSourceId: 'ds-1', timestamp: '2024-01-02T00:00:00Z' },
    ]);
    expect(result.count).toBe(2);
  });

  it('should find all data points', async () => {
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should find data points by data source', async () => {
    const result = await service.findAll('ds-1');
    expect(result).toBeDefined();
  });

  it('should find one data point', async () => {
    const result = await service.findOne('dp-1');
    expect(result.id).toBe('dp-1');
  });

  it('should find data points by date range', async () => {
    const result = await service.findByDateRange(
      'ds-1',
      new Date('2024-01-01'),
      new Date('2024-01-31'),
    );
    expect(result).toBeDefined();
  });

  it('should delete a data point', async () => {
    const result = await service.remove('dp-1');
    expect(result.id).toBe('dp-1');
  });

  it('should delete all data points for a data source', async () => {
    const result = await service.removeByDataSource('ds-1');
    expect(result.count).toBe(5);
  });

  it('should create data point with default empty dimensions', async () => {
    const result = await service.create({
      dataSourceId: 'ds-1',
      timestamp: '2024-01-01T00:00:00Z',
    });
    expect(result.dimensions).toEqual({});
  });
});
