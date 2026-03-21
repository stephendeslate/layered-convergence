import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { PipelineRunsController } from './pipeline-runs.controller';
import { PipelineRunsService } from './pipeline-runs.service';

describe('PipelineRunsController', () => {
  let controller: PipelineRunsController;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: vi.fn().mockResolvedValue([]),
      findOne: vi.fn().mockResolvedValue({ id: 'run-1' }),
      create: vi.fn().mockResolvedValue({ id: 'run-1' }),
      complete: vi.fn().mockResolvedValue({ id: 'run-1', status: 'completed' }),
      fail: vi.fn().mockResolvedValue({ id: 'run-1', status: 'failed' }),
      remove: vi.fn().mockResolvedValue({ id: 'run-1' }),
    };

    const module = await Test.createTestingModule({
      controllers: [PipelineRunsController],
      providers: [{ provide: PipelineRunsService, useValue: service }],
    }).compile();

    controller = module.get<PipelineRunsController>(PipelineRunsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should pass pipelineId', async () => {
    await controller.findAll('pipe-1');
    expect(service.findAll).toHaveBeenCalledWith('pipe-1');
  });

  it('create should pass dto', async () => {
    const dto = { pipelineId: 'pipe-1' };
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('complete should pass id and rowsIngested', async () => {
    await controller.complete('run-1', { rowsIngested: 42 });
    expect(service.complete).toHaveBeenCalledWith('run-1', 42);
  });

  it('remove should pass id', async () => {
    await controller.remove('run-1');
    expect(service.remove).toHaveBeenCalledWith('run-1');
  });
});
