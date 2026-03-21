import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSourceController } from './data-source.controller';

describe('DataSourceController', () => {
  let controller: DataSourceController;
  let mockService: any;

  const mockReq = { tenantId: 'tenant-1' } as any;

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue({ id: 'ds-1', name: 'Test', type: 'api' }),
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'ds-1' }),
      update: vi.fn().mockResolvedValue({ id: 'ds-1', name: 'Updated' }),
      remove: vi.fn().mockResolvedValue({ id: 'ds-1' }),
    };
    controller = new DataSourceController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a data source', async () => {
    const result = await controller.create(mockReq, { name: 'Test', type: 'api' });
    expect(result.id).toBe('ds-1');
    expect(mockService.create).toHaveBeenCalledWith('tenant-1', { name: 'Test', type: 'api' });
  });

  it('should find all data sources', async () => {
    await controller.findAll(mockReq);
    expect(mockService.findAll).toHaveBeenCalledWith('tenant-1');
  });

  it('should find one data source', async () => {
    await controller.findOne(mockReq, 'ds-1');
    expect(mockService.findOne).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should update a data source', async () => {
    await controller.update(mockReq, 'ds-1', { name: 'Updated' });
    expect(mockService.update).toHaveBeenCalledWith('tenant-1', 'ds-1', { name: 'Updated' });
  });

  it('should remove a data source', async () => {
    await controller.remove(mockReq, 'ds-1');
    expect(mockService.remove).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });
});
