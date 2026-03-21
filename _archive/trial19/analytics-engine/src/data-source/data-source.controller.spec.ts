import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';
import { AuthGuard } from '../auth/auth.guard';

describe('DataSourceController', () => {
  let controller: DataSourceController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  const mockDataSource = {
    id: 'ds-1',
    tenantId: 'tenant-1',
    name: 'Test Source',
    type: 'api',
  };

  beforeEach(async () => {
    service = {
      create: vi.fn().mockResolvedValue(mockDataSource),
      findAll: vi.fn().mockResolvedValue([mockDataSource]),
      findOne: vi.fn().mockResolvedValue(mockDataSource),
      update: vi.fn().mockResolvedValue({ ...mockDataSource, name: 'Updated' }),
      remove: vi.fn().mockResolvedValue(mockDataSource),
    };

    const module = await Test.createTestingModule({
      controllers: [DataSourceController],
      providers: [{ provide: DataSourceService, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DataSourceController>(DataSourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a data source', async () => {
    const result = await controller.create('tenant-1', { name: 'Test Source', type: 'api' });
    expect(result).toEqual(mockDataSource);
    expect(service.create).toHaveBeenCalledWith('tenant-1', { name: 'Test Source', type: 'api' });
  });

  it('should find all data sources', async () => {
    const result = await controller.findAll('tenant-1');
    expect(result).toEqual([mockDataSource]);
    expect(service.findAll).toHaveBeenCalledWith('tenant-1');
  });

  it('should find one data source', async () => {
    const result = await controller.findOne('tenant-1', 'ds-1');
    expect(result).toEqual(mockDataSource);
    expect(service.findOne).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should update a data source', async () => {
    const result = await controller.update('tenant-1', 'ds-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should remove a data source', async () => {
    const result = await controller.remove('tenant-1', 'ds-1');
    expect(result).toEqual(mockDataSource);
    expect(service.remove).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });
});
