import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmbedService } from './embed.service';

const mockPrisma = {
  dashboard: {
    findFirst: vi.fn(),
  },
  embedConfig: {
    create: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  tenant: {
    findUnique: vi.fn(),
  },
};

const mockAuditService = {
  log: vi.fn().mockResolvedValue(undefined),
};

describe('EmbedService', () => {
  let service: EmbedService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmbedService(mockPrisma as any, mockAuditService as any);
  });

  describe('createEmbedConfig', () => {
    it('should create an embed config for a valid dashboard', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.embedConfig.findUnique.mockResolvedValue(null);
      mockPrisma.embedConfig.create.mockResolvedValue({
        id: 'embed-1',
        dashboardId: 'dash-1',
        tenantId: 'tenant-1',
        allowedOrigins: ['https://example.com'],
        isEnabled: true,
      });

      const result = await service.createEmbedConfig('tenant-1', {
        dashboardId: 'dash-1',
        allowedOrigins: ['https://example.com'],
        isEnabled: true,
      });

      expect(result.id).toBe('embed-1');
      expect(result.allowedOrigins).toEqual(['https://example.com']);
      expect(mockAuditService.log).toHaveBeenCalled();
    });

    it('should reject origins without protocol', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.embedConfig.findUnique.mockResolvedValue(null);

      await expect(
        service.createEmbedConfig('tenant-1', {
          dashboardId: 'dash-1',
          allowedOrigins: ['example.com'],
        }),
      ).rejects.toThrow('must include protocol');
    });

    it('should reject if dashboard not found', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue(null);

      await expect(
        service.createEmbedConfig('tenant-1', {
          dashboardId: 'nonexistent',
          allowedOrigins: ['https://example.com'],
        }),
      ).rejects.toThrow('Dashboard not found');
    });

    it('should reject if embed config already exists', async () => {
      mockPrisma.dashboard.findFirst.mockResolvedValue({
        id: 'dash-1',
        tenantId: 'tenant-1',
      });
      mockPrisma.embedConfig.findUnique.mockResolvedValue({
        id: 'embed-1',
      });

      await expect(
        service.createEmbedConfig('tenant-1', {
          dashboardId: 'dash-1',
          allowedOrigins: ['https://example.com'],
        }),
      ).rejects.toThrow('already exists');
    });
  });

  describe('validateOrigin', () => {
    it('should return true for a matching origin', () => {
      const result = service.validateOrigin('embed-1', 'https://example.com', [
        'https://example.com',
        'https://staging.example.com',
      ]);
      expect(result).toBe(true);
    });

    it('should return false for a non-matching origin', () => {
      const result = service.validateOrigin('embed-1', 'https://evil.com', [
        'https://example.com',
      ]);
      expect(result).toBe(false);
    });

    it('should return false when origin is undefined', () => {
      const result = service.validateOrigin('embed-1', undefined, [
        'https://example.com',
      ]);
      expect(result).toBe(false);
    });

    it('should return false when allowedOrigins is empty', () => {
      const result = service.validateOrigin(
        'embed-1',
        'https://example.com',
        [],
      );
      expect(result).toBe(false);
    });
  });

  describe('generateEmbedCode', () => {
    it('should return HTML snippet with iframe', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue({
        id: 'embed-1',
        dashboardId: 'dash-1',
        dashboard: { id: 'dash-1', name: 'Sales Dashboard' },
      });

      const result = await service.generateEmbedCode('embed-1', 'tenant-1');

      expect(result.html).toContain('<iframe');
      expect(result.html).toContain('dash-1');
      expect(result.html).toContain('Sales Dashboard');
      expect(result.dashboardId).toBe('dash-1');
    });

    it('should throw if embed config not found', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue(null);

      await expect(
        service.generateEmbedCode('nonexistent', 'tenant-1'),
      ).rejects.toThrow('Embed config not found');
    });
  });

  describe('getEmbedData', () => {
    it('should return dashboard data for a valid published dashboard', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue({
        id: 'embed-1',
        tenantId: 'tenant-1',
        isEnabled: true,
        allowedOrigins: ['https://example.com'],
        dashboard: {
          id: 'dash-1',
          name: 'Sales',
          gridColumns: 12,
          status: 'PUBLISHED',
          widgets: [
            {
              id: 'w-1',
              type: 'LINE',
              title: 'Revenue',
              subtitle: null,
              gridColumnStart: 1,
              gridColumnSpan: 6,
              gridRowStart: 1,
              gridRowSpan: 1,
              dataSourceId: 'ds-1',
              dimensionField: 'date',
              metricFields: [{ field: 'revenue', aggregation: 'SUM' }],
              dateRangePreset: 'LAST_30_DAYS',
              groupingPeriod: 'DAILY',
              typeConfig: {},
            },
          ],
        },
      });
      mockPrisma.tenant.findUnique.mockResolvedValue({
        primaryColor: '#3B82F6',
        secondaryColor: '#6366F1',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        fontFamily: 'Inter',
        cornerRadius: 8,
        logoUrl: null,
      });

      const result = await service.getEmbedData('embed-1', 'tenant-1');

      expect(result.id).toBe('dash-1');
      expect(result.widgets).toHaveLength(1);
      expect(result.theme).toBeDefined();
    });

    it('should reject if embed is disabled', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue({
        id: 'embed-1',
        tenantId: 'tenant-1',
        isEnabled: false,
        dashboard: { status: 'PUBLISHED', widgets: [] },
      });

      await expect(
        service.getEmbedData('embed-1', 'tenant-1'),
      ).rejects.toThrow('Embed is disabled');
    });

    it('should reject if dashboard is not published', async () => {
      mockPrisma.embedConfig.findFirst.mockResolvedValue({
        id: 'embed-1',
        tenantId: 'tenant-1',
        isEnabled: true,
        dashboard: { status: 'DRAFT', widgets: [] },
      });

      await expect(
        service.getEmbedData('embed-1', 'tenant-1'),
      ).rejects.toThrow('Dashboard must be published');
    });
  });
});
