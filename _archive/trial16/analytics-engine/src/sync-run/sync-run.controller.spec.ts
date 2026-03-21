import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncRunController } from './sync-run.controller';

describe('SyncRunController', () => {
  let controller: SyncRunController;
  let mockService: any;

  const mockRun = { id: 'run-1', dataSourceId: 'ds-1', status: 'running' };

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue(mockRun),
      findByDataSource: vi.fn().mockResolvedValue([mockRun]),
      findOne: vi.fn().mockResolvedValue(mockRun),
    };
    controller = new SyncRunController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a sync run', async () => {
    const result = await controller.create({ dataSourceId: 'ds-1' });
    expect(result.status).toBe('running');
    expect(mockService.create).toHaveBeenCalledWith('ds-1');
  });

  it('should find runs by data source', async () => {
    const result = await controller.findByDataSource('ds-1');
    expect(result).toHaveLength(1);
  });

  it('should find one run by id', async () => {
    const result = await controller.findOne('run-1');
    expect(result.id).toBe('run-1');
  });
});
