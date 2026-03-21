import { DataSourceService } from './datasource.service.js';
import { NotFoundException } from '@nestjs/common';

describe('DataSourceService', () => {
  let service: DataSourceService;
  let mockPrisma: any;
  const tenantId = 'tenant-1';

  beforeEach(() => {
    mockPrisma = {
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
    service = new DataSourceService(mockPrisma);
  });

  describe('create', () => {
    it('should create a data source', async () => {
      mockPrisma.dataSource.create.mockResolvedValue({ id: '1', tenantId });
      const result = await service.create(tenantId, {
        name: 'Test',
        type: 'POSTGRESQL' as any,
      });
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return data sources for tenant', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([]);
      const result = await service.findAll(tenantId);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: '1',
        tenantId,
      });
      const result = await service.findOne(tenantId, '1');
      expect(result.id).toBe('1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);
      await expect(service.findOne(tenantId, 'x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createConfig', () => {
    it('should create a config for a data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: '1',
        tenantId,
      });
      mockPrisma.dataSourceConfig.create.mockResolvedValue({ id: 'c1' });
      const result = await service.createConfig(tenantId, '1', {
        connectionConfig: {},
        fieldMapping: {},
        transformSteps: {},
      });
      expect(result).toBeDefined();
    });
  });

  describe('updateConfig', () => {
    it('should update a config', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: '1',
        tenantId,
      });
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue({ id: 'c1' });
      mockPrisma.dataSourceConfig.update.mockResolvedValue({ id: 'c1' });
      const result = await service.updateConfig(tenantId, '1', {
        connectionConfig: { host: 'new' },
      });
      expect(result).toBeDefined();
    });

    it('should throw if config not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({
        id: '1',
        tenantId,
      });
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue(null);
      await expect(
        service.updateConfig(tenantId, '1', { connectionConfig: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
