import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSourceConfigController } from './data-source-config.controller';

describe('DataSourceConfigController', () => {
  let controller: DataSourceConfigController;
  let mockService: any;

  const mockConfig = {
    id: 'cfg-1',
    dataSourceId: 'ds-1',
    connectionConfig: {},
    fieldMapping: {},
    transformSteps: [],
    syncSchedule: null,
  };

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue(mockConfig),
      findByDataSource: vi.fn().mockResolvedValue(mockConfig),
      update: vi.fn().mockResolvedValue(mockConfig),
      remove: vi.fn().mockResolvedValue(mockConfig),
    };
    controller = new DataSourceConfigController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a config', async () => {
    const result = await controller.create({ dataSourceId: 'ds-1' });
    expect(result).toEqual(mockConfig);
  });

  it('should find config by data source', async () => {
    const result = await controller.findByDataSource('ds-1');
    expect(result).toEqual(mockConfig);
  });

  it('should update a config', async () => {
    const result = await controller.update('ds-1', { syncSchedule: '0 * * * *' });
    expect(result).toEqual(mockConfig);
  });

  it('should remove a config', async () => {
    const result = await controller.remove('ds-1');
    expect(result).toEqual(mockConfig);
  });
});
