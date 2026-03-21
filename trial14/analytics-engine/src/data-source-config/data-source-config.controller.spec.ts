import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSourceConfigController } from './data-source-config.controller';

describe('DataSourceConfigController', () => {
  let controller: DataSourceConfigController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue({ id: 'cfg-1', dataSourceId: 'ds-1' }),
      findByDataSource: vi.fn().mockResolvedValue({ id: 'cfg-1' }),
      update: vi.fn().mockResolvedValue({ id: 'cfg-1' }),
      remove: vi.fn().mockResolvedValue({ id: 'cfg-1' }),
    };
    controller = new DataSourceConfigController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a config', async () => {
    const result = await controller.create({ dataSourceId: 'ds-1' });
    expect(result.dataSourceId).toBe('ds-1');
  });

  it('should find config by data source', async () => {
    await controller.findByDataSource('ds-1');
    expect(mockService.findByDataSource).toHaveBeenCalledWith('ds-1');
  });

  it('should update a config', async () => {
    await controller.update('ds-1', { syncSchedule: '0 * * * *' });
    expect(mockService.update).toHaveBeenCalledWith('ds-1', { syncSchedule: '0 * * * *' });
  });

  it('should remove a config', async () => {
    await controller.remove('ds-1');
    expect(mockService.remove).toHaveBeenCalledWith('ds-1');
  });
});
