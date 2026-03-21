import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WidgetService } from './widget.service';

const mockPrisma = {
  dashboard: {
    findFirst: vi.fn(),
  },
  widget: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  dataSource: {
    findFirst: vi.fn(),
  },
  $transaction: vi.fn(),
};

const mockAuditService = {
  log: vi.fn().mockResolvedValue(undefined),
};

const mockQueryService = {
  executeQuery: vi.fn(),
};

describe('WidgetService', () => {
  let service: WidgetService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WidgetService(
      mockPrisma as any,
      mockAuditService as any,
      mockQueryService as any,
    );
  });

  describe('create', () => {
    const dto = {
      dataSourceId: 'ds-1',
      type: 'BAR_CHART',
      title: 'Revenue by Region',
      dimensionField: 'region',
      metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
    };

    it('should create a widget on a DRAFT dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'DRAFT',
      });
      mockPrisma.widget.count.mockResolvedValue(0);
      mockPrisma.dataSource.findFirst.mockResolvedValue({ id: 'ds-1' });
      mockPrisma.widget.create.mockResolvedValue({
        id: 'w-1',
        ...dto,
        sortOrder: 0,
      });

      const result = await service.create('dash-1', 'tenant-1', dto as any);

      expect(result.id).toBe('w-1');
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should reject adding widget to PUBLISHED dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'PUBLISHED',
      });

      await expect(
        service.create('dash-1', 'tenant-1', dto as any),
      ).rejects.toThrow('Cannot add widgets to a published dashboard');
    });

    it('should reject when dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.create('nonexistent', 'tenant-1', dto as any),
      ).rejects.toThrow('Dashboard not found');
    });

    it('should enforce 20-widget limit', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'DRAFT',
      });
      mockPrisma.widget.count.mockResolvedValue(20);

      await expect(
        service.create('dash-1', 'tenant-1', dto as any),
      ).rejects.toThrow('Maximum 20 widgets per dashboard');
    });

    it('should reject when data source not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
        status: 'DRAFT',
      });
      mockPrisma.widget.count.mockResolvedValue(0);
      mockPrisma.dataSource.findFirst.mockResolvedValue(null);

      await expect(
        service.create('dash-1', 'tenant-1', dto as any),
      ).rejects.toThrow('Data source not found');
    });
  });

  describe('update', () => {
    it('should update a widget on a DRAFT dashboard', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({
        id: 'w-1',
        dashboardId: 'dash-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        status: 'DRAFT',
      });
      mockPrisma.widget.update.mockResolvedValue({
        id: 'w-1',
        title: 'Updated Title',
      });

      const result = await service.update('w-1', 'dash-1', 'tenant-1', {
        title: 'Updated Title',
      } as any);

      expect(result.title).toBe('Updated Title');
    });

    it('should reject updates on PUBLISHED dashboard', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({
        id: 'w-1',
        dashboardId: 'dash-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        status: 'PUBLISHED',
      });

      await expect(
        service.update('w-1', 'dash-1', 'tenant-1', {
          title: 'Updated',
        } as any),
      ).rejects.toThrow('Cannot edit widgets on a published dashboard');
    });
  });

  describe('delete', () => {
    it('should delete a widget', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({
        id: 'w-1',
        dashboardId: 'dash-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.widget.delete.mockResolvedValue({});

      await service.delete('w-1', 'dash-1', 'tenant-1');

      expect(mockPrisma.widget.delete).toHaveBeenCalledWith({
        where: { id: 'w-1' },
      });
    });

    it('should throw when widget not found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(
        service.delete('nonexistent', 'dash-1', 'tenant-1'),
      ).rejects.toThrow('Widget not found');
    });
  });

  describe('reorder', () => {
    it('should update sort order for multiple widgets', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.$transaction.mockResolvedValue([]);

      await service.reorder('dash-1', 'tenant-1', [
        { id: 'w-1', sortOrder: 2 },
        { id: 'w-2', sortOrder: 0 },
        { id: 'w-3', sortOrder: 1 },
      ]);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should throw when dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.reorder('nonexistent', 'tenant-1', []),
      ).rejects.toThrow('Dashboard not found');
    });
  });

  describe('getData', () => {
    it('should delegate to QueryService with widget config', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({
        id: 'w-1',
        tenantId: 'tenant-1',
        dataSourceId: 'ds-1',
        dimensionField: 'region',
        metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
        dateRangePreset: 'LAST_30_DAYS',
        dateRangeStart: null,
        dateRangeEnd: null,
        groupingPeriod: 'DAILY',
      });
      mockQueryService.executeQuery.mockResolvedValue({
        labels: ['US', 'EU'],
        series: [{ name: 'revenue (sum)', data: [1500, 2300] }],
        meta: { totalRows: 2, queryTime: 15, fromCache: false },
      });

      const result = await service.getData('w-1', 'tenant-1', 'FREE');

      expect(result.labels).toEqual(['US', 'EU']);
      expect(mockQueryService.executeQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          widgetId: 'w-1',
          dataSourceId: 'ds-1',
          dimensionField: 'region',
          groupingPeriod: 'DAILY',
        }),
        'FREE',
      );
    });

    it('should apply filter overrides', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue({
        id: 'w-1',
        tenantId: 'tenant-1',
        dataSourceId: 'ds-1',
        dimensionField: 'date',
        metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
        dateRangePreset: 'LAST_30_DAYS',
        dateRangeStart: null,
        dateRangeEnd: null,
        groupingPeriod: 'DAILY',
      });
      mockQueryService.executeQuery.mockResolvedValue({
        labels: [],
        series: [],
        meta: { totalRows: 0, queryTime: 5, fromCache: false },
      });

      await service.getData('w-1', 'tenant-1', 'PRO', {
        dateStart: '2026-03-01',
        dateEnd: '2026-03-15',
      });

      expect(mockQueryService.executeQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: expect.objectContaining({
            start: expect.any(Date),
            end: expect.any(Date),
          }),
        }),
        'PRO',
      );
    });

    it('should throw when widget not found', async () => {
      mockPrisma.widget.findFirst.mockResolvedValue(null);

      await expect(
        service.getData('nonexistent', 'tenant-1', 'FREE'),
      ).rejects.toThrow('Widget not found');
    });
  });
});
