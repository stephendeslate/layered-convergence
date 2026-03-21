import { Test, TestingModule } from '@nestjs/testing';
import { WebhookIngestController } from './webhook-ingest.controller.js';
import { WebhookIngestService } from './webhook-ingest.service.js';

const mockWebhookIngestService = {
  ingest: vi.fn(),
};

describe('WebhookIngestController', () => {
  let controller: WebhookIngestController;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookIngestController],
      providers: [
        { provide: WebhookIngestService, useValue: mockWebhookIngestService },
      ],
    }).compile();

    controller = module.get<WebhookIngestController>(WebhookIngestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ingest', () => {
    it('should ingest webhook data', async () => {
      const payload = {
        dataSourceId: 'ds-1',
        dimensions: { region: 'us' },
        metrics: { count: 1 },
      };
      const expected = { id: 'dp-1', ...payload };
      mockWebhookIngestService.ingest.mockResolvedValue(expected);

      const result = await controller.ingest('api-key-1', payload);

      expect(result).toEqual(expected);
      expect(mockWebhookIngestService.ingest).toHaveBeenCalledWith(
        'api-key-1',
        payload,
      );
    });
  });
});
