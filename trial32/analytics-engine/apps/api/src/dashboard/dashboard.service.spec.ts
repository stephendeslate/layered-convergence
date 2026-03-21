import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  dashboard: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      mockPrismaService.dashboard.create.mockResolvedValue({ id: '1', name: 'Test Dashboard' });

      const result = await service.create({ name: 'Test Dashboard', tenantId: 'tenant-1' });

      expect(result).toEqual({ id: '1', name: 'Test Dashboard' });
    });
  });

  describe('findAll', () => {
    it('should return dashboards for a tenant', async () => {
      mockPrismaService.dashboard.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }]);

      const result = await service.findAll('tenant-1');

      expect(result).toHaveLength(2);
      expect(mockPrismaService.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        include: { widgets: true },
      });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when dashboard not found', async () => {
      mockPrismaService.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('1', 'tenant-1')).rejects.toThrow(NotFoundException);
    });

    it('should return dashboard with widgets', async () => {
      const dashboard = { id: '1', name: 'Test', widgets: [{ id: 'w1' }] };
      mockPrismaService.dashboard.findFirst.mockResolvedValue(dashboard);

      const result = await service.findOne('1', 'tenant-1');

      expect(result).toEqual(dashboard);
    });
  });

  describe('remove', () => {
    it('should delete dashboard after verifying ownership', async () => {
      mockPrismaService.dashboard.findFirst.mockResolvedValue({ id: '1', tenantId: 'tenant-1' });
      mockPrismaService.dashboard.delete.mockResolvedValue({ id: '1' });

      await service.remove('1', 'tenant-1');

      expect(mockPrismaService.dashboard.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
