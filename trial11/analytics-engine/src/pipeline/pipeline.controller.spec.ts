import { Test, TestingModule } from '@nestjs/testing';
import { PipelineController } from './pipeline.controller.js';
import { PipelineService } from './pipeline.service.js';

const mockPipelineService = {
  triggerSync: vi.fn(),
  getSyncRuns: vi.fn(),
};

const mockRequest = { tenantId: 'tenant-1' };

describe('PipelineController', () => {
  let controller: PipelineController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PipelineController],
      providers: [
        { provide: PipelineService, useValue: mockPipelineService },
      ],
    }).compile();

    controller = module.get<PipelineController>(PipelineController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerSync', () => {
    it('should trigger a sync for a data source', async () => {
      const expected = { id: 'sr-1', status: 'RUNNING' };
      mockPipelineService.triggerSync.mockResolvedValue(expected);

      // type assertion justified: simulating middleware-enriched request
      const result = await controller.triggerSync(mockRequest as any, 'ds-1');

      expect(result).toEqual(expected);
      expect(mockPipelineService.triggerSync).toHaveBeenCalledWith(
        'ds-1',
        'tenant-1',
      );
    });
  });

  describe('getSyncRuns', () => {
    it('should return sync runs', async () => {
      const runs = [{ id: 'sr-1', status: 'COMPLETED' }];
      mockPipelineService.getSyncRuns.mockResolvedValue(runs);

      const result = await controller.getSyncRuns('ds-1');

      expect(result).toEqual(runs);
    });
  });
});
