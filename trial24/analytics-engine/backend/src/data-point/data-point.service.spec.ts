import { Test, TestingModule } from '@nestjs/testing';
import { DataPointService } from './data-point.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  dataPoint: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DataPointService', () => {
  let service: DataPointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataPointService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DataPointService>(DataPointService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a data point with Decimal value', async () => {
      const data = { value: '42.123456', label: 'Temperature', dataSourceId: 'ds-1', tenantId: 'tenant-1' };
      const created = { id: 'dp-1', ...data };

      mockPrismaService.dataPoint.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result.label).toBe('Temperature');
    });
  });

  describe('findAll', () => {
    it('should return all data points for tenant', async () => {
      mockPrismaService.dataPoint.findMany.mockResolvedValue([]);
      const result = await service.findAll('tenant-1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return data point by id and tenantId', async () => {
      const dp = { id: 'dp-1', value: '42.0', label: 'Test', tenantId: 'tenant-1' };
      mockPrismaService.dataPoint.findFirst.mockResolvedValue(dp);

      const result = await service.findOne('dp-1', 'tenant-1');
      expect(result.id).toBe('dp-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.dataPoint.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByDataSource', () => {
    it('should return data points filtered by data source', async () => {
      mockPrismaService.dataPoint.findMany.mockResolvedValue([]);
      const result = await service.findByDataSource('ds-1', 'tenant-1');
      expect(result).toEqual([]);
      expect(mockPrismaService.dataPoint.findMany).toHaveBeenCalledWith({
        where: { dataSourceId: 'ds-1', tenantId: 'tenant-1' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a data point', async () => {
      const dp = { id: 'dp-1', label: 'Test', tenantId: 'tenant-1' };
      mockPrismaService.dataPoint.findFirst.mockResolvedValue(dp);
      mockPrismaService.dataPoint.delete.mockResolvedValue(dp);

      const result = await service.remove('dp-1', 'tenant-1');
      expect(result.id).toBe('dp-1');
    });
  });
});
