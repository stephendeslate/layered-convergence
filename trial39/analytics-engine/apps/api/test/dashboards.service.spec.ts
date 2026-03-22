// TRACED:AE-TEST-02 — Dashboard service unit tests

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardsService } from '../src/dashboards/dashboards.service';
import { PrismaService } from '../src/prisma/prisma.service';

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
    it('should create a dashboard with select fields', async () => {
      const dto = {
        title: 'Sales Dashboard',
        description: 'Tracks Q1 sales metrics',
        tenantId: 'tenant-1',
        createdById: 'user-1',
      };
      const created = { id: 'dash-1', ...dto, isPublic: false, createdAt: new Date() };
      prisma.dashboard.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result.id).toBe('dash-1');
      expect(prisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({ select: expect.any(Object) }),
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated results with meta', async () => {
      prisma.dashboard.findMany.mockResolvedValue([{ id: 'dash-1', title: 'Test' }]);
      prisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, pageSize: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by tenantId when provided', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      await service.findAll({ page: 1, pageSize: 10, tenantId: 'tenant-1' });

      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return dashboard with relations', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        title: 'Test',
        createdBy: { id: 'user-1', displayName: 'Admin' },
        reports: [],
      });

      const result = await service.findOne('dash-1');

      expect(result.id).toBe('dash-1');
      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ include: expect.any(Object) }),
      );
    });

    it('should throw NotFoundException when not found', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the dashboard', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({ id: 'dash-1' });
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      await service.remove('dash-1');

      expect(prisma.dashboard.delete).toHaveBeenCalledWith({ where: { id: 'dash-1' } });
    });
  });
});
