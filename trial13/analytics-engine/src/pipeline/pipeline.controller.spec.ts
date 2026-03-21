import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PipelineController } from './pipeline.controller';

describe('PipelineController', () => {
  let controller: PipelineController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      getStatus: vi.fn().mockResolvedValue({ id: 'ds-1', status: 'IDLE' }),
      trigger: vi.fn().mockResolvedValue({ dataSourceId: 'ds-1', syncRunId: 'run-1', status: 'RUNNING' }),
      complete: vi.fn().mockResolvedValue({ dataSourceId: 'ds-1', status: 'COMPLETED', rowsIngested: 50 }),
      fail: vi.fn().mockResolvedValue({ dataSourceId: 'ds-1', status: 'FAILED', errorLog: 'err' }),
    };
    controller = new PipelineController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get pipeline status', async () => {
    const result = await controller.getStatus('ds-1');
    expect(result).toEqual({ id: 'ds-1', status: 'IDLE' });
  });

  it('should trigger pipeline', async () => {
    const req = { tenantId: 'tenant-1' } as any;
    const result = await controller.trigger(req, { dataSourceId: 'ds-1' });
    expect(result.status).toBe('RUNNING');
  });

  it('should complete pipeline', async () => {
    const result = await controller.complete('ds-1', 'run-1', 50);
    expect(result.status).toBe('COMPLETED');
  });

  it('should fail pipeline', async () => {
    const result = await controller.fail('ds-1', 'run-1', 'err');
    expect(result.status).toBe('FAILED');
  });
});
