import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

function mockReq(tenantId?: string) {
  return { tenantId } as any;
}

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new DashboardController(mockService as unknown as DashboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      mockService.create.mockResolvedValue({ id: 'dash-1', name: 'My Dashboard' });

      const result = await controller.create(mockReq('tenant-1'), { name: 'My Dashboard' });

      expect(result.id).toBe('dash-1');
    });

    it('should throw BadRequestException when no tenantId', async () => {
      await expect(
        controller.create(mockReq(), { name: 'D' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all dashboards', async () => {
      mockService.findAll.mockResolvedValue([{ id: 'dash-1' }]);

      const result = await controller.findAll(mockReq('tenant-1'));

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard', async () => {
      mockService.findOne.mockResolvedValue({ id: 'dash-1' });

      const result = await controller.findOne(mockReq('tenant-1'), 'dash-1');

      expect(result.id).toBe('dash-1');
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      mockService.update.mockResolvedValue({ id: 'dash-1', name: 'Updated' });

      const result = await controller.update(mockReq('tenant-1'), 'dash-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      mockService.remove.mockResolvedValue({ id: 'dash-1' });

      const result = await controller.remove(mockReq('tenant-1'), 'dash-1');

      expect(result).toEqual({ id: 'dash-1' });
    });
  });
});
