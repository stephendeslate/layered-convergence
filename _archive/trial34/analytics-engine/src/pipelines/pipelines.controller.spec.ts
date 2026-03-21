import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { PipelinesController } from './pipelines.controller';
import { PipelinesService } from './pipelines.service';

describe('PipelinesController', () => {
  let controller: PipelinesController;
  let service: any;

  const mockReq = { user: { organizationId: 'org-1' } };

  beforeEach(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'pipe-1' }),
      create: vi.fn().mockResolvedValue({ id: 'pipe-1' }),
      update: vi.fn().mockResolvedValue({ id: 'pipe-1' }),
      transition: vi.fn().mockResolvedValue({ id: 'pipe-1', status: 'ACTIVE' }),
      remove: vi.fn().mockResolvedValue({ id: 'pipe-1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [PipelinesController],
      providers: [{ provide: PipelinesService, useValue: service }],
    }).compile();

    controller = module.get<PipelinesController>(PipelinesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should use orgId from request', async () => {
    await controller.findAll(mockReq);
    expect(service.findAll).toHaveBeenCalledWith('org-1');
  });

  it('create should pass dto and orgId', async () => {
    const dto = { name: 'Pipeline' };
    await controller.create(dto, mockReq);
    expect(service.create).toHaveBeenCalledWith(dto, 'org-1');
  });

  it('transition should pass id and status', async () => {
    await controller.transition('pipe-1', { status: 'ACTIVE' as any });
    expect(service.transition).toHaveBeenCalledWith('pipe-1', 'ACTIVE');
  });

  it('remove should pass id', async () => {
    await controller.remove('pipe-1');
    expect(service.remove).toHaveBeenCalledWith('pipe-1');
  });
});
