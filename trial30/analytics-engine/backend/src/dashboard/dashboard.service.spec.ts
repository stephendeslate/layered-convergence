import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma.service';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockPrisma = {
    dashboard: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    widget: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByTenant', () => {
    it('should return dashboards with widgets for a tenant', async () => {
      const dashboards = [
        { id: 'd1', title: 'Sales', widgets: [] },
        { id: 'd2', title: 'Marketing', widgets: [{ id: 'w1' }] },
      ];
      mockPrisma.dashboard.findMany.mockResolvedValue(dashboards);

      const result = await service.findAllByTenant('tenant-1');

      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' },
        include: { widgets: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should return dashboard with widgets', async () => {
      const dashboard = { id: 'd1', title: 'Sales', widgets: [] };
      mockPrisma.dashboard.findFirst.mockResolvedValue(dashboard);

      const result = await service.findById('d1');

      expect(result).toEqual(dashboard);
    });

    it('should throw NotFoundException when dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      const created = { id: 'd1', title: 'New Dashboard' };
      mockPrisma.dashboard.create.mockResolvedValue(created);

      const result = await service.create({
        title: 'New Dashboard',
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      expect(result).toEqual(created);
    });
  });

  describe('addWidget', () => {
    it('should create a widget for a dashboard', async () => {
      const widget = { id: 'w1', type: 'bar_chart', dashboardId: 'd1' };
      mockPrisma.widget.create.mockResolvedValue(widget);

      const result = await service.addWidget('d1', 'bar_chart', '{"metric":"revenue"}');

      expect(mockPrisma.widget.create).toHaveBeenCalledWith({
        data: {
          type: 'bar_chart',
          config: '{"metric":"revenue"}',
          dashboardId: 'd1',
        },
      });
      expect(result).toEqual(widget);
    });
  });
});
