// TRACED:AE-DASHBOARDS-UNIT-TEST
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardsService } from '../src/dashboards/dashboards.service';
import { PrismaService } from '../src/prisma.service';

describe('DashboardsService', () => {
  let service: DashboardsService;
  let prisma: {
    dashboard: {
      create: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DashboardsService>(DashboardsService);
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      const mockDashboard = { id: 'dash-1', name: 'Overview', isPublic: false };
      prisma.dashboard.create.mockResolvedValue(mockDashboard);

      const result = await service.create('tenant-1', 'user-1', {
        name: 'Overview',
      });
      expect(result).toEqual(mockDashboard);
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards', async () => {
      prisma.dashboard.findMany.mockResolvedValue([{ id: 'dash-1' }]);
      prisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1', 1, 20);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by ID', async () => {
      const mockDashboard = { id: 'dash-1', name: 'Overview' };
      prisma.dashboard.findFirst.mockResolvedValue(mockDashboard);

      const result = await service.findOne('dash-1', 'tenant-1');
      expect(result).toEqual(mockDashboard);
    });

    it('should throw NotFoundException if dashboard not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1' });
      prisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        name: 'Updated',
      });

      const result = await service.update('dash-1', 'tenant-1', {
        name: 'Updated',
      });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1' });
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      const result = await service.remove('dash-1', 'tenant-1');
      expect(result.deleted).toBe(true);
    });
  });
});
