import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { DataSourceConfigController } from './data-source-config.controller';
import { DataSourceConfigService } from './data-source-config.service';

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

describe('DataSourceConfigController', () => {
  let controller: DataSourceConfigController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new DataSourceConfigController(
      mockService as unknown as DataSourceConfigService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a config', async () => {
      const dto = { key: 'host', value: 'localhost', dataSourceId: 'ds-1' };
      mockService.create.mockResolvedValue({ id: 'cfg-1', ...dto });

      const result = await controller.create(mockReq('tenant-1'), dto);

      expect(mockService.create).toHaveBeenCalledWith('tenant-1', dto);
      expect(result.id).toBe('cfg-1');
    });

    it('should throw BadRequestException when no tenantId', async () => {
      await expect(
        controller.create(mockReq(), { key: 'k', value: 'v', dataSourceId: 'ds-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return configs with optional dataSourceId filter', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(mockReq('tenant-1'), 'ds-1');

      expect(mockService.findAll).toHaveBeenCalledWith('tenant-1', 'ds-1');
    });

    it('should return configs without filter', async () => {
      mockService.findAll.mockResolvedValue([]);

      await controller.findAll(mockReq('tenant-1'));

      expect(mockService.findAll).toHaveBeenCalledWith('tenant-1', undefined);
    });
  });

  describe('findOne', () => {
    it('should return a single config', async () => {
      mockService.findOne.mockResolvedValue({ id: 'cfg-1' });

      const result = await controller.findOne(mockReq('tenant-1'), 'cfg-1');

      expect(result).toEqual({ id: 'cfg-1' });
    });
  });

  describe('update', () => {
    it('should update a config', async () => {
      mockService.update.mockResolvedValue({ id: 'cfg-1', value: 'new' });

      const result = await controller.update(mockReq('tenant-1'), 'cfg-1', { value: 'new' });

      expect(result.value).toBe('new');
    });
  });

  describe('remove', () => {
    it('should delete a config', async () => {
      mockService.remove.mockResolvedValue({ id: 'cfg-1' });

      const result = await controller.remove(mockReq('tenant-1'), 'cfg-1');

      expect(result).toEqual({ id: 'cfg-1' });
    });
  });
});
