import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { AuthGuard } from '../auth/auth.guard';
import { PipelineStatus } from '@prisma/client';

describe('PipelineController', () => {
  let controller: PipelineController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findByDataSourceId: ReturnType<typeof vi.fn>;
    transition: ReturnType<typeof vi.fn>;
    getValidTransitions: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      create: vi.fn().mockResolvedValue({ id: 'pipe-1', status: 'IDLE' }),
      findOne: vi.fn().mockResolvedValue({ id: 'pipe-1', status: 'IDLE' }),
      findByDataSourceId: vi.fn().mockResolvedValue({ id: 'pipe-1' }),
      transition: vi.fn().mockResolvedValue({ id: 'pipe-1', status: 'RUNNING' }),
      getValidTransitions: vi.fn().mockResolvedValue([PipelineStatus.RUNNING]),
    };

    const module = await Test.createTestingModule({
      controllers: [PipelineController],
      providers: [{ provide: PipelineService, useValue: service }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PipelineController>(PipelineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a pipeline', async () => {
    const result = await controller.create({ dataSourceId: 'ds-1' });
    expect(result.id).toBe('pipe-1');
  });

  it('should find one pipeline', async () => {
    const result = await controller.findOne('pipe-1');
    expect(result.id).toBe('pipe-1');
  });

  it('should find pipeline by data source id', async () => {
    const result = await controller.findByDataSourceId('ds-1');
    expect(result.id).toBe('pipe-1');
  });

  it('should transition a pipeline', async () => {
    const result = await controller.transition('pipe-1', {
      status: PipelineStatus.RUNNING,
    });
    expect(result.status).toBe('RUNNING');
  });

  it('should get valid transitions', async () => {
    const result = await controller.getValidTransitions('pipe-1');
    expect(result).toEqual([PipelineStatus.RUNNING]);
  });
});
