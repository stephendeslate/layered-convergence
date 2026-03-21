import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: {
    dataSource: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  const tenantId = 'tenant-1';
  const otherTenantId = 'tenant-2';

  const mockDataSource = {
    id: 'ds-1',
    tenantId,
    name: 'Test DB',
    type: 'postgresql',
    config: { host: 'localhost', port: 5432 },
    status: 'active',
    syncFrequency: 'daily',
    lastSyncAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        create: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  describe('create', () => {
    it('should create a data source with tenantId', async () => {
      const dto = {
        name: 'Test DB',
        type: 'postgresql',
        config: { host: 'localhost' },
      };
      prisma.dataSource.create.mockResolvedValue({ id: 'ds-1', tenantId, ...dto });

      const result = await service.create(tenantId, dto);

      expect(result.id).toBe('ds-1');
      expect(result.tenantId).toBe(tenantId);
      expect(prisma.dataSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ tenantId, name: 'Test DB' }),
      });
    });

    it('should use default syncFrequency when not provided', async () => {
      const dto = { name: 'Test', type: 'mysql', config: {} };
      prisma.dataSource.create.mockResolvedValue({ id: 'ds-1', tenantId, ...dto, syncFrequency: 'daily' });

      await service.create(tenantId, dto);

      expect(prisma.dataSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ syncFrequency: 'daily' }),
      });
    });

    it('should use provided syncFrequency', async () => {
      const dto = { name: 'Test', type: 'api', config: {}, syncFrequency: 'hourly' as const };
      prisma.dataSource.create.mockResolvedValue({ id: 'ds-1', tenantId, ...dto });

      await service.create(tenantId, dto);

      expect(prisma.dataSource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ syncFrequency: 'hourly' }),
      });
    });
  });

  describe('findAll', () => {
    it('should return all data sources for the tenant', async () => {
      prisma.dataSource.findMany.mockResolvedValue([
        { ...mockDataSource, id: 'ds-1' },
        { ...mockDataSource, id: 'ds-2', name: 'Another DB' },
      ]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(2);
      expect(prisma.dataSource.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no data sources exist', async () => {
      prisma.dataSource.findMany.mockResolvedValue([]);

      const result = await service.findAll(tenantId);

      expect(result).toHaveLength(0);
    });

    it('should filter by tenant ID for isolation', async () => {
      prisma.dataSource.findMany.mockResolvedValue([]);

      await service.findAll(otherTenantId);

      expect(prisma.dataSource.findMany).toHaveBeenCalledWith({
        where: { tenantId: otherTenantId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a data source with related data', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({
        ...mockDataSource,
        syncRuns: [],
        _count: { dataPoints: 100, pipelines: 2 },
      });

      const result = await service.findOne(tenantId, 'ds-1');

      expect(result.id).toBe('ds-1');
      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId },
        include: expect.objectContaining({
          syncRuns: expect.any(Object),
          _count: expect.any(Object),
        }),
      });
    });

    it('should throw NotFoundException if data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'ds-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not find data source from another tenant', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne(otherTenantId, 'ds-1')).rejects.toThrow(
        NotFoundException,
      );

      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ds-1', tenantId: otherTenantId },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(mockDataSource);
      prisma.dataSource.update.mockResolvedValue({
        ...mockDataSource,
        name: 'Updated Name',
      });

      const result = await service.update(tenantId, 'ds-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw NotFoundException if data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.update(tenantId, 'ds-999', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should only update provided fields', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(mockDataSource);
      prisma.dataSource.update.mockResolvedValue(mockDataSource);

      await service.update(tenantId, 'ds-1', { name: 'New Name' });

      expect(prisma.dataSource.update).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
        data: { name: 'New Name' },
      });
    });

    it('should update status field', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(mockDataSource);
      prisma.dataSource.update.mockResolvedValue({ ...mockDataSource, status: 'inactive' });

      await service.update(tenantId, 'ds-1', { status: 'inactive' });

      expect(prisma.dataSource.update).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
        data: { status: 'inactive' },
      });
    });

    it('should not allow updating data source of another tenant', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.update(otherTenantId, 'ds-1', { name: 'Hijacked' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(mockDataSource);
      prisma.dataSource.delete.mockResolvedValue(mockDataSource);

      await service.remove(tenantId, 'ds-1');

      expect(prisma.dataSource.delete).toHaveBeenCalledWith({
        where: { id: 'ds-1' },
      });
    });

    it('should throw NotFoundException if data source not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.remove(tenantId, 'ds-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not allow deleting data source of another tenant', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.remove(otherTenantId, 'ds-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
