import { describe, it, expect, beforeEach } from 'vitest';
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a data source', async () => {
    const dto = { name: 'Test', type: 'api' };
    prisma.dataSource.create.mockResolvedValue({ id: '1', tenantId: 't1', ...dto });
    const result = await service.create('t1', dto);
    expect(result.name).toBe('Test');
    expect(prisma.dataSource.create).toHaveBeenCalledWith({
      data: { tenantId: 't1', name: 'Test', type: 'api' },
    });
  });

  it('should find all data sources by tenant', async () => {
    prisma.dataSource.findMany.mockResolvedValue([{ id: '1', name: 'DS1' }]);
    const result = await service.findAll('t1');
    expect(result).toHaveLength(1);
    expect(prisma.dataSource.findMany).toHaveBeenCalledWith({
      where: { tenantId: 't1' },
      include: { config: true, pipeline: true },
    });
  });

  it('should find one data source by id and tenant', async () => {
    prisma.dataSource.findFirst.mockResolvedValue({ id: '1', name: 'DS1' });
    const result = await service.findOne('t1', '1');
    expect(result.id).toBe('1');
  });

  it('should throw NotFoundException when data source not found', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should update a data source', async () => {
    prisma.dataSource.findFirst.mockResolvedValue({ id: '1', name: 'Old' });
    prisma.dataSource.update.mockResolvedValue({ id: '1', name: 'New' });
    const result = await service.update('t1', '1', { name: 'New' });
    expect(result.name).toBe('New');
  });

  it('should throw NotFoundException when updating non-existent data source', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.update('t1', 'bad', { name: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('should delete a data source', async () => {
    prisma.dataSource.findFirst.mockResolvedValue({ id: '1' });
    prisma.dataSource.delete.mockResolvedValue({ id: '1' });
    await service.remove('t1', '1');
    expect(prisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should throw NotFoundException when deleting non-existent data source', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);
    await expect(service.remove('t1', 'bad')).rejects.toThrow(NotFoundException);
  });
});
