// TRACED: AE-TEST-03
import { Test, TestingModule } from '@nestjs/testing';
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
    it('should create a dashboard with slugified title', async () => {
      prisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        title: 'Revenue Overview',
        slug: 'revenue-overview',
        tenantId: 'tenant-1',
      });

      await service.create('tenant-1', 'user-1', {
        title: 'Revenue Overview',
      });

      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Revenue Overview',
          slug: 'revenue-overview',
          tenantId: 'tenant-1',
          createdBy: 'user-1',
        }),
      });
    });

    it('should sanitize title input', async () => {
      prisma.dashboard.create.mockResolvedValue({
        id: 'dash-2',
        title: 'Clean Title',
        slug: 'clean-title',
        tenantId: 'tenant-1',
      });

      await service.create('tenant-1', 'user-1', {
        title: '<script>alert("xss")</script>Clean Title',
      });

      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: expect.not.stringContaining('<script>'),
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated dashboards for a tenant', async () => {
      const mockDashboards = [
        { id: 'dash-1', title: 'Dashboard 1' },
        { id: 'dash-2', title: 'Dashboard 2' },
      ];
      prisma.dashboard.findMany.mockResolvedValue(mockDashboards);
      prisma.dashboard.count.mockResolvedValue(2);

      const result = await service.findAll('tenant-1');

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should clamp page size to MAX_PAGE_SIZE', async () => {
      prisma.dashboard.findMany.mockResolvedValue([]);
      prisma.dashboard.count.mockResolvedValue(0);

      await service.findAll('tenant-1', 1, 500);

      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dashboard by id and tenantId', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
      });

      const result = await service.findOne('dash-1', 'tenant-1');

      expect(result).toBeDefined();
      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'dash-1', tenantId: 'tenant-1' },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update dashboard fields', async () => {
      prisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        title: 'Updated Title',
      });

      await service.update('dash-1', { title: 'Updated Title' });

      expect(prisma.dashboard.update).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
        data: expect.objectContaining({
          title: 'Updated Title',
        }),
      });
    });
  });

  describe('remove', () => {
    it('should delete a dashboard by id', async () => {
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      await service.remove('dash-1');

      expect(prisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
      });
    });
  });
});
