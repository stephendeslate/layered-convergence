import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmbedController } from './embed.controller';

describe('EmbedController', () => {
  let controller: EmbedController;
  let mockService: any;

  beforeEach(() => {
    mockService = {
      create: vi.fn().mockResolvedValue({ id: 'ec-1', dashboardId: 'dash-1' }),
      findByDashboard: vi.fn().mockResolvedValue({ id: 'ec-1' }),
      update: vi.fn().mockResolvedValue({ id: 'ec-1' }),
      remove: vi.fn().mockResolvedValue({ id: 'ec-1' }),
    };
    controller = new EmbedController(mockService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an embed config', async () => {
    await controller.create({ dashboardId: 'dash-1' });
    expect(mockService.create).toHaveBeenCalledWith({ dashboardId: 'dash-1' });
  });

  it('should find config by dashboard', async () => {
    await controller.findByDashboard('dash-1');
    expect(mockService.findByDashboard).toHaveBeenCalledWith('dash-1');
  });

  it('should update an embed config', async () => {
    await controller.update('dash-1', { allowedOrigins: ['https://test.com'] });
    expect(mockService.update).toHaveBeenCalledWith('dash-1', { allowedOrigins: ['https://test.com'] });
  });

  it('should remove an embed config', async () => {
    await controller.remove('dash-1');
    expect(mockService.remove).toHaveBeenCalledWith('dash-1');
  });
});
