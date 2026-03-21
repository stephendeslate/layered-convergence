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

  beforeEach(async () => {
    prisma = {
      dataSource: {
        create: vi.fn().mockResolvedValue({ id: 'ds-1', tenantId: 't-1', name: 'DS', type: 'api' }),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({ id: 'ds-1', tenantId: 't-1', name: 'DS', type: 'api' }),
        update: vi.fn().mockResolvedValue({ id: 'ds-1', name: 'Updated' }),
        delete: vi.fn().mockResolvedValue({ id: 'ds-1' }),
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
    const result = await service.create('t-1', { name: 'DS', type: 'api' });
    expect(result.id).toBe('ds-1');
    expect(prisma.dataSource.create).toHaveBeenCalledWith({
      data: { tenantId: 't-1', name: 'DS', type: 'api' },
    });
  });

  it('should find all data sources for tenant', async () => {
    await service.findAll('t-1');
    expect(prisma.dataSource.findMany).toHaveBeenCalledWith({
      where: { tenantId: 't-1' },
      include: { config: true, pipeline: true },
    });
  });

  it('should find one data source by id and tenant', async () => {
    const result = await service.findOne('t-1', 'ds-1');
    expect(result.id).toBe('ds-1');
  });

  it('should throw NotFoundException when data source not found', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t-1', 'missing')).rejects.toThrow(NotFoundException);
  });

  it('should update a data source', async () => {
    const result = await service.update('t-1', 'ds-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should throw NotFoundException when updating non-existent', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.update('t-1', 'missing', { name: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('should remove a data source', async () => {
    await service.remove('t-1', 'ds-1');
    expect(prisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
  });

  it('should throw NotFoundException when removing non-existent', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.remove('t-1', 'missing')).rejects.toThrow(NotFoundException);
  });

  it('should scope findOne by tenantId', async () => {
    await service.findOne('t-1', 'ds-1');
    expect(prisma.dataSource.findFirst).toHaveBeenCalledWith({
      where: { id: 'ds-1', tenantId: 't-1' },
      include: { config: true, pipeline: true },
    });
  });
});
