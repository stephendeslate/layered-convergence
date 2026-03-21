import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
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

    const module = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(DataSourceService);
  });

  describe('create', () => {
    it('should create a data source with tenantId', async () => {
      const dto = { name: 'Test', type: 'postgresql' };
      prisma.dataSource.create.mockResolvedValue({ id: 'ds-1', ...dto, tenantId: 't-1' });
      const result = await service.create('t-1', dto);
      expect(result.tenantId).toBe('t-1');
    });

    it('should pass name and type to prisma create', async () => {
      const dto = { name: 'Sales', type: 'mysql' };
      prisma.dataSource.create.mockResolvedValue({ id: 'ds-1' });
      await service.create('t-1', dto);
      expect(prisma.dataSource.create).toHaveBeenCalledWith({
        data: { tenantId: 't-1', name: 'Sales', type: 'mysql' },
      });
    });
  });

  describe('findAll', () => {
    it('should return all data sources for tenant', async () => {
      prisma.dataSource.findMany.mockResolvedValue([{ id: 'ds-1' }]);
      const result = await service.findAll('t-1');
      expect(result).toHaveLength(1);
    });

    it('should filter by tenantId', async () => {
      prisma.dataSource.findMany.mockResolvedValue([]);
      await service.findAll('t-1');
      expect(prisma.dataSource.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't-1' },
        include: { config: true, pipeline: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1', tenantId: 't-1' });
      const result = await service.findOne('t-1', 'ds-1');
      expect(result.id).toBe('ds-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.findOne('t-1', 'missing')).rejects.toThrow(NotFoundException);
    });

    it('should filter by both id and tenantId', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      await service.findOne('t-1', 'ds-1');
      expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
        where: { id: 'ds-1', tenantId: 't-1' },
        include: { config: true, pipeline: true },
      });
    });
  });

  describe('update', () => {
    it('should update data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      prisma.dataSource.update.mockResolvedValue({ id: 'ds-1', name: 'Updated' });
      const result = await service.update('t-1', 'ds-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should throw NotFoundException if not found on update', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.update('t-1', 'missing', { name: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete data source', async () => {
      prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      prisma.dataSource.delete.mockResolvedValue({ id: 'ds-1' });
      const result = await service.remove('t-1', 'ds-1');
      expect(result.id).toBe('ds-1');
    });

    it('should throw NotFoundException if not found on delete', async () => {
      prisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.remove('t-1', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
