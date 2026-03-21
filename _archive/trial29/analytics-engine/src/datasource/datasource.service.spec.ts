import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSourceService } from './datasource.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

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
  const tenantId = 'tenant-uuid-1';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(DataSourceService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a data source for a tenant', async () => {
      const dto = { name: 'PG Source', type: 'POSTGRESQL' as const };
      mockPrisma.dataSource.create.mockResolvedValue({ id: 'ds1', tenantId, ...dto });

      const result = await service.create(tenantId, dto);
      expect(mockPrisma.dataSource.create).toHaveBeenCalledWith({
        data: { ...dto, tenantId },
      });
      expect(result.id).toBe('ds1');
    });
  });

  describe('findAll', () => {
    it('should return data sources for a tenant with config', async () => {
      mockPrisma.dataSource.findMany.mockResolvedValue([{ id: 'ds1', config: null }]);

      const result = await service.findAll(tenantId);
      expect(mockPrisma.dataSource.findMany).toHaveBeenCalledWith({
        where: { tenantId },
        include: { config: true },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a data source scoped by tenant', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId });

      const result = await service.findOne(tenantId, 'ds1');
      expect(result.id).toBe('ds1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne(tenantId, 'missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId });
      mockPrisma.dataSource.update.mockResolvedValue({ id: 'ds1', name: 'Updated' });

      const result = await service.update(tenantId, 'ds1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId });
      mockPrisma.dataSource.delete.mockResolvedValue({ id: 'ds1' });

      await service.remove(tenantId, 'ds1');
      expect(mockPrisma.dataSource.delete).toHaveBeenCalledWith({
        where: { id: 'ds1' },
      });
    });
  });

  describe('createConfig', () => {
    it('should create a config for a data source', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId });
      const dto = {
        connectionConfig: { host: 'localhost' },
        fieldMapping: {},
        transformSteps: [],
      };
      mockPrisma.dataSourceConfig.create.mockResolvedValue({
        id: 'cfg1',
        dataSourceId: 'ds1',
        ...dto,
      });

      const result = await service.createConfig(tenantId, 'ds1', dto);
      expect(result.dataSourceId).toBe('ds1');
    });
  });

  describe('updateConfig', () => {
    it('should update a data source config', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId });
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue({
        id: 'cfg1',
        dataSourceId: 'ds1',
      });
      mockPrisma.dataSourceConfig.update.mockResolvedValue({
        id: 'cfg1',
        syncSchedule: '0 * * * *',
      });

      const result = await service.updateConfig(tenantId, 'ds1', {
        syncSchedule: '0 * * * *',
      });
      expect(result.syncSchedule).toBe('0 * * * *');
    });

    it('should throw NotFoundException if config not found', async () => {
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds1', tenantId });
      mockPrisma.dataSourceConfig.findFirst.mockResolvedValue(null);

      await expect(
        service.updateConfig(tenantId, 'ds1', { syncSchedule: '0 * * * *' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
