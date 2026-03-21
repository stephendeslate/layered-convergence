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

  beforeEach(async () => {
    service = {
      create: vi.fn().mockResolvedValue({ id: 'ds-1', name: 'DS', type: 'api' }),
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'ds-1', name: 'DS', type: 'api' }),
      update: vi.fn().mockResolvedValue({ id: 'ds-1', name: 'Updated' }),
      remove: vi.fn().mockResolvedValue({ id: 'ds-1' }),
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
    const result = await controller.create('t-1', { name: 'DS', type: 'api' });
    expect(result.id).toBe('ds-1');
    expect(service.create).toHaveBeenCalledWith('t-1', { name: 'DS', type: 'api' });
  });

  it('should find all data sources', async () => {
    await controller.findAll('t-1');
    expect(service.findAll).toHaveBeenCalledWith('t-1');
  });

  it('should find one data source', async () => {
    await controller.findOne('t-1', 'ds-1');
    expect(service.findOne).toHaveBeenCalledWith('t-1', 'ds-1');
  });

  it('should update a data source', async () => {
    await controller.update('t-1', 'ds-1', { name: 'Updated' });
    expect(service.update).toHaveBeenCalledWith('t-1', 'ds-1', { name: 'Updated' });
  });

  it('should remove a data source', async () => {
    await controller.remove('t-1', 'ds-1');
    expect(service.remove).toHaveBeenCalledWith('t-1', 'ds-1');
  });

  it('should pass tenantId to create', async () => {
    await controller.create('tenant-abc', { name: 'X', type: 'csv' });
    expect(service.create).toHaveBeenCalledWith('tenant-abc', { name: 'X', type: 'csv' });
  });

  it('should pass tenantId to findOne', async () => {
    await controller.findOne('tenant-abc', 'ds-99');
    expect(service.findOne).toHaveBeenCalledWith('tenant-abc', 'ds-99');
  });
});
