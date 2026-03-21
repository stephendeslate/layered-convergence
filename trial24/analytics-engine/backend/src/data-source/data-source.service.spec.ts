import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceService } from './data-source.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  dataSource: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DataSourceService', () => {
  let service: DataSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a data source', async () => {
      const data = { name: 'PostgreSQL DB', type: 'postgresql', tenantId: 'tenant-1' };
      const created = { id: 'ds-1', ...data, config: {} };

      mockPrismaService.dataSource.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result.name).toBe('PostgreSQL DB');
      expect(result.type).toBe('postgresql');
    });
  });

  describe('findAll', () => {
    it('should return all data sources for tenant', async () => {
      mockPrismaService.dataSource.findMany.mockResolvedValue([]);
      const result = await service.findAll('tenant-1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return data source by id and tenantId', async () => {
      const ds = { id: 'ds-1', name: 'Test', type: 'api', tenantId: 'tenant-1' };
      mockPrismaService.dataSource.findFirst.mockResolvedValue(ds);

      const result = await service.findOne('ds-1', 'tenant-1');
      expect(result.id).toBe('ds-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a data source', async () => {
      const ds = { id: 'ds-1', name: 'Test', type: 'api', tenantId: 'tenant-1' };
      mockPrismaService.dataSource.findFirst.mockResolvedValue(ds);
      mockPrismaService.dataSource.update.mockResolvedValue({ ...ds, name: 'Updated' });

      const result = await service.update('ds-1', 'tenant-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a data source', async () => {
      const ds = { id: 'ds-1', name: 'Test', tenantId: 'tenant-1' };
      mockPrismaService.dataSource.findFirst.mockResolvedValue(ds);
      mockPrismaService.dataSource.delete.mockResolvedValue(ds);

      const result = await service.remove('ds-1', 'tenant-1');
      expect(result.id).toBe('ds-1');
    });
  });
});
