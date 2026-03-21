import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { DataSourcesController } from './data-sources.controller';
import { DataSourcesService } from './data-sources.service';

describe('DataSourcesController', () => {
  let controller: DataSourcesController;
  let service: any;

  const mockReq = { user: { organizationId: 'org-1' } };

  beforeEach(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'ds-1' }),
      create: vi.fn().mockResolvedValue({ id: 'ds-1' }),
      update: vi.fn().mockResolvedValue({ id: 'ds-1' }),
      remove: vi.fn().mockResolvedValue({ id: 'ds-1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [DataSourcesController],
      providers: [{ provide: DataSourcesService, useValue: service }],
    }).compile();

    controller = module.get<DataSourcesController>(DataSourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should use orgId from request', async () => {
    await controller.findAll(mockReq);
    expect(service.findAll).toHaveBeenCalledWith('org-1');
  });

  it('create should pass dto and orgId', async () => {
    const dto = { name: 'DS', type: 'api' };
    await controller.create(dto, mockReq);
    expect(service.create).toHaveBeenCalledWith(dto, 'org-1');
  });

  it('update should pass id and dto', async () => {
    await controller.update('ds-1', { name: 'Updated' });
    expect(service.update).toHaveBeenCalledWith('ds-1', { name: 'Updated' });
  });

  it('remove should pass id', async () => {
    await controller.remove('ds-1');
    expect(service.remove).toHaveBeenCalledWith('ds-1');
  });
});
