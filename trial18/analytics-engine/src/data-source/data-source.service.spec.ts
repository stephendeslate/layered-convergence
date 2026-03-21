import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let prisma: {
    dataSource: {
      findMany: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      dataSource: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new DataSourceService(prisma as unknown as PrismaService);
  });

  it('should return all data sources for a tenant', async () => {
    const sources = [{ id: 'ds1', tenantId: 't1', name: 'PG Source' }];
    prisma.dataSource.findMany.mockResolvedValue(sources);

    const result = await service.findAll('t1');

    expect(result).toEqual(sources);
  });

  it('should throw NotFoundException when data source not found', async () => {
    prisma.dataSource.findFirst.mockResolvedValue(null);

    await expect(service.findOne('t1', 'bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should create a data source', async () => {
    const created = { id: 'ds1', tenantId: 't1', name: 'New', type: 'POSTGRESQL' };
    prisma.dataSource.create.mockResolvedValue(created);

    const result = await service.create('t1', {
      name: 'New',
      type: 'POSTGRESQL' as const,
      config: { host: 'localhost' },
    });

    expect(result).toEqual(created);
  });

  it('should update a data source', async () => {
    prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId: 't1' });
    prisma.dataSource.update.mockResolvedValue({ id: 'ds1', name: 'Updated' });

    const result = await service.update('t1', 'ds1', { name: 'Updated' });

    expect(result.name).toBe('Updated');
  });

  it('should delete a data source', async () => {
    prisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId: 't1' });
    prisma.dataSource.delete.mockResolvedValue({ id: 'ds1' });

    await service.remove('t1', 'ds1');

    expect(prisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds1' } });
  });
});
