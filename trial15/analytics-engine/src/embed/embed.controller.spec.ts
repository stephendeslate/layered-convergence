import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { EmbedController } from './embed.controller';
import { EmbedService } from './embed.service';

const mockService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  findByToken: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

function mockReq(tenantId?: string) {
  return { tenantId } as any;
}

describe('EmbedController', () => {
  let controller: EmbedController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new EmbedController(mockService as unknown as EmbedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an embed config', async () => {
      const dto = { dashboardId: 'dash-1' };
      mockService.create.mockResolvedValue({ id: 'ec-1', token: 'abc' });

      const result = await controller.create(mockReq('tenant-1'), dto);

      expect(result.token).toBe('abc');
    });

    it('should throw BadRequestException when no tenantId', async () => {
      await expect(
        controller.create(mockReq(), { dashboardId: 'dash-1' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all embed configs', async () => {
      mockService.findAll.mockResolvedValue([{ id: 'ec-1' }]);

      const result = await controller.findAll(mockReq('tenant-1'));

      expect(result).toHaveLength(1);
    });
  });

  describe('findByToken', () => {
    it('should return embed config by token', async () => {
      mockService.findByToken.mockResolvedValue({ id: 'ec-1', token: 'abc' });

      const result = await controller.findByToken('abc');

      expect(result.token).toBe('abc');
    });

    it('should throw BadRequestException when no token provided', () => {
      expect(() => controller.findByToken('')).toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return an embed config', async () => {
      mockService.findOne.mockResolvedValue({ id: 'ec-1' });

      const result = await controller.findOne(mockReq('tenant-1'), 'ec-1');

      expect(result.id).toBe('ec-1');
    });
  });

  describe('update', () => {
    it('should update an embed config', async () => {
      mockService.update.mockResolvedValue({ id: 'ec-1', allowedOrigins: ['https://new.com'] });

      const result = await controller.update(mockReq('tenant-1'), 'ec-1', {
        allowedOrigins: ['https://new.com'],
      });

      expect(result.allowedOrigins).toEqual(['https://new.com']);
    });
  });

  describe('remove', () => {
    it('should delete an embed config', async () => {
      mockService.remove.mockResolvedValue({ id: 'ec-1' });

      const result = await controller.remove(mockReq('tenant-1'), 'ec-1');

      expect(result).toEqual({ id: 'ec-1' });
    });
  });
});
