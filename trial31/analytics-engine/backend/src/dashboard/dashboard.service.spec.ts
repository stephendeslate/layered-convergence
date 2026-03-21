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
    it('should return dashboards with widgets', async () => {
      const dashboards = [
        { id: 'd1', title: 'Sales', widgets: [] },
      ];
      mockPrisma.dashboard.findMany.mockResolvedValue(dashboards);

      const result = await service.findAllByTenant('t1');
      expect(result).toEqual(dashboards);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't1' },
        include: { widgets: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('should return dashboard when found', async () => {
      const dashboard = { id: 'd1', title: 'Sales', widgets: [] };
      mockPrisma.dashboard.findFirst.mockResolvedValue(dashboard);

      const result = await service.findById('d1');
      expect(result).toEqual(dashboard);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a dashboard', async () => {
      const data = { title: 'New Dashboard', tenantId: 't1', userId: 'u1' };
      mockPrisma.dashboard.create.mockResolvedValue({ id: 'd2', ...data });

      const result = await service.create(data);
      expect(result.title).toBe('New Dashboard');
    });
  });

  describe('addWidget', () => {
    it('should add widget to existing dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'd1',
        title: 'Sales',
        widgets: [],
      });
      mockPrisma.widget.create.mockResolvedValue({
        id: 'w1',
        type: 'bar_chart',
        config: '{}',
        dashboardId: 'd1',
      });

      const result = await service.addWidget('d1', 'bar_chart', '{}');
      expect(result.type).toBe('bar_chart');
    });

    it('should throw NotFoundException for missing dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.addWidget('missing', 'bar_chart', '{}'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
