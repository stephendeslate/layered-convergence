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
      const created = { id: 'd-1', ...data, widgets: [] };

      mockPrismaService.dashboard.create.mockResolvedValue(created);

      const result = await service.create(data);
      expect(result.name).toBe('Main Dashboard');
    });
  });

  describe('findAll', () => {
    it('should return all dashboards for tenant', async () => {
      mockPrismaService.dashboard.findMany.mockResolvedValue([]);
      const result = await service.findAll('tenant-1');
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return dashboard by id and tenantId', async () => {
      const dashboard = { id: 'd-1', name: 'Test', tenantId: 'tenant-1', widgets: [] };
      mockPrismaService.dashboard.findFirst.mockResolvedValue(dashboard);

      const result = await service.findOne('d-1', 'tenant-1');
      expect(result.id).toBe('d-1');
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      mockPrismaService.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      const dashboard = { id: 'd-1', name: 'Test', tenantId: 'tenant-1' };
      mockPrismaService.dashboard.findFirst.mockResolvedValue(dashboard);
      mockPrismaService.dashboard.delete.mockResolvedValue(dashboard);

      const result = await service.remove('d-1', 'tenant-1');
      expect(result.id).toBe('d-1');
    });
  });
});
