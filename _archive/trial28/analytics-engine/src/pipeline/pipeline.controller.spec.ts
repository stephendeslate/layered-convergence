import { Test } from '@nestjs/testing';
import { PipelineController } from './pipeline.controller.js';
import { PipelineService } from './pipeline.service.js';

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

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PipelineController],
      providers: [{ provide: PipelineService, useValue: mockService }],
    }).compile();

    controller = module.get(PipelineController);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should start a sync with tenantId from request', async () => {
    const req = { tenantId: 't1' } as any;
    mockService.startSync.mockResolvedValue({ id: 'sr1', status: 'RUNNING' });

    const result = await controller.startSync(req, 'ds1');
    expect(mockService.startSync).toHaveBeenCalledWith('t1', 'ds1');
    expect(result.status).toBe('RUNNING');
  });

  it('should update sync status', async () => {
    const dto = { status: 'COMPLETED' as any, rowsIngested: 100 };
    mockService.updateSyncStatus.mockResolvedValue({
      id: 'sr1',
      status: 'COMPLETED',
    });

    const result = await controller.updateSyncStatus('sr1', dto);
    expect(mockService.updateSyncStatus).toHaveBeenCalledWith(
      'sr1',
      'COMPLETED',
      100,
      undefined,
    );
    expect(result.status).toBe('COMPLETED');
  });

  it('should get a sync run by id', async () => {
    mockService.getSyncRun.mockResolvedValue({ id: 'sr1' });

    const result = await controller.getSyncRun('sr1');
    expect(mockService.getSyncRun).toHaveBeenCalledWith('sr1');
    expect(result.id).toBe('sr1');
  });

  it('should get sync runs for a data source', async () => {
    mockService.getSyncRuns.mockResolvedValue([{ id: 'sr1' }]);

    const result = await controller.getSyncRuns('ds1');
    expect(mockService.getSyncRuns).toHaveBeenCalledWith('ds1');
    expect(result).toHaveLength(1);
  });

  it('should get dead letter events for a data source', async () => {
    mockService.getDeadLetterEvents.mockResolvedValue([{ id: 'dle1' }]);

    const result = await controller.getDeadLetterEvents('ds1');
    expect(mockService.getDeadLetterEvents).toHaveBeenCalledWith('ds1');
    expect(result).toHaveLength(1);
  });

  it('should retry a dead letter event', async () => {
    mockService.retryDeadLetterEvent.mockResolvedValue({
      id: 'dle1',
      retriedAt: new Date(),
    });

    const result = await controller.retryDeadLetterEvent('dle1');
    expect(mockService.retryDeadLetterEvent).toHaveBeenCalledWith('dle1');
    expect(result.retriedAt).toBeDefined();
  });
});
