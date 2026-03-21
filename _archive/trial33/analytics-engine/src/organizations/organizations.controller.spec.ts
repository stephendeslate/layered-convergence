import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'org-1' }),
      create: vi.fn().mockResolvedValue({ id: 'org-1' }),
      update: vi.fn().mockResolvedValue({ id: 'org-1' }),
      remove: vi.fn().mockResolvedValue({ id: 'org-1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [{ provide: OrganizationsService, useValue: service }],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should call service.findAll', async () => {
    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne should pass id', async () => {
    await controller.findOne('org-1');
    expect(service.findOne).toHaveBeenCalledWith('org-1');
  });

  it('create should pass dto', async () => {
    const dto = { name: 'Org', slug: 'org' };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('update should pass id and dto', async () => {
    await controller.update('org-1', { name: 'Updated' });
    expect(service.update).toHaveBeenCalledWith('org-1', { name: 'Updated' });
  });

  it('remove should pass id', async () => {
    await controller.remove('org-1');
    expect(service.remove).toHaveBeenCalledWith('org-1');
  });
});
