import { Test, TestingModule } from '@nestjs/testing';
import { EmbedController } from './embed.controller.js';
import { EmbedService } from './embed.service.js';

const mockEmbedService = {
  createEmbedConfig: vi.fn(),
  getEmbeddedDashboard: vi.fn(),
};

describe('EmbedController', () => {
  let controller: EmbedController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmbedController],
      providers: [{ provide: EmbedService, useValue: mockEmbedService }],
    }).compile();

    controller = module.get<EmbedController>(EmbedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEmbedConfig', () => {
    it('should create an embed config', async () => {
      const dto = {
        dashboardId: 'dash-1',
        allowedOrigins: ['https://example.com'],
      };
      const expected = { id: '1', ...dto };
      mockEmbedService.createEmbedConfig.mockResolvedValue(expected);

      const result = await controller.createEmbedConfig(dto);

      expect(result).toEqual(expected);
    });
  });

  describe('getEmbeddedDashboard', () => {
    it('should return embedded dashboard', async () => {
      const expected = { dashboard: { id: 'dash-1' }, embedConfig: {} };
      mockEmbedService.getEmbeddedDashboard.mockResolvedValue(expected);

      const result = await controller.getEmbeddedDashboard(
        'dash-1',
        'api-key-1',
      );

      expect(result).toEqual(expected);
      expect(mockEmbedService.getEmbeddedDashboard).toHaveBeenCalledWith(
        'dash-1',
        'api-key-1',
      );
    });
  });
});
