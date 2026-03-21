import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const mockPrisma = {
  dashboard: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe('DashboardService', () => {
  let service: DashboardService;
  const tenantId = 'tenant-1';

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dashboard scoped to tenant', async () => {
      const dto = { name: 'Sales Dashboard' };
      const expected = { id: '1', tenantId, ...dto, layout: {} };
      mockPrisma.dashboard.create.mockResolvedValue(expected);

      const result = await service.create(tenantId, dto);

      expect(result).toEqual(expected);
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: { name: 'Sales Dashboard', layout: {}, tenantId },
      });
    });
  });

  describe('findAll', () => {
    it('should return dashboards for a tenant', async () => {
      const dashboards = [{ id: '1', tenantId, name: 'Sales' }];
      mockPrisma.dashboard.findMany.mockResolvedValue(dashboards);

      const result = await service.findAll(tenantId);

      expect(result).toEqual(dashboards);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId },
      });
    });
  });

  describe('findById', () => {
    it('should return a dashboard with widgets', async () => {
      const dashboard = { id: '1', tenantId, widgets: [] };
      mockPrisma.dashboard.findUniqueOrThrow.mockResolvedValue(dashboard);

      const result = await service.findById(tenantId, '1');

      expect(result).toEqual(dashboard);
      expect(mockPrisma.dashboard.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '1', tenantId },
        include: { widgets: true },
      });
    });
  });

  describe('update', () => {
    it('should update a dashboard', async () => {
      const dto = { name: 'Updated Dashboard' };
      const expected = { id: '1', ...dto };
      mockPrisma.dashboard.update.mockResolvedValue(expected);

      const result = await service.update(tenantId, '1', dto);

      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delete a dashboard', async () => {
      mockPrisma.dashboard.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove(tenantId, '1');

      expect(result).toEqual({ id: '1' });
    });
  });
});
