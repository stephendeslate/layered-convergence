import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { EmbedService } from './embed.service';

describe('EmbedService', () => {
  let service: EmbedService;
  let mockPrisma: any;

  const mockConfig = {
    id: 'ec-1',
    dashboardId: 'dash-1',
    allowedOrigins: ['https://example.com'],
    themeOverrides: { primaryColor: '#ff0000' },
    dashboard: { id: 'dash-1', widgets: [] },
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
    });
    expect(result).toEqual(mockConfig);
  });

  it('should create with default values', async () => {
    await service.create({ dashboardId: 'dash-1' });
    const call = mockPrisma.embedConfig.create.mock.calls[0][0];
    expect(call.data.allowedOrigins).toEqual([]);
    expect(call.data.themeOverrides).toEqual({});
  });

  it('should find config by dashboard', async () => {
    const result = await service.findByDashboard('dash-1');
    expect(result).toEqual(mockConfig);
  });

  it('should throw NotFoundException when config not found', async () => {
    mockPrisma.embedConfig.findUnique.mockResolvedValue(null);
    await expect(service.findByDashboard('dash-999')).rejects.toThrow(NotFoundException);
  });

  it('should update an embed config', async () => {
    const result = await service.update('dash-1', { allowedOrigins: ['https://new.com'] });
    expect(result.allowedOrigins).toEqual(['https://new.com']);
  });

  it('should remove an embed config', async () => {
    await service.remove('dash-1');
    expect(mockPrisma.embedConfig.delete).toHaveBeenCalledWith({ where: { dashboardId: 'dash-1' } });
  });

  it('should validate origin - allowed', async () => {
    const result = await service.validateOrigin('dash-1', 'https://example.com');
    expect(result).toBe(true);
  });

  it('should validate origin - not allowed', async () => {
    const result = await service.validateOrigin('dash-1', 'https://evil.com');
    expect(result).toBe(false);
  });

  it('should validate origin - empty origins allows all', async () => {
    mockPrisma.embedConfig.findUnique.mockResolvedValue({
      ...mockConfig,
      allowedOrigins: [],
    });
    const result = await service.validateOrigin('dash-1', 'https://anything.com');
    expect(result).toBe(true);
  });

  it('should return false when config not found for origin validation', async () => {
    mockPrisma.embedConfig.findUnique.mockResolvedValue(null);
    const result = await service.validateOrigin('dash-999', 'https://example.com');
    expect(result).toBe(false);
  });
});
