import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { SyncRunController } from './sync-run.controller';
import { SyncRunService } from './sync-run.service';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  updateStatus: vi.fn(),
  remove: vi.fn(),
};

function mockReq(tenantId?: string) {
  return { tenantId } as any;
}

describe('SyncRunController', () => {
  let controller: SyncRunController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new SyncRunController(mockService as unknown as SyncRunService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a sync run', async () => {
      const dto = { pipelineId: 'pipe-1' };
      mockService.create.mockResolvedValue({ id: 'sr-1', ...dto });

      const result = await controller.create(mockReq('tenant-1'), dto);

      expect(result.id).toBe('sr-1');
      expect(mockService.create).toHaveBeenCalledWith('tenant-1', dto);
    });

    it('should throw BadRequestException when no tenantId', async () => {
      await expect(
        controller.create(mockReq(), { pipelineId: 'pipe-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all sync runs', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(mockReq('tenant-1'));

      expect(mockService.findAll).toHaveBeenCalledWith('tenant-1', undefined);
    });

    it('should filter by pipelineId', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(mockReq('tenant-1'), 'pipe-1');

      expect(mockService.findAll).toHaveBeenCalledWith('tenant-1', 'pipe-1');
    });
  });

  describe('findOne', () => {
    it('should return a sync run', async () => {
      mockService.findOne.mockResolvedValue({ id: 'sr-1' });

      const result = await controller.findOne(mockReq('tenant-1'), 'sr-1');

      expect(result.id).toBe('sr-1');
    });
  });

  describe('updateStatus', () => {
    it('should update sync run status', async () => {
      mockService.updateStatus.mockResolvedValue({ id: 'sr-1', status: 'completed' });

      const result = await controller.updateStatus(mockReq('tenant-1'), 'sr-1', {
        status: 'completed',
        recordCount: 100,
      });

      expect(result.status).toBe('completed');
      expect(mockService.updateStatus).toHaveBeenCalledWith('tenant-1', 'sr-1', 'completed', {
        recordCount: 100,
        errorLog: undefined,
      });
    });
  });

  describe('remove', () => {
    it('should delete a sync run', async () => {
      mockService.remove.mockResolvedValue({ id: 'sr-1' });

      const result = await controller.remove(mockReq('tenant-1'), 'sr-1');

      expect(result).toEqual({ id: 'sr-1' });
    });
  });
});
