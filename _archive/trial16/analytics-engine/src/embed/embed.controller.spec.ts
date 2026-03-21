import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmbedController } from './embed.controller';

describe('EmbedController', () => {
  let controller: EmbedController;
  let mockService: any;

  const mockConfig = {
    id: 'embed-1',
    dashboardId: 'dash-1',
    allowedOrigins: [],
    themeOverrides: {},
  };

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue(mockConfig),
      findByDashboard: vi.fn().mockResolvedValue(mockConfig),
      update: vi.fn().mockResolvedValue({ ...mockConfig, allowedOrigins: ['https://new.com'] }),
      remove: vi.fn().mockResolvedValue(mockConfig),
    };
    controller = new EmbedController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an embed config', async () => {
    const result = await controller.create({ dashboardId: 'dash-1' });
    expect(result).toEqual(mockConfig);
  });

  it('should find embed config by dashboard', async () => {
    const result = await controller.findByDashboard('dash-1');
    expect(result.dashboardId).toBe('dash-1');
  });

  it('should update an embed config', async () => {
    const result = await controller.update('dash-1', { allowedOrigins: ['https://new.com'] });
    expect(result.allowedOrigins).toEqual(['https://new.com']);
  });

  it('should delete an embed config', async () => {
    const result = await controller.remove('dash-1');
    expect(result).toEqual(mockConfig);
  });
});
