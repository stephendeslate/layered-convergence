import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EmbedService } from './embed.service';

describe('EmbedService', () => {
  let service: EmbedService;
  let mockPrisma: any;

  const mockConfig = {
    id: 'embed-1',
    dashboardId: 'dash-1',
    allowedOrigins: ['https://example.com'],
    themeOverrides: { primaryColor: '#ff0000' },
  };

  beforeEach(() => {
    mockPrisma = {
      embedConfig: {
        create: vi.fn().mockResolvedValue(mockConfig),
        findUnique: vi.fn().mockResolvedValue(mockConfig),
        update: vi.fn().mockResolvedValue({ ...mockConfig, allowedOrigins: ['https://new.com'] }),
        delete: vi.fn().mockResolvedValue(mockConfig),
      },
    };
    service = new EmbedService(mockPrisma);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an embed config', async () => {
    const result = await service.create({
      dashboardId: 'dash-1',
      allowedOrigins: ['https://example.com'],
      themeOverrides: { primaryColor: '#ff0000' },
    });
    expect(result).toEqual(mockConfig);
  });

  it('should find embed config by dashboard id', async () => {
    const result = await service.findByDashboard('dash-1');
    expect(result.dashboardId).toBe('dash-1');
  });

  it('should throw NotFoundException when embed config not found', async () => {
    mockPrisma.embedConfig.findUnique.mockResolvedValue(null);
    await expect(service.findByDashboard('dash-999')).rejects.toThrow(NotFoundException);
  });

  it('should update an embed config', async () => {
    const result = await service.update('dash-1', { allowedOrigins: ['https://new.com'] });
    expect(result.allowedOrigins).toEqual(['https://new.com']);
  });

  it('should delete an embed config', async () => {
    const result = await service.remove('dash-1');
    expect(result).toEqual(mockConfig);
  });

  it('should validate origin when in allowed list', async () => {
    const result = await service.validateOrigin('dash-1', 'https://example.com');
    expect(result).toBe(true);
  });

  it('should reject origin when not in allowed list', async () => {
    const result = await service.validateOrigin('dash-1', 'https://evil.com');
    expect(result).toBe(false);
  });

  it('should allow any origin when allowedOrigins is empty', async () => {
    mockPrisma.embedConfig.findUnique.mockResolvedValue({
      ...mockConfig,
      allowedOrigins: [],
    });
    const result = await service.validateOrigin('dash-1', 'https://anything.com');
    expect(result).toBe(true);
  });

  it('should return false for non-existent embed config in validateOrigin', async () => {
    mockPrisma.embedConfig.findUnique.mockResolvedValue(null);
    const result = await service.validateOrigin('dash-999', 'https://example.com');
    expect(result).toBe(false);
  });
});
