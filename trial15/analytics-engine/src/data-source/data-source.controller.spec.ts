import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { DataSourceController } from './data-source.controller';
import { DataSourceService } from './data-source.service';

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

describe('DataSourceController', () => {
  let controller: DataSourceController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new DataSourceController(
      mockService as unknown as DataSourceService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a data source', async () => {
      const dto = { name: 'Source', type: 'pg' };
      const expected = { id: 'ds-1', ...dto, tenantId: 'tenant-1' };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(mockReq('tenant-1'), dto);

      expect(result).toEqual(expected);
      expect(mockService.create).toHaveBeenCalledWith('tenant-1', dto);
    });

    it('should throw BadRequestException when no tenantId', async () => {
      await expect(
        controller.create(mockReq(), { name: 'S', type: 'pg' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all data sources for tenant', async () => {
      const expected = [{ id: 'ds-1' }];
      mockService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(mockReq('tenant-1'));

      expect(result).toEqual(expected);
      expect(mockService.findAll).toHaveBeenCalledWith('tenant-1');
    });
  });

  describe('findOne', () => {
    it('should return a single data source', async () => {
      const expected = { id: 'ds-1', name: 'Source' };
      mockService.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(mockReq('tenant-1'), 'ds-1');

      expect(result).toEqual(expected);
      expect(mockService.findOne).toHaveBeenCalledWith('tenant-1', 'ds-1');
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      const dto = { name: 'Updated' };
      const expected = { id: 'ds-1', name: 'Updated' };
      mockService.update.mockResolvedValue(expected);

      const result = await controller.update(mockReq('tenant-1'), 'ds-1', dto);

      expect(result).toEqual(expected);
      expect(mockService.update).toHaveBeenCalledWith('tenant-1', 'ds-1', dto);
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      const expected = { id: 'ds-1' };
      mockService.remove.mockResolvedValue(expected);

      const result = await controller.remove(mockReq('tenant-1'), 'ds-1');

      expect(result).toEqual(expected);
      expect(mockService.remove).toHaveBeenCalledWith('tenant-1', 'ds-1');
    });
  });
});
