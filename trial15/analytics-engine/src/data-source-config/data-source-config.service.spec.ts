import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DataSourceConfigService } from './data-source-config.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  dataSourceConfig: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('DataSourceConfigService', () => {
  let service: DataSourceConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DataSourceConfigService(mockPrisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a config entry with tenantId', async () => {
      const dto = { key: 'host', value: 'localhost', dataSourceId: 'ds-1' };
      const expected = { id: 'cfg-1', ...dto, tenantId: 'tenant-1', encrypted: false };
      mockPrisma.dataSourceConfig.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.dataSourceConfig.create).toHaveBeenCalledWith({
        data: {
          key: 'host',
          value: 'localhost',
          encrypted: false,
          dataSourceId: 'ds-1',
          tenantId: 'tenant-1',
        },
      });
    });

    it('should create an encrypted config entry', async () => {
      const dto = { key: 'password', value: 'secret', encrypted: true, dataSourceId: 'ds-1' };
      const expected = { id: 'cfg-2', ...dto, tenantId: 'tenant-1' };
      mockPrisma.dataSourceConfig.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return all configs for a tenant', async () => {
      const expected = [{ id: 'cfg-1' }];
      mockPrisma.dataSourceConfig.findMany.mockResolvedValue(expected);

      const result = await service.findAll('tenant-1');

      expect(result).toEqual(expected);
    });

    it('should filter by dataSourceId when provided', async () => {
      mockPrisma.dataSourceConfig.findMany.mockResolvedValue([]);

      await service.findAll('tenant-1', 'ds-1');

      expect(mockPrisma.dataSourceConfig.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1', dataSourceId: 'ds-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a config by id and tenantId', async () => {
      const expected = { id: 'cfg-1', key: 'host', tenantId: 'tenant-1' };
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue(expected);

      const result = await service.findOne('tenant-1', 'cfg-1');

      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'cfg-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a config entry', async () => {
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue({ id: 'cfg-1' });
      mockPrisma.dataSourceConfig.update.mockResolvedValue({ id: 'cfg-1', value: 'new' });

      const result = await service.update('tenant-1', 'cfg-1', { value: 'new' });

      expect(result.value).toBe('new');
    });

    it('should throw NotFoundException if config not found', async () => {
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue(null);

      await expect(service.update('tenant-1', 'cfg-999', { value: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a config entry', async () => {
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue({ id: 'cfg-1' });
      mockPrisma.dataSourceConfig.delete.mockResolvedValue({ id: 'cfg-1' });

      const result = await service.remove('tenant-1', 'cfg-1');

      expect(result).toEqual({ id: 'cfg-1' });
    });

    it('should throw NotFoundException if config to delete not found', async () => {
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'cfg-999')).rejects.toThrow(NotFoundException);
    });
  });
});
