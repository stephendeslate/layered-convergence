import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  const mockDataSource = {
    id: 'ds-1',
    tenantId: 'tenant-1',
    name: 'Test Source',
    type: 'api',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      dataSource: {
        create: vi.fn().mockResolvedValue(mockDataSource),
        findMany: vi.fn().mockResolvedValue([mockDataSource]),
        findFirst: vi.fn().mockResolvedValue(mockDataSource),
        update: vi.fn().mockResolvedValue({ ...mockDataSource, name: 'Updated' }),
        delete: vi.fn().mockResolvedValue(mockDataSource),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a data source', async () => {
    const result = await service.create('tenant-1', { name: 'Test Source', type: 'api' });
    expect(result).toEqual(mockDataSource);
    expect(prisma.dataSource.create).toHaveBeenCalledWith({
      data: { tenantId: 'tenant-1', name: 'Test Source', type: 'api' },
    });
  });

  it('should find all data sources for a tenant', async () => {
    const result = await service.findAll('tenant-1');
    expect(result).toEqual([mockDataSource]);
    expect(prisma.dataSource.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      include: { config: true, pipeline: true },
    });
  });

  it('should find one data source by id and tenant', async () => {
    const result = await service.findOne('tenant-1', 'ds-1');
    expect(result).toEqual(mockDataSource);
    expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
      where: { id: 'ds-1', tenantId: 'tenant-1' },
      include: { config: true, pipeline: true },
    });
  });

  it('should throw NotFoundException when data source not found', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.findOne('tenant-1', 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update a data source', async () => {
    const result = await service.update('tenant-1', 'ds-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
    expect(prisma.dataSource.update).toHaveBeenCalledWith({
      where: { id: 'ds-1' },
      data: { name: 'Updated' },
    });
  });

  it('should throw NotFoundException when updating non-existent data source', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.update('tenant-1', 'missing', { name: 'X' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should delete a data source', async () => {
    const result = await service.remove('tenant-1', 'ds-1');
    expect(result).toEqual(mockDataSource);
    expect(prisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
  });

  it('should throw NotFoundException when deleting non-existent data source', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.remove('tenant-1', 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
