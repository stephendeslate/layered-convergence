import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';

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

describe('WidgetController', () => {
  let controller: WidgetController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new WidgetController(mockService as unknown as WidgetService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a widget', async () => {
      const dto = { name: 'Chart', type: 'line', dashboardId: 'dash-1' };
      mockService.create.mockResolvedValue({ id: 'w-1', ...dto });

      const result = await controller.create(mockReq('tenant-1'), dto);

      expect(result.id).toBe('w-1');
    });

    it('should throw BadRequestException when no tenantId', async () => {
      await expect(
        controller.create(mockReq(), { name: 'W', type: 'line', dashboardId: 'dash-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all widgets', async () => {
      mockService.findAll.mockResolvedValue([{ id: 'w-1' }]);

      const result = await controller.findAll(mockReq('tenant-1'));

      expect(result).toHaveLength(1);
    });

    it('should filter by dashboardId', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(mockReq('tenant-1'), 'dash-1');

      expect(mockService.findAll).toHaveBeenCalledWith('tenant-1', 'dash-1');
    });
  });

  describe('findOne', () => {
    it('should return a widget', async () => {
      mockService.findOne.mockResolvedValue({ id: 'w-1' });

      const result = await controller.findOne(mockReq('tenant-1'), 'w-1');

      expect(result.id).toBe('w-1');
    });
  });

  describe('update', () => {
    it('should update a widget', async () => {
      mockService.update.mockResolvedValue({ id: 'w-1', name: 'Updated' });

      const result = await controller.update(mockReq('tenant-1'), 'w-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a widget', async () => {
      mockService.remove.mockResolvedValue({ id: 'w-1' });

      const result = await controller.remove(mockReq('tenant-1'), 'w-1');

      expect(result).toEqual({ id: 'w-1' });
    });
  });
});
