import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let mockPrisma: any;

  const mockDataSource = {
    id: 'ds-1',
    tenantId: 'tenant-1',
    name: 'My API Source',
    type: 'api',
    status: 'IDLE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockPrisma = {
      dataSource: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new DataSourceService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a data source', async () => {
      mockPrisma.dataSource.create.mockResolvedValue(mockDataSource);
      const result = await service.create('tenant-1', { name: 'My API Source', type: 'api' });
      expect(result).toEqual(mockDataSource);
      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith({
        data: { tenantId: 'tenant-1', name: 'My API Source', type: 'api' },
      });
    });
  });

  describe('findAll', () => {
    it('should return all data sources for a tenant', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([mockDataSource]);
      const result = await service.findAll('tenant-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        include: { config: true },
      });
    });

    it('should return empty array when no data sources exist', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([]);
      const result = await service.findAll('tenant-1');
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a data source by id', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(mockDataSource);
      const result = await service.findOne('tenant-1', 'ds-1');
      expect(result).toEqual(mockDataSource);
    });

    it('should throw NotFoundException when data source not found', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);
      await expect(service.findOne('tenant-1', 'ds-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when tenantId does not match', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue({ ...mockDataSource, tenantId: 'other' });
      await expect(service.findOne('tenant-1', 'ds-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(mockDataSource);
      mockPrisma.dataSource.update.mockResolvedValue({ ...mockDataSource, name: 'Updated' });
      const result = await service.update('tenant-1', 'ds-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException when updating non-existent data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);
      await expect(service.update('tenant-1', 'ds-999', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(mockDataSource);
      mockPrisma.dataSource.delete.mockResolvedValue(mockDataSource);
      const result = await service.remove('tenant-1', 'ds-1');
      expect(result).toEqual(mockDataSource);
    });

    it('should throw NotFoundException when deleting non-existent data source', async () => {
      mockPrisma.dataSource.findUnique.mockResolvedValue(null);
      await expect(service.remove('tenant-1', 'ds-999')).rejects.toThrow(NotFoundException);
    });
  });
});
