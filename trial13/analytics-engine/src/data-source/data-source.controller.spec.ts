import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSourceController } from './data-source.controller';

describe('DataSourceController', () => {
  let controller: DataSourceController;
  let mockService: any;

  const mockDataSource = {
    id: 'ds-1',
    tenantId: 'tenant-1',
    name: 'API Source',
    type: 'api',
  };

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue(mockDataSource),
      findAll: vi.fn().mockResolvedValue([mockDataSource]),
      findOne: vi.fn().mockResolvedValue(mockDataSource),
      update: vi.fn().mockResolvedValue({ ...mockDataSource, name: 'Updated' }),
      remove: vi.fn().mockResolvedValue(mockDataSource),
    };
    controller = new DataSourceController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a data source', async () => {
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.create(req, { name: 'API Source', type: 'api' });
    expect(result).toEqual(mockDataSource);
    expect(mockService.create).toHaveBeenCalledWith('tenant-1', { name: 'API Source', type: 'api' });
  });

  it('should find all data sources', async () => {
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.findAll(req);
    expect(result).toHaveLength(1);
  });

  it('should find one data source', async () => {
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.findOne(req, 'ds-1');
    expect(result).toEqual(mockDataSource);
  });

  it('should update a data source', async () => {
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.update(req, 'ds-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should remove a data source', async () => {
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.remove(req, 'ds-1');
    expect(result).toEqual(mockDataSource);
  });
});
