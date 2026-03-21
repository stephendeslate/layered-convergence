import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebhooksController } from './webhooks.controller';

const mockWebhooksService = {
  processEvent: vi.fn(),
  findAll: vi.fn(),
  findByEventType: vi.fn(),
};

describe('WebhooksController', () => {
  let controller: WebhooksController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new WebhooksController(mockWebhooksService as any);
  });

  describe('handleStripeWebhook', () => {
    it('should call service.processEvent', async () => {
      const dto = { id: 'evt-1', type: 'payment_intent.succeeded', data: {} };
      mockWebhooksService.processEvent.mockResolvedValue({ processed: true, message: 'ok' });

      const result = await controller.handleStripeWebhook(dto as any);

      expect(mockWebhooksService.processEvent).toHaveBeenCalledWith(dto);
      expect(result.processed).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with parsed limit', async () => {
      mockWebhooksService.findAll.mockResolvedValue([]);
      await controller.findAll('25');
      expect(mockWebhooksService.findAll).toHaveBeenCalledWith(25);
    });

    it('should call service.findAll without limit', async () => {
      mockWebhooksService.findAll.mockResolvedValue([]);
      await controller.findAll();
      expect(mockWebhooksService.findAll).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findByType', () => {
    it('should call service.findByEventType', async () => {
      mockWebhooksService.findByEventType.mockResolvedValue([]);
      await controller.findByType('payment_intent.succeeded');
      expect(mockWebhooksService.findByEventType).toHaveBeenCalledWith('payment_intent.succeeded');
    });
  });
});
