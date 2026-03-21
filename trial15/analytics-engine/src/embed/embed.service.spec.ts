import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EmbedService } from './embed.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  embedConfig: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('EmbedService', () => {
  let service: EmbedService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmbedService(mockPrisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an embed config', async () => {
      const dto = { dashboardId: 'dash-1' };
      const expected = { id: 'ec-1', ...dto, token: 'abc', tenantId: 'tenant-1' };
      mockPrisma.embedConfig.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
    });

    it('should create with allowed origins', async () => {
      const dto = {
        dashboardId: 'dash-1',
        allowedOrigins: ['https://example.com'],
      };
      mockPrisma.embedConfig.create.mockResolvedValue({ id: 'ec-1' });

      await service.create('tenant-1', dto);

      expect(mockPrisma.embedConfig.create).toHaveBeenCalledWith({
        data: {
          dashboardId: 'dash-1',
          allowedOrigins: ['https://example.com'],
          expiresAt: null,
          tenantId: 'tenant-1',
        },
      });
    });

    it('should create with expiration date', async () => {
      const dto = {
        dashboardId: 'dash-1',
        expiresAt: '2025-12-31T23:59:59Z',
      };
      mockPrisma.embedConfig.create.mockResolvedValue({ id: 'ec-1' });

      await service.create('tenant-1', dto);

      expect(mockPrisma.embedConfig.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          expiresAt: new Date('2025-12-31T23:59:59Z'),
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all embed configs for a tenant', async () => {
      mockPrisma.embedConfig.findMany.mockResolvedValue([{ id: 'ec-1' }]);

      const result = await service.findAll('tenant-1');

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an embed config by id and tenantId', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue({ id: 'ec-1' });

      const result = await service.findOne('tenant-1', 'ec-1');

      expect(result.id).toBe('ec-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'ec-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByToken', () => {
    it('should return embed config by token', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue({
        id: 'ec-1',
        token: 'abc',
        expiresAt: null,
      });

      const result = await service.findByToken('abc');

      expect(result.token).toBe('abc');
    });

    it('should throw NotFoundException for invalid token', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue(null);

      await expect(service.findByToken('invalid')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for expired token', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue({
        id: 'ec-1',
        token: 'abc',
        expiresAt: new Date('2020-01-01'),
      });

      await expect(service.findByToken('abc')).rejects.toThrow(NotFoundException);
    });

    it('should allow non-expired token', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      mockPrisma.embedConfig.findFirst.mockResolvedValue({
        id: 'ec-1',
        token: 'abc',
        expiresAt: futureDate,
      });

      const result = await service.findByToken('abc');

      expect(result.id).toBe('ec-1');
    });
  });

  describe('update', () => {
    it('should update allowed origins', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue({ id: 'ec-1' });
      mockPrisma.embedConfig.update.mockResolvedValue({
        id: 'ec-1',
        allowedOrigins: ['https://new.com'],
      });

      const result = await service.update('tenant-1', 'ec-1', {
        allowedOrigins: ['https://new.com'],
      });

      expect(result.allowedOrigins).toEqual(['https://new.com']);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue(null);

      await expect(
        service.update('tenant-1', 'ec-999', { allowedOrigins: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an embed config', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue({ id: 'ec-1' });
      mockPrisma.embedConfig.delete.mockResolvedValue({ id: 'ec-1' });

      const result = await service.remove('tenant-1', 'ec-1');

      expect(result).toEqual({ id: 'ec-1' });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'ec-999')).rejects.toThrow(NotFoundException);
    });
  });
});
