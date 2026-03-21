import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PipelineController } from './pipeline.controller.js';

const mockService = {
  startSync: vi.fn(),
  updateSyncStatus: vi.fn(),
  getSyncRun: vi.fn(),
  getSyncRuns: vi.fn(),
  getDeadLetterEvents: vi.fn(),
  retryDeadLetterEvent: vi.fn(),
};

describe('PipelineController', () => {
  let controller: PipelineController;
  const req = { tenantId: 'tenant-1' } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PipelineController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call startSync with tenantId', async () => {
    mockService.startSync.mockResolvedValue({ id: 'sr-1', status: 'RUNNING' });
    const result = await controller.startSync(req, 'ds-1');
    expect(result.status).toBe('RUNNING');
    expect(mockService.startSync).toHaveBeenCalledWith('tenant-1', 'ds-1');
  });

  it('should call updateSyncStatus', async () => {
    mockService.updateSyncStatus.mockResolvedValue({
      id: 'sr-1',
      status: 'COMPLETED',
    });
    const result = await controller.updateSyncStatus('sr-1', {
      status: 'COMPLETED' as any,
      rowsIngested: 50,
    });
    expect(result.status).toBe('COMPLETED');
  });

  it('should call getSyncRun', async () => {
    mockService.getSyncRun.mockResolvedValue({ id: 'sr-1' });
    const result = await controller.getSyncRun('sr-1');
    expect(result.id).toBe('sr-1');
  });

  it('should call getSyncRuns', async () => {
    mockService.getSyncRuns.mockResolvedValue([{ id: 'sr-1' }]);
    const result = await controller.getSyncRuns('ds-1');
    expect(result).toHaveLength(1);
  });

  it('should call getDeadLetterEvents', async () => {
    mockService.getDeadLetterEvents.mockResolvedValue([{ id: 'dle-1' }]);
    const result = await controller.getDeadLetterEvents('ds-1');
    expect(result).toHaveLength(1);
  });

  it('should call retryDeadLetterEvent', async () => {
    mockService.retryDeadLetterEvent.mockResolvedValue({ id: 'dle-1' });
    const result = await controller.retryDeadLetterEvent('dle-1');
    expect(result.id).toBe('dle-1');
  });
});
