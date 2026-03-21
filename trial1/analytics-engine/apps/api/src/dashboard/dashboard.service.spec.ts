import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from './dashboard.service';

const mockPrisma = {
  dashboard: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  widget: {
    count: vi.fn(),
    createMany: vi.fn(),
  },
};

const mockAuditService = {
  log: vi.fn().mockResolvedValue(undefined),
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DashboardService(mockPrisma as any, mockAuditService as any);
  });

  describe('create', () => {
    it('should create a dashboard in DRAFT status', async () => {
      mockPrisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        name: 'Sales Dashboard',
        status: 'DRAFT',
      });

      const result = await service.create('tenant-1', {
        name: 'Sales Dashboard',
      });

      expect(result.status).toBe('DRAFT');
      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            name: 'Sales Dashboard',
            status: 'DRAFT',
          }),
        }),
      );
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should default gridColumns to 12', async () => {
      mockPrisma.dashboard.create.mockResolvedValue({
        id: 'dash-1',
        gridColumns: 12,
      });

      await service.create('tenant-1', { name: 'Test' });

      expect(mockPrisma.dashboard.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ gridColumns: 12 }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a DRAFT dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'DRAFT',
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        name: 'Updated',
      });

      const result = await service.update('dash-1', 'tenant-1', {
        name: 'Updated',
      });

      expect(result.name).toBe('Updated');
    });

    it('should reject updates to PUBLISHED dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'PUBLISHED',
      });

      await expect(
        service.update('dash-1', 'tenant-1', { name: 'Updated' }),
      ).rejects.toThrow('Cannot edit a published dashboard');
    });
  });

  describe('delete', () => {
    it('should delete a dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'DRAFT',
      });
      mockPrisma.dashboard.delete.mockResolvedValue({});

      await service.delete('dash-1', 'tenant-1');

      expect(mockPrisma.dashboard.delete).toHaveBeenCalledWith({
        where: { id: 'dash-1' },
      });
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should publish a DRAFT dashboard with widgets', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'DRAFT',
      });
      mockPrisma.widget.count.mockResolvedValue(3);
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        status: 'PUBLISHED',
      });

      const result = await service.publish('dash-1', 'tenant-1');

      expect(result.status).toBe('PUBLISHED');
    });

    it('should reject publishing with zero widgets', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'DRAFT',
      });
      mockPrisma.widget.count.mockResolvedValue(0);

      await expect(
        service.publish('dash-1', 'tenant-1'),
      ).rejects.toThrow('Dashboard must have at least 1 widget');
    });

    it('should reject publishing an already PUBLISHED dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'PUBLISHED',
      });

      await expect(
        service.publish('dash-1', 'tenant-1'),
      ).rejects.toThrow('Cannot transition from PUBLISHED to PUBLISHED');
    });

    it('should reject publishing an ARCHIVED dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'ARCHIVED',
      });

      await expect(
        service.publish('dash-1', 'tenant-1'),
      ).rejects.toThrow('Cannot transition from ARCHIVED to PUBLISHED');
    });
  });

  describe('archive', () => {
    it('should archive a PUBLISHED dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'PUBLISHED',
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        status: 'ARCHIVED',
      });

      const result = await service.archive('dash-1', 'tenant-1');

      expect(result.status).toBe('ARCHIVED');
    });

    it('should reject archiving a DRAFT dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'DRAFT',
      });

      await expect(
        service.archive('dash-1', 'tenant-1'),
      ).rejects.toThrow('Cannot transition from DRAFT to ARCHIVED');
    });
  });

  describe('revertToDraft', () => {
    it('should revert PUBLISHED to DRAFT', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'PUBLISHED',
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        status: 'DRAFT',
      });

      const result = await service.revertToDraft('dash-1', 'tenant-1');

      expect(result.status).toBe('DRAFT');
    });

    it('should revert ARCHIVED to DRAFT', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'ARCHIVED',
      });
      mockPrisma.dashboard.update.mockResolvedValue({
        id: 'dash-1',
        status: 'DRAFT',
      });

      const result = await service.revertToDraft('dash-1', 'tenant-1');

      expect(result.status).toBe('DRAFT');
    });

    it('should reject reverting a DRAFT to DRAFT', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'DRAFT',
      });

      await expect(
        service.revertToDraft('dash-1', 'tenant-1'),
      ).rejects.toThrow('Cannot transition from DRAFT to DRAFT');
    });
  });

  describe('duplicate', () => {
    it('should clone dashboard and widgets in DRAFT status', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        name: 'Original',
        description: 'Desc',
        gridColumns: 12,
        widgets: [
          {
            dataSourceId: 'ds-1',
            type: 'BAR_CHART',
            title: 'Widget 1',
            subtitle: null,
            gridColumnStart: 1,
            gridColumnSpan: 6,
            gridRowStart: 1,
            gridRowSpan: 1,
            dimensionField: 'region',
            metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
            dateRangePreset: 'LAST_30_DAYS',
            dateRangeStart: null,
            dateRangeEnd: null,
            groupingPeriod: 'DAILY',
            typeConfig: {},
            sortOrder: 0,
          },
        ],
      });
      mockPrisma.dashboard.create.mockResolvedValue({
        id: 'dash-2',
        name: 'Original (Copy)',
        status: 'DRAFT',
      });
      mockPrisma.widget.createMany.mockResolvedValue({ count: 1 });
      mockPrisma.dashboard.findUniqueOrThrow.mockResolvedValue({
        id: 'dash-2',
        name: 'Original (Copy)',
        status: 'DRAFT',
        widgets: [],
      });

      const result = await service.duplicate('dash-1', 'tenant-1');

      expect(result.name).toBe('Original (Copy)');
      expect(result.status).toBe('DRAFT');
      expect(mockPrisma.widget.createMany).toHaveBeenCalled();
    });
  });

  describe('get', () => {
    it('should return dashboard with widgets', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        widgets: [{ id: 'w-1' }],
        embedConfig: null,
      });

      const result = await service.get('dash-1', 'tenant-1');

      expect(result.id).toBe('dash-1');
      expect(result.widgets).toHaveLength(1);
    });

    it('should throw NotFoundException for missing dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.get('nonexistent', 'tenant-1'),
      ).rejects.toThrow('Dashboard not found');
    });
  });

  describe('list', () => {
    it('should return paginated results', async () => {
      const dashboards = Array.from({ length: 3 }, (_, i) => ({
        id: `dash-${i}`,
        name: `Dashboard ${i}`,
        _count: { widgets: i },
      }));
      mockPrisma.dashboard.findMany.mockResolvedValue(dashboards);

      const result = await service.list('tenant-1', { limit: 20 });

      expect(result.data).toHaveLength(3);
      expect(result.meta.pagination.hasMore).toBe(false);
    });

    it('should detect hasMore when results exceed limit', async () => {
      const dashboards = Array.from({ length: 3 }, (_, i) => ({
        id: `dash-${i}`,
      }));
      mockPrisma.dashboard.findMany.mockResolvedValue(dashboards);

      const result = await service.list('tenant-1', { limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.pagination.hasMore).toBe(true);
      expect(result.meta.pagination.cursor).toBe('dash-1');
    });
  });
});
