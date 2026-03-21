import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSourceService } from './datasource.service.js';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  dataSource: {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  dataSourceConfig: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

describe('DataSourceService', () => {
  let service: DataSourceService;
  const tenantId = 'tenant-uuid';

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DataSourceService(mockPrisma as any);
  });

  describe('create', () => {
    it('should create a data source', async () => {
      mockPrisma.dataSource.create.mockResolvedValue({
        id: 'ds-1',
        name: 'PG Source',
        type: 'POSTGRESQL',
      });
      const result = await service.create(tenantId, {
        name: 'PG Source',
        type: 'POSTGRESQL' as any,
      });
      expect(result.name).toBe('PG Source');
    });
  });

  describe('findAll', () => {
    it('should return all data sources for tenant', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([{ id: 'ds-1' }]);
      const result = await service.findAll(tenantId);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return data source scoped by tenant', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      const result = await service.findOne(tenantId, 'ds-1');
      expect(result.id).toBe('ds-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.findOne(tenantId, 'x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      mockPrisma.dataSource.update.mockResolvedValue({
        id: 'ds-1',
        name: 'Updated',
      });
      const result = await service.update(tenantId, 'ds-1', {
        name: 'Updated',
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      mockPrisma.dataSource.delete.mockResolvedValue({ id: 'ds-1' });
      const result = await service.remove(tenantId, 'ds-1');
      expect(result.id).toBe('ds-1');
    });
  });

  describe('createConfig', () => {
    it('should create config for data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      mockPrisma.dataSourceConfig.create.mockResolvedValue({
        id: 'cfg-1',
        dataSourceId: 'ds-1',
      });
      const result = await service.createConfig(tenantId, 'ds-1', {
        connectionConfig: {},
        fieldMapping: {},
        transformSteps: [],
      });
      expect(result.dataSourceId).toBe('ds-1');
    });
  });

  describe('updateConfig', () => {
    it('should update existing config', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue({
        id: 'cfg-1',
        dataSourceId: 'ds-1',
      });
      mockPrisma.dataSourceConfig.update.mockResolvedValue({
        id: 'cfg-1',
        connectionConfig: { host: 'new' },
      });
      const result = await service.updateConfig(tenantId, 'ds-1', {
        connectionConfig: { host: 'new' },
      });
      expect(result.connectionConfig).toEqual({ host: 'new' });
    });

    it('should throw NotFoundException if config not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue(null);
      await expect(
        service.updateConfig(tenantId, 'ds-1', { connectionConfig: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
