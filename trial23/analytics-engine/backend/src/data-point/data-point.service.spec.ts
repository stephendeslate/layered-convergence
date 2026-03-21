import { Test, TestingModule } from '@nestjs/testing';
import { DataPointService } from './data-point.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  dataPoint: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
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
    it('should create a data point with decimal value', async () => {
      const data = { value: '99.123456', label: 'Revenue', dataSourceId: 'ds-1', tenantId: 'tenant-1' };
      const created = { id: 'dp-1', ...data };

      mockPrismaService.dataPoint.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result).toEqual(created);
      expect(mockPrismaService.dataPoint.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return data points for tenant', async () => {
      const points = [{ id: 'dp-1', label: 'Test', tenantId: 'tenant-1' }];
      mockPrismaService.dataPoint.findMany.mockResolvedValue(points);

      const result = await service.findAll('tenant-1');
      expect(result).toEqual(points);
    });
  });

  describe('findOne', () => {
    it('should return data point when found', async () => {
      const point = { id: 'dp-1', label: 'Test', tenantId: 'tenant-1' };
      mockPrismaService.dataPoint.findFirst.mockResolvedValue(point);

      const result = await service.findOne('dp-1', 'tenant-1');
      expect(result).toEqual(point);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.dataPoint.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update data point', async () => {
      const point = { id: 'dp-1', label: 'Old', tenantId: 'tenant-1' };
      mockPrismaService.dataPoint.findFirst.mockResolvedValue(point);
      mockPrismaService.dataPoint.update.mockResolvedValue({ ...point, label: 'New' });

      const result = await service.update('dp-1', 'tenant-1', { label: 'New' });
      expect(result.label).toBe('New');
    });
  });

  describe('remove', () => {
    it('should delete data point', async () => {
      const point = { id: 'dp-1', tenantId: 'tenant-1' };
      mockPrismaService.dataPoint.findFirst.mockResolvedValue(point);
      mockPrismaService.dataPoint.delete.mockResolvedValue(point);

      await service.remove('dp-1', 'tenant-1');
      expect(mockPrismaService.dataPoint.delete).toHaveBeenCalledWith({ where: { id: 'dp-1' } });
    });
  });
});
