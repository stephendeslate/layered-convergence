import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  dataSource: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DataSourceService(mockPrisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a data source with tenantId', async () => {
      const dto = { name: 'My Source', type: 'postgres' };
      const expected = { id: 'ds-1', ...dto, tenantId: 'tenant-1' };
      mockPrisma.dataSource.create.mockResolvedValue(expected);

      const result = await service.create('tenant-1', dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith({
        data: { name: 'My Source', type: 'postgres', tenantId: 'tenant-1' },
      });
    });
  });

  describe('findAll', () => {
    it('should return all data sources for a tenant', async () => {
      const expected = [
        { id: 'ds-1', name: 'Source 1', tenantId: 'tenant-1' },
        { id: 'ds-2', name: 'Source 2', tenantId: 'tenant-1' },
      ];
      mockPrisma.dataSource.findMany.mockResolvedValue(expected);

      const result = await service.findAll('tenant-1');

      expect(result).toEqual(expected);
      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no data sources exist', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([]);

      const result = await service.findAll('tenant-1');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a data source by id and tenantId', async () => {
      const expected = { id: 'ds-1', name: 'Source', tenantId: 'tenant-1' };
      mockPrisma.dataSource.findFirst.mockResolvedValue(expected);

      const result = await service.findOne('tenant-1', 'ds-1');

      expect(result).toEqual(expected);
      expect(mockPrisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId: 'tenant-1' },
      });
    });

    it('should throw NotFoundException when data source not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('tenant-1', 'ds-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      const existing = { id: 'ds-1', name: 'Old', type: 'pg', tenantId: 'tenant-1' };
      const updated = { ...existing, name: 'New' };

      mockPrisma.dataSource.findFirst.mockResolvedValue(existing);
      mockPrisma.dataSource.update.mockResolvedValue(updated);

      const result = await service.update('tenant-1', 'ds-1', { name: 'New' });

      expect(result).toEqual(updated);
      expect(mockPrisma.dataSource.update).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
        data: { name: 'New' },
      });
    });

    it('should throw NotFoundException if data source to update not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.update('tenant-1', 'ds-999', { name: 'New' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      const existing = { id: 'ds-1', name: 'Source', tenantId: 'tenant-1' };
      mockPrisma.dataSource.findFirst.mockResolvedValue(existing);
      mockPrisma.dataSource.delete.mockResolvedValue(existing);

      const result = await service.remove('tenant-1', 'ds-1');

      expect(result).toEqual(existing);
      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
      });
    });

    it('should throw NotFoundException if data source to delete not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.remove('tenant-1', 'ds-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
