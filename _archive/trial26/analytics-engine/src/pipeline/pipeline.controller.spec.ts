import { describe, it, expect, beforeEach } from 'vitest';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';

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

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findOne: vi.fn(),
      findByDataSourceId: vi.fn(),
      transition: vi.fn(),
      getValidTransitions: vi.fn(),
      getStateHistory: vi.fn(),
    };
    controller = new PipelineController(service as unknown as PipelineService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create', () => {
    const dto = { dataSourceId: 'ds-1' };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findOne', () => {
    controller.findOne('p1');
    expect(service.findOne).toHaveBeenCalledWith('p1');
  });

  it('should call service.findByDataSourceId', () => {
    controller.findByDataSourceId('ds-1');
    expect(service.findByDataSourceId).toHaveBeenCalledWith('ds-1');
  });

  it('should call service.transition', () => {
    const dto = { status: 'RUNNING' as any };
    controller.transition('p1', dto);
    expect(service.transition).toHaveBeenCalledWith('p1', dto);
  });

  it('should call service.getValidTransitions', () => {
    controller.getValidTransitions('p1');
    expect(service.getValidTransitions).toHaveBeenCalledWith('p1');
  });

  it('should call service.getStateHistory', () => {
    controller.getStateHistory('p1');
    expect(service.getStateHistory).toHaveBeenCalledWith('p1');
  });
});
