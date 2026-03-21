import { EmbedService } from './embed.service.js';
import { NotFoundException } from '@nestjs/common';

describe('EmbedService', () => {
  let service: EmbedService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      embedConfig: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      tenant: { findFirst: vi.fn() },
      dashboard: { findMany: vi.fn() },
    };
    service = new EmbedService(mockPrisma);
  });

  describe('createConfig', () => {
    it('should create an embed config', async () => {
      mockPrisma.embedConfig.create.mockResolvedValue({ id: '1' });
      const result = await service.createConfig({
        dashboardId: 'd1',
        allowedOrigins: ['https://example.com'],
      });
      expect(result).toBeDefined();
    });
  });

  describe('getConfig', () => {
    it('should return config by dashboardId', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue({
        id: '1',
        dashboardId: 'd1',
      });
      const result = await service.getConfig('d1');
      expect(result.dashboardId).toBe('d1');
    });

    it('should throw NotFoundException', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(null);
      await expect(service.getConfig('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('renderByApiKey', () => {
    it('should return tenant and published dashboards', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({
        id: 't1',
        name: 'Test',
        apiKey: 'ak_test',
        primaryColor: '#000',
        fontFamily: null,
        logoUrl: null,
      });
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      const result = await service.renderByApiKey('ak_test');
      expect(result.tenant.name).toBe('Test');
      expect(result.dashboards).toEqual([]);
    });

    it('should throw for invalid API key', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue(null);
      await expect(service.renderByApiKey('bad')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
