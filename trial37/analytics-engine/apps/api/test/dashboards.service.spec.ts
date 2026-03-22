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
    it('should generate a slug from the title using slugify', async () => {
      prisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        title: 'Revenue Overview',
        slug: 'revenue-overview',
        tenantId: 'tenant-1',
        createdBy: 'user-1',
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

    it('should sanitize HTML tags from the title', async () => {
      prisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        title: 'Clean Title',
        slug: 'clean-title',
      });

      await service.create('tenant-1', 'user-1', {
        title: '<b>Clean Title</b>',
      });

      expect(prisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Clean Title',
          slug: 'clean-title',
        }),
      });
    });
  });

  describe('findAll', () => {
    it('should return items and total count for the tenant', async () => {
      const mockItems = [{ id: 'dash-1', title: 'Test Dashboard' }];
      prisma.dashboard.findMany.mockResolvedValue(mockItems);
      prisma.dashboard.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1');

      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(1);
      expect(prisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should filter by both id and tenantId for isolation', async () => {
      prisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
      });

      await service.findOne('dash-1', 'tenant-1');

      expect(prisma.dashboard.findFirst).toHaveBeenCalledWith({
        where: { id: 'dash-1', tenantId: 'tenant-1' },
      });
    });

    it('should return null when dashboard belongs to different tenant', async () => {
      prisma.dashboard.findFirst.mockResolvedValue(null);

      const result = await service.findOne('dash-1', 'other-tenant');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should regenerate slug when title is updated', async () => {
      prisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        title: 'New Title',
        slug: 'new-title',
      });

      await service.update('dash-1', { title: 'New Title' });

      expect(prisma.dashboard.update).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
        data: expect.objectContaining({
          title: 'New Title',
          slug: 'new-title',
        }),
      });
    });
  });

  describe('remove', () => {
    it('should delete the dashboard by id', async () => {
      prisma.dashboard.delete.mockResolvedValue({ id: 'dash-1' });

      await service.remove('dash-1');

      expect(prisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
      });
    });
  });
});
