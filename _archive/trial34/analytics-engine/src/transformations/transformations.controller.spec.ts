import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { TransformationsController } from './transformations.controller';
import { TransformationsService } from './transformations.service';

describe('TransformationsController', () => {
  let controller: TransformationsController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'tr-1' }),
      create: vi.fn().mockResolvedValue({ id: 'tr-1' }),
      update: vi.fn().mockResolvedValue({ id: 'tr-1' }),
      remove: vi.fn().mockResolvedValue({ id: 'tr-1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [TransformationsController],
      providers: [{ provide: TransformationsService, useValue: service }],
    }).compile();

    controller = module.get<TransformationsController>(TransformationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should pass dataSourceId', async () => {
    await controller.findAll('ds-1');
    expect(service.findAll).toHaveBeenCalledWith('ds-1');
  });

  it('create should pass dto', async () => {
    const dto = { name: 'New', type: 'cast', dataSourceId: 'ds-1' };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('remove should pass id', async () => {
    await controller.remove('tr-1');
    expect(service.remove).toHaveBeenCalledWith('tr-1');
  });
});
