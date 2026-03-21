import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmbedService } from './embed.service.js';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  embedConfig: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  tenant: {
    findFirst: vi.fn(),
  },
  dashboard: {
    findMany: vi.fn(),
  },
};

describe('EmbedService', () => {
  let service: EmbedService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmbedService(mockPrisma as any);
  });

  describe('createConfig', () => {
    it('should create embed config', async () => {
      mockPrisma.embedConfig.create.mockResolvedValue({
        id: 'ec-1',
        dashboardId: 'dash-1',
      });
      const result = await service.createConfig({
        dashboardId: 'dash-1',
        allowedOrigins: ['https://example.com'],
      });
      expect(result.dashboardId).toBe('dash-1');
    });
  });

  describe('getConfig', () => {
    it('should return embed config', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue({
        id: 'ec-1',
        dashboardId: 'dash-1',
      });
      const result = await service.getConfig('dash-1');
      expect(result.id).toBe('ec-1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(null);
      await expect(service.getConfig('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateConfig', () => {
    it('should update embed config', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue({ id: 'ec-1' });
      mockPrisma.embedConfig.update.mockResolvedValue({
        id: 'ec-1',
        allowedOrigins: ['https://new.com'],
      });
      const result = await service.updateConfig('dash-1', {
        allowedOrigins: ['https://new.com'],
      });
      expect(result.allowedOrigins).toEqual(['https://new.com']);
    });

    it('should throw NotFoundException if config not found', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(null);
      await expect(
        service.updateConfig('nonexistent', { allowedOrigins: [] }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('renderByApiKey', () => {
    it('should return tenant branding and published dashboards', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({
        id: 't-1',
        name: 'Acme',
        primaryColor: '#000',
        fontFamily: 'Arial',
        logoUrl: null,
      });
      mockPrisma.dashboard.findMany.mockResolvedValue([
        { id: 'dash-1', isPublished: true },
      ]);
      const result = await service.renderByApiKey('ak_valid');
      expect(result.tenant.name).toBe('Acme');
      expect(result.dashboards).toHaveLength(1);
    });

    it('should throw NotFoundException for invalid apiKey', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue(null);
      await expect(service.renderByApiKey('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should only return published dashboards', async () => {
      mockPrisma.tenant.findFirst.mockResolvedValue({
        id: 't-1',
        name: 'Acme',
        primaryColor: null,
        fontFamily: null,
        logoUrl: null,
      });
      mockPrisma.dashboard.findMany.mockResolvedValue([]);
      const result = await service.renderByApiKey('ak_valid');
      expect(result.dashboards).toEqual([]);
      expect(mockPrisma.dashboard.findMany).toHaveBeenCalledWith({
        where: { tenantId: 't-1', isPublished: true },
        include: { widgets: true, embedConfig: true },
      });
    });
  });
});
