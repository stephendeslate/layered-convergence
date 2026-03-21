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

  it('findAllByTenant returns dashboards with widgets', async () => {
    const dashboards = [
      { id: 'd1', title: 'Sales', tenantId: 't1', widgets: [] },
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

  it('findById returns dashboard when found', async () => {
    const dashboard = { id: 'd1', title: 'Sales', widgets: [] };
    mockPrisma.dashboard.findFirst.mockResolvedValue(dashboard);

    const result = await service.findById('d1');
    expect(result).toEqual(dashboard);
  });

  it('findById throws NotFoundException when not found', async () => {
    mockPrisma.dashboard.findFirst.mockResolvedValue(null);

    await expect(service.findById('missing')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create creates a new dashboard', async () => {
    const created = { id: 'd1', title: 'New Dashboard', tenantId: 't1', userId: 'u1' };
    mockPrisma.dashboard.create.mockResolvedValue(created);

    const result = await service.create({
      title: 'New Dashboard',
      tenantId: 't1',
      userId: 'u1',
    });
    expect(result).toEqual(created);
  });

  it('addWidget creates a widget for a dashboard', async () => {
    const widget = { id: 'w1', type: 'bar_chart', config: '{}', dashboardId: 'd1' };
    mockPrisma.widget.create.mockResolvedValue(widget);

    const result = await service.addWidget('d1', 'bar_chart', '{}');
    expect(result).toEqual(widget);
    expect(mockPrisma.widget.create).toHaveBeenCalledWith({
      data: { type: 'bar_chart', config: '{}', dashboardId: 'd1' },
    });
  });
});
