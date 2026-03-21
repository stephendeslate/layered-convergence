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
      const data = { name: 'Main Dashboard', tenantId: 'tenant-1' };
      const created = { id: 'dash-1', ...data };

      mockPrismaService.dashboard.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return dashboards for tenant only', async () => {
      const dashboards = [{ id: 'dash-1', name: 'D1', tenantId: 'tenant-1' }];
      mockPrismaService.dashboard.findMany.mockResolvedValue(dashboards);

      const result = await service.findAll('tenant-1');
      expect(result).toEqual(dashboards);
      expect(mockPrismaService.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        include: { widgets: true },
      });
    });

    it('should return empty array when no dashboards', async () => {
      mockPrismaService.dashboard.findMany.mockResolvedValue([]);

      const result = await service.findAll('tenant-2');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return dashboard with tenant isolation', async () => {
      const dashboard = { id: 'dash-1', name: 'D1', tenantId: 'tenant-1', widgets: [] };
      mockPrismaService.dashboard.findFirst.mockResolvedValue(dashboard);

      const result = await service.findOne('dash-1', 'tenant-1');
      expect(result).toEqual(dashboard);
    });

    it('should throw NotFoundException for wrong tenant', async () => {
      mockPrismaService.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('dash-1', 'wrong-tenant')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update dashboard name', async () => {
      const dashboard = { id: 'dash-1', name: 'Old', tenantId: 'tenant-1', widgets: [] };
      mockPrismaService.dashboard.findFirst.mockResolvedValue(dashboard);
      mockPrismaService.dashboard.update.mockResolvedValue({ ...dashboard, name: 'New' });

      const result = await service.update('dash-1', 'tenant-1', { name: 'New' });
      expect(result.name).toBe('New');
    });
  });

  describe('remove', () => {
    it('should delete dashboard', async () => {
      const dashboard = { id: 'dash-1', tenantId: 'tenant-1', widgets: [] };
      mockPrismaService.dashboard.findFirst.mockResolvedValue(dashboard);
      mockPrismaService.dashboard.delete.mockResolvedValue(dashboard);

      await service.remove('dash-1', 'tenant-1');
      expect(mockPrismaService.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
    });
  });
});
