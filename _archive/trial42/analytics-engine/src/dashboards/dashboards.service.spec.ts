import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardsService } from './dashboards.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DashboardsService', () => {
  let service: DashboardsService;
  let prisma: any;

  const mockDashboard = {
    id: 'dash-1',
    tenantId: 'tenant-1',
    name: 'Test Dashboard',
    layout: null,
    isPublished: false,
    widgets: [],
  };

  beforeEach(async () => {
    prisma = {
      dashboard: {
        create: vi.fn().mockResolvedValue(mockDashboard),
        findMany: vi.fn().mockResolvedValue([mockDashboard]),
        findUnique: vi.fn(),
        update: vi.fn().mockResolvedValue(mockDashboard),
        delete: vi.fn().mockResolvedValue(mockDashboard),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      const result = await service.create({ tenantId: 'tenant-1', name: 'Test Dashboard' });
      expect(result).toEqual(mockDashboard);
    });

    it('should default isPublished to false', async () => {
      await service.create({ tenantId: 'tenant-1', name: 'Test' });
      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isPublished: false }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return dashboards for a tenant', async () => {
      const result = await service.findAll('tenant-1');
      expect(result).toHaveLength(1);
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('findById', () => {
    it('should return dashboard when found', async () => {
      prisma.dashboard.findUnique.mockResolvedValue(mockDashboard);
      const result = await service.findById('dash-1');
      expect(result.id).toBe('dash-1');
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dashboard.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update dashboard', async () => {
      await service.update('dash-1', { name: 'Updated' });
      expect(prisma.dashboard.update).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
        data: { name: 'Updated' },
      });
    });
  });

  describe('remove', () => {
    it('should delete dashboard', async () => {
      await service.remove('dash-1');
      expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
    });
  });
});
