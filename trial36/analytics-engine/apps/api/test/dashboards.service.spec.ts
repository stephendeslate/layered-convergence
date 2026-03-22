import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DashboardsService } from '../src/dashboards/dashboards.service';
import { PrismaService } from '../src/prisma.service';

const mockPrisma = {
  dashboard: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('DashboardsService', () => {
  let service: DashboardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<DashboardsService>(DashboardsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated dashboards', async () => {
      const dashboards = [
        { id: 'd-1', name: 'Dashboard 1', tenantId: 'tenant-1' },
        { id: 'd-2', name: 'Dashboard 2', tenantId: 'tenant-1' },
      ];
      mockPrisma.dashboard.findMany.mockResolvedValue(dashboards);
      mockPrisma.dashboard.count.mockResolvedValue(2);

      const result = await service.findAll('tenant-1');

      expect(result.data).toEqual(dashboards);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should respect MAX_PAGE_SIZE limit', async () => {
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      mockPrisma.dashboard.count.mockResolvedValue(0);

      await service.findAll('tenant-1', 1, 500);

      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a dashboard when found', async () => {
      const dashboard = { id: 'd-1', name: 'Test', tenantId: 'tenant-1' };
      mockPrisma.dashboard.findFirst.mockResolvedValue(dashboard);

      const result = await service.findOne('d-1', 'tenant-1');
      expect(result).toEqual(dashboard);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'tenant-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a dashboard with sanitized input', async () => {
      const created = {
        id: 'd-1',
        name: 'Clean Name',
        tenantId: 'tenant-1',
        createdById: 'user-1',
      };
      mockPrisma.dashboard.create.mockResolvedValue(created);

      const result = await service.create('tenant-1', 'user-1', {
        name: '<b>Clean Name</b>',
        description: '<script>xss</script>Safe description',
      });

      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Clean Name',
          description: 'xssSafe description',
        }),
      });
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update an existing dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'd-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'd-1',
        name: 'Updated',
      });

      const result = await service.update('d-1', 'tenant-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete an existing dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'd-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.dashboard.delete.mockResolvedValue({ id: 'd-1' });

      await service.remove('d-1', 'tenant-1');
      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: 'd-1' },
      });
    });
  });
});
