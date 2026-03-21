import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncRunController } from './sync-run.controller';

describe('SyncRunController', () => {
  let controller: SyncRunController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      findByDataSource: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'run-1', status: 'running' }),
    };
    controller = new SyncRunController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should find runs by data source', async () => {
    await controller.findByDataSource('ds-1');
    expect(mockService.findByDataSource).toHaveBeenCalledWith('ds-1');
  });

  it('should find one run by id', async () => {
    const result = await controller.findOne('run-1');
    expect(result.id).toBe('run-1');
    expect(mockService.findOne).toHaveBeenCalledWith('run-1');
  });

  it('should return the service result', async () => {
    mockService.findByDataSource.mockResolvedValue([{ id: 'run-1' }, { id: 'run-2' }]);
    const result = await controller.findByDataSource('ds-1');
    expect(result).toHaveLength(2);
  });
});
