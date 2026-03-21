import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PipelineController } from './pipeline.controller';

describe('PipelineController', () => {
  let controller: PipelineController;
  let mockService: any;

  const mockReq = { tenantId: 'tenant-1' } as any;

  beforeEach(() => {
    mockService = {
      getStatus: vi.fn().mockResolvedValue({ id: 'ds-1', status: 'IDLE' }),
      trigger: vi.fn().mockResolvedValue({ dataSourceId: 'ds-1', syncRunId: 'run-1', status: 'RUNNING' }),
      complete: vi.fn().mockResolvedValue({ dataSourceId: 'ds-1', status: 'COMPLETED', rowsIngested: 50 }),
      fail: vi.fn().mockResolvedValue({ dataSourceId: 'ds-1', status: 'FAILED', errorLog: 'Error' }),
    };
    controller = new PipelineController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get pipeline status', async () => {
    const result = await controller.getStatus('ds-1');
    expect(result.status).toBe('IDLE');
    expect(mockService.getStatus).toHaveBeenCalledWith('ds-1');
  });

  it('should trigger a pipeline', async () => {
    const result = await controller.trigger(mockReq, { dataSourceId: 'ds-1' });
    expect(result.status).toBe('RUNNING');
    expect(mockService.trigger).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should complete a pipeline', async () => {
    const result = await controller.complete('ds-1', 'run-1', 50);
    expect(result.status).toBe('COMPLETED');
    expect(mockService.complete).toHaveBeenCalledWith('ds-1', 'run-1', 50);
  });

  it('should fail a pipeline', async () => {
    const result = await controller.fail('ds-1', 'run-1', 'Error');
    expect(result.status).toBe('FAILED');
    expect(mockService.fail).toHaveBeenCalledWith('ds-1', 'run-1', 'Error');
  });

  it('should return SSE observable for events', () => {
    const observable = controller.events('ds-1');
    expect(observable).toBeDefined();
    expect(observable.subscribe).toBeDefined();
  });
});
