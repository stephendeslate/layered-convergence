import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmbedController } from './embed.controller.js';

const mockService = {
  createConfig: vi.fn(),
  getConfig: vi.fn(),
  updateConfig: vi.fn(),
  renderByApiKey: vi.fn(),
};

describe('EmbedController', () => {
  let controller: EmbedController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new EmbedController(mockService as any);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call createConfig', async () => {
    mockService.createConfig.mockResolvedValue({ id: 'ec-1' });
    const result = await controller.createConfig({
      dashboardId: 'dash-1',
      allowedOrigins: ['https://example.com'],
    });
    expect(result.id).toBe('ec-1');
  });

  it('should call getConfig', async () => {
    mockService.getConfig.mockResolvedValue({
      id: 'ec-1',
      dashboardId: 'dash-1',
    });
    const result = await controller.getConfig('dash-1');
    expect(result.dashboardId).toBe('dash-1');
  });

  it('should call updateConfig', async () => {
    mockService.updateConfig.mockResolvedValue({
      id: 'ec-1',
      allowedOrigins: ['https://new.com'],
    });
    const result = await controller.updateConfig('dash-1', {
      allowedOrigins: ['https://new.com'],
    });
    expect(result.allowedOrigins).toEqual(['https://new.com']);
  });

  it('should call renderByApiKey', async () => {
    mockService.renderByApiKey.mockResolvedValue({
      tenant: { name: 'Acme' },
      dashboards: [],
    });
    const result = await controller.renderByApiKey('ak_test');
    expect(result.tenant.name).toBe('Acme');
  });
});
