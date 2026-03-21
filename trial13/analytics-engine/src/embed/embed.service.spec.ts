import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EmbedService } from './embed.service';

describe('EmbedService', () => {
  let service: EmbedService;
  let mockPrisma: any;

  const mockConfig = {
    id: 'emb-1',
    dashboardId: 'dash-1',
    allowedOrigins: ['https://example.com'],
    themeOverrides: { primaryColor: '#333' },
    dashboard: { widgets: [] },
  };

  beforeEach(() => {
    mockPrisma = {
      embedConfig: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };
    service = new EmbedService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an embed config', async () => {
      mockPrisma.embedConfig.create.mockResolvedValue(mockConfig);
      const result = await service.create({
        dashboardId: 'dash-1',
        allowedOrigins: ['https://example.com'],
        themeOverrides: { primaryColor: '#333' },
      });
      expect(result).toEqual(mockConfig);
    });

    it('should use defaults for optional fields', async () => {
      mockPrisma.embedConfig.create.mockResolvedValue(mockConfig);
      await service.create({ dashboardId: 'dash-1' });
      expect(mockPrisma.embedConfig.create).toHaveBeenCalledWith({
        data: {
          dashboardId: 'dash-1',
          allowedOrigins: [],
          themeOverrides: {},
        },
      });
    });
  });

  describe('findByDashboard', () => {
    it('should return embed config with dashboard', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(mockConfig);
      const result = await service.findByDashboard('dash-1');
      expect(result).toEqual(mockConfig);
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(null);
      await expect(service.findByDashboard('dash-999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update embed config', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(mockConfig);
      mockPrisma.embedConfig.update.mockResolvedValue({
        ...mockConfig,
        allowedOrigins: ['https://new.com'],
      });
      const result = await service.update('dash-1', { allowedOrigins: ['https://new.com'] });
      expect(result.allowedOrigins).toEqual(['https://new.com']);
    });
  });

  describe('remove', () => {
    it('should delete embed config', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(mockConfig);
      mockPrisma.embedConfig.delete.mockResolvedValue(mockConfig);
      const result = await service.remove('dash-1');
      expect(result).toEqual(mockConfig);
    });
  });

  describe('validateOrigin', () => {
    it('should return true when origin is in allowedOrigins', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(mockConfig);
      const result = await service.validateOrigin('dash-1', 'https://example.com');
      expect(result).toBe(true);
    });

    it('should return false when origin is not in allowedOrigins', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(mockConfig);
      const result = await service.validateOrigin('dash-1', 'https://evil.com');
      expect(result).toBe(false);
    });

    it('should return true when allowedOrigins is empty (allow all)', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue({
        ...mockConfig,
        allowedOrigins: [],
      });
      const result = await service.validateOrigin('dash-1', 'https://any.com');
      expect(result).toBe(true);
    });

    it('should return false when embed config not found', async () => {
      mockPrisma.embedConfig.findUnique.mockResolvedValue(null);
      const result = await service.validateOrigin('dash-999', 'https://any.com');
      expect(result).toBe(false);
    });
  });
});
