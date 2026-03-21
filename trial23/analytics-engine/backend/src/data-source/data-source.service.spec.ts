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
      const data = { name: 'PostgreSQL', type: 'database', tenantId: 'tenant-1' };
      const created = { id: 'ds-1', ...data, config: {} };

      mockPrismaService.dataSource.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return data sources for tenant', async () => {
      const sources = [{ id: 'ds-1', name: 'DS1', tenantId: 'tenant-1' }];
      mockPrismaService.dataSource.findMany.mockResolvedValue(sources);

      const result = await service.findAll('tenant-1');
      expect(result).toEqual(sources);
    });
  });

  describe('findOne', () => {
    it('should return data source when found', async () => {
      const source = { id: 'ds-1', name: 'DS1', tenantId: 'tenant-1' };
      mockPrismaService.dataSource.findFirst.mockResolvedValue(source);

      const result = await service.findOne('ds-1', 'tenant-1');
      expect(result).toEqual(source);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.dataSource.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update data source', async () => {
      const source = { id: 'ds-1', name: 'Old', tenantId: 'tenant-1' };
      mockPrismaService.dataSource.findFirst.mockResolvedValue(source);
      mockPrismaService.dataSource.update.mockResolvedValue({ ...source, name: 'New' });

      const result = await service.update('ds-1', 'tenant-1', { name: 'New' });
      expect(result.name).toBe('New');
    });
  });

  describe('remove', () => {
    it('should delete data source', async () => {
      const source = { id: 'ds-1', tenantId: 'tenant-1' };
      mockPrismaService.dataSource.findFirst.mockResolvedValue(source);
      mockPrismaService.dataSource.delete.mockResolvedValue(source);

      await service.remove('ds-1', 'tenant-1');
      expect(mockPrismaService.dataSource.delete).toHaveBeenCalledWith({ where: { id: 'ds-1' } });
    });
  });
});
