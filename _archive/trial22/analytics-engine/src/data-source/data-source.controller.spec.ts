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
      create: vi.fn().mockResolvedValue({ id: 'ds-1' }),
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'ds-1' }),
      update: vi.fn().mockResolvedValue({ id: 'ds-1' }),
      remove: vi.fn().mockResolvedValue({ id: 'ds-1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [DataSourceController],
      providers: [
        { provide: DataSourceService, useValue: service },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DataSourceController>(DataSourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create with tenantId and dto', async () => {
    await controller.create('t-1', { name: 'DS', type: 'api' });
    expect(service.create).toHaveBeenCalledWith('t-1', { name: 'DS', type: 'api' });
  });

  it('should call service.findAll with tenantId', async () => {
    await controller.findAll('t-1');
    expect(service.findAll).toHaveBeenCalledWith('t-1');
  });

  it('should call service.findOne with tenantId and id', async () => {
    await controller.findOne('t-1', 'ds-1');
    expect(service.findOne).toHaveBeenCalledWith('t-1', 'ds-1');
  });

  it('should call service.update with tenantId, id, and dto', async () => {
    await controller.update('t-1', 'ds-1', { name: 'Updated' });
    expect(service.update).toHaveBeenCalledWith('t-1', 'ds-1', { name: 'Updated' });
  });

  it('should call service.remove with tenantId and id', async () => {
    await controller.remove('t-1', 'ds-1');
    expect(service.remove).toHaveBeenCalledWith('t-1', 'ds-1');
  });
});
