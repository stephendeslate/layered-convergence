import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  trigger: vi.fn(),
  complete: vi.fn(),
  fail: vi.fn(),
  reset: vi.fn(),
  remove: vi.fn(),
};

function mockReq(tenantId?: string) {
  return { tenantId } as any;
}

describe('PipelineController', () => {
  let controller: PipelineController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PipelineController(mockService as unknown as PipelineService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a pipeline', async () => {
      const dto = { name: 'ETL', dataSourceId: 'ds-1' };
      mockService.create.mockResolvedValue({ id: 'pipe-1', ...dto, status: 'IDLE' });

      const result = await controller.create(mockReq('tenant-1'), dto);

      expect(result.status).toBe('IDLE');
      expect(mockService.create).toHaveBeenCalledWith('tenant-1', {
        name: 'ETL',
        dataSourceId: 'ds-1',
      });
    });

    it('should throw BadRequestException when no tenantId', async () => {
      await expect(
        controller.create(mockReq(), { name: 'ETL', dataSourceId: 'ds-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all pipelines', async () => {
      mockService.findAll.mockResolvedValue([{ id: 'pipe-1' }]);

      const result = await controller.findAll(mockReq('tenant-1'));

      expect(result).toEqual([{ id: 'pipe-1' }]);
    });
  });

  describe('findOne', () => {
    it('should return a single pipeline', async () => {
      mockService.findOne.mockResolvedValue({ id: 'pipe-1', status: 'IDLE' });

      const result = await controller.findOne(mockReq('tenant-1'), 'pipe-1');

      expect(result.id).toBe('pipe-1');
    });
  });

  describe('trigger', () => {
    it('should trigger a pipeline', async () => {
      mockService.trigger.mockResolvedValue({ id: 'pipe-1', status: 'RUNNING' });

      const result = await controller.trigger(mockReq('tenant-1'), 'pipe-1');

      expect(result.status).toBe('RUNNING');
    });
  });

  describe('complete', () => {
    it('should complete a pipeline', async () => {
      mockService.complete.mockResolvedValue({ id: 'pipe-1', status: 'COMPLETED' });

      const result = await controller.complete(mockReq('tenant-1'), 'pipe-1');

      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('fail', () => {
    it('should fail a pipeline with error message', async () => {
      mockService.fail.mockResolvedValue({
        id: 'pipe-1',
        status: 'FAILED',
        errorMessage: 'Timeout',
      });

      const result = await controller.fail(mockReq('tenant-1'), 'pipe-1', 'Timeout');

      expect(result.status).toBe('FAILED');
    });

    it('should use default error message when none provided', async () => {
      mockService.fail.mockResolvedValue({ id: 'pipe-1', status: 'FAILED' });

      await controller.fail(mockReq('tenant-1'), 'pipe-1', undefined as any);

      expect(mockService.fail).toHaveBeenCalledWith(
        'tenant-1',
        'pipe-1',
        'Unknown error',
      );
    });
  });

  describe('reset', () => {
    it('should reset a pipeline', async () => {
      mockService.reset.mockResolvedValue({ id: 'pipe-1', status: 'IDLE' });

      const result = await controller.reset(mockReq('tenant-1'), 'pipe-1');

      expect(result.status).toBe('IDLE');
    });
  });

  describe('remove', () => {
    it('should delete a pipeline', async () => {
      mockService.remove.mockResolvedValue({ id: 'pipe-1' });

      const result = await controller.remove(mockReq('tenant-1'), 'pipe-1');

      expect(result).toEqual({ id: 'pipe-1' });
    });
  });

  describe('events (SSE)', () => {
    it('should return an observable that emits pipeline status', async () => {
      mockService.findOne.mockResolvedValue({
        id: 'pipe-1',
        status: 'RUNNING',
        lastRunAt: '2024-01-01T00:00:00Z',
        errorMessage: null,
      });

      const observable = controller.events(mockReq('tenant-1'), 'pipe-1');

      expect(observable).toBeDefined();
      expect(observable.subscribe).toBeDefined();

      const event = await firstValueFrom(observable);

      expect(event.type).toBe('pipeline-status');
      expect(event.retry).toBe(5000);
      const data = JSON.parse(event.data as string);
      expect(data.id).toBe('pipe-1');
      expect(data.status).toBe('RUNNING');
      expect(data.retry).toBe(5000);
    });
  });
});
