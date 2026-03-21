import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { AuthGuard } from '../auth/auth.guard';

describe('PipelineController', () => {
  let controller: PipelineController;
  let service: {
    create: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    findByDataSourceId: ReturnType<typeof vi.fn>;
    transition: ReturnType<typeof vi.fn>;
    getValidTransitions: ReturnType<typeof vi.fn>;
    getStateHistory: ReturnType<typeof vi.fn>;
  };

  const mockPipeline = {
    id: 'pipe-1',
    dataSourceId: 'ds-1',
    status: 'IDLE',
  };

  beforeEach(async () => {
    service = {
      create: vi.fn().mockResolvedValue(mockPipeline),
      findOne: vi.fn().mockResolvedValue(mockPipeline),
      findByDataSourceId: vi.fn().mockResolvedValue(mockPipeline),
      transition: vi.fn().mockResolvedValue({ ...mockPipeline, status: 'RUNNING' }),
      getValidTransitions: vi.fn().mockResolvedValue(['RUNNING']),
      getStateHistory: vi.fn().mockResolvedValue([]),
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
    expect(result).toEqual(mockPipeline);
  });

  it('should find one pipeline', async () => {
    const result = await controller.findOne('pipe-1');
    expect(result).toEqual(mockPipeline);
  });

  it('should find pipeline by data source id', async () => {
    const result = await controller.findByDataSourceId('ds-1');
    expect(result).toEqual(mockPipeline);
  });

  it('should transition pipeline', async () => {
    const result = await controller.transition('pipe-1', { status: 'RUNNING' as any });
    expect(result.status).toBe('RUNNING');
  });

  it('should get valid transitions', async () => {
    const result = await controller.getValidTransitions('pipe-1');
    expect(result).toEqual(['RUNNING']);
  });

  it('should get state history', async () => {
    const result = await controller.getStateHistory('pipe-1');
    expect(result).toEqual([]);
    expect(service.getStateHistory).toHaveBeenCalledWith('pipe-1');
  });
});
