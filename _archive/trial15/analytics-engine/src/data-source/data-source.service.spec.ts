import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './data-source.service';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let mockPrisma: any;

  const mockDs = {
    id: 'ds-1',
    tenantId: 'tenant-1',
    name: 'Test Source',
    type: 'api',
    status: 'IDLE',
  };

  beforeEach(() => {
    mockPrisma = {
      dataSource: {
        create: vi.fn().mockResolvedValue(mockDs),
        findMany: vi.fn().mockResolvedValue([mockDs]),
        findUnique: vi.fn().mockResolvedValue(mockDs),
        update: vi.fn().mockResolvedValue({ ...mockDs, name: 'Updated' }),
        delete: vi.fn().mockResolvedValue(mockDs),
      },
    };
    service = new DataSourceService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a data source', async () => {
    const result = await service.create('tenant-1', { name: 'Test Source', type: 'api' });
    expect(result).toEqual(mockDs);
    expect(mockPrisma.dataSource.create).toHaveBeenCalledWith({
      data: { tenantId: 'tenant-1', name: 'Test Source', type: 'api' },
    });
  });

  it('should find all data sources for a tenant', async () => {
    const result = await service.findAll('tenant-1');
    expect(result).toHaveLength(1);
    expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      include: { config: true },
    });
  });

  it('should find one data source by id', async () => {
    const result = await service.findOne('tenant-1', 'ds-1');
    expect(result.id).toBe('ds-1');
  });

  it('should throw NotFoundException when data source not found', async () => {
    mockPrisma.dataSource.findUnique.mockResolvedValue(null);
    await expect(service.findOne('tenant-1', 'ds-999')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException when tenant does not own data source', async () => {
    await expect(service.findOne('other-tenant', 'ds-1')).rejects.toThrow(NotFoundException);
  });

  it('should update a data source', async () => {
    const result = await service.update('tenant-1', 'ds-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a data source', async () => {
    const result = await service.remove('tenant-1', 'ds-1');
    expect(result).toEqual(mockDs);
    expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
  });
});
