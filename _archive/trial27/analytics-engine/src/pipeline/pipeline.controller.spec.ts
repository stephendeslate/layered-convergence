import { describe, it, expect, beforeEach, vi } from 'vitest';
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
    controller = new PipelineController(service as any);
  });

  it('should call service.create', async () => {
    const dto = { dataSourceId: 'ds-1' };
    service.create.mockResolvedValue({ id: 'p-1' });
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'p-1' });
    await controller.findOne('p-1');
    expect(service.findOne).toHaveBeenCalledWith('p-1');
  });

  it('should call service.findByDataSourceId', async () => {
    service.findByDataSourceId.mockResolvedValue({ id: 'p-1' });
    await controller.findByDataSourceId('ds-1');
    expect(service.findByDataSourceId).toHaveBeenCalledWith('ds-1');
  });

  it('should call service.transition', async () => {
    const dto = { status: 'RUNNING' as const };
    service.transition.mockResolvedValue({ id: 'p-1' });
    await controller.transition('p-1', dto);
    expect(service.transition).toHaveBeenCalledWith('p-1', dto);
  });

  it('should call service.getValidTransitions', async () => {
    service.getValidTransitions.mockResolvedValue(['RUNNING']);
    await controller.getValidTransitions('p-1');
    expect(service.getValidTransitions).toHaveBeenCalledWith('p-1');
  });

  it('should call service.getStateHistory', async () => {
    service.getStateHistory.mockResolvedValue([]);
    await controller.getStateHistory('p-1');
    expect(service.getStateHistory).toHaveBeenCalledWith('p-1');
  });
});
