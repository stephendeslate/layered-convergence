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
    it('should call processEvent with dto', async () => {
      const dto = { id: 'evt_1', type: 'payment_intent.succeeded', data: { id: 'pi_1' } };
      mockWebhooksService.processEvent.mockResolvedValue({ processed: true });

      await controller.handleStripeWebhook(dto as any);
      expect(mockWebhooksService.processEvent).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call findAll with parsed limit', async () => {
      mockWebhooksService.findAll.mockResolvedValue([]);
      await controller.findAll('20');
      expect(mockWebhooksService.findAll).toHaveBeenCalledWith(20);
    });

    it('should call findAll with undefined when no limit', async () => {
      mockWebhooksService.findAll.mockResolvedValue([]);
      await controller.findAll();
      expect(mockWebhooksService.findAll).toHaveBeenCalledWith(undefined);
    });
  });

  describe('findByType', () => {
    it('should call findByEventType', async () => {
      mockWebhooksService.findByEventType.mockResolvedValue([]);
      await controller.findByType('payment_intent.succeeded');
      expect(mockWebhooksService.findByEventType).toHaveBeenCalledWith('payment_intent.succeeded');
    });
  });
});
