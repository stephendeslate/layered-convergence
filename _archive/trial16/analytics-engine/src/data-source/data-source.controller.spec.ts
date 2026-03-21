import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSourceController } from './data-source.controller';

describe('DataSourceController', () => {
  let controller: DataSourceController;
  let mockService: any;

  const mockReq = { tenantId: 'tenant-1' } as any;
  const mockDs = { id: 'ds-1', tenantId: 'tenant-1', name: 'Test', type: 'api' };

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue(mockDs),
      findAll: vi.fn().mockResolvedValue([mockDs]),
      findOne: vi.fn().mockResolvedValue(mockDs),
      update: vi.fn().mockResolvedValue({ ...mockDs, name: 'Updated' }),
      remove: vi.fn().mockResolvedValue(mockDs),
    };
    controller = new DataSourceController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a data source', async () => {
    const result = await controller.create(mockReq, { name: 'Test', type: 'api' });
    expect(result).toEqual(mockDs);
    expect(mockService.create).toHaveBeenCalledWith('tenant-1', { name: 'Test', type: 'api' });
  });

  it('should find all data sources', async () => {
    const result = await controller.findAll(mockReq);
    expect(result).toHaveLength(1);
    expect(mockService.findAll).toHaveBeenCalledWith('tenant-1');
  });

  it('should find one data source', async () => {
    const result = await controller.findOne(mockReq, 'ds-1');
    expect(result.id).toBe('ds-1');
    expect(mockService.findOne).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should update a data source', async () => {
    const result = await controller.update(mockReq, 'ds-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
    expect(mockService.update).toHaveBeenCalledWith('tenant-1', 'ds-1', { name: 'Updated' });
  });

  it('should delete a data source', async () => {
    const result = await controller.remove(mockReq, 'ds-1');
    expect(result).toEqual(mockDs);
    expect(mockService.remove).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });
});
