import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebhooksController } from './webhooks.controller';

const mockService = {
  processEvent: vi.fn(),
  findAll: vi.fn(),
  findByEventType: vi.fn(),
};

describe('WebhooksController', () => {
  let controller: WebhooksController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new WebhooksController(mockService as any);
  });

  describe('handleStripeWebhook', () => {
    it('should process stripe webhook event', async () => {
      mockService.processEvent.mockResolvedValue({ processed: true, message: 'ok' });

      const result = await controller.handleStripeWebhook({
        id: 'evt_1', type: 'payment_intent.succeeded', data: { object: { id: 'pi_1' } },
      });

      expect(result.processed).toBe(true);
      expect(mockService.processEvent).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'evt_1', type: 'payment_intent.succeeded' }),
      );
    });

    it('should extract data.object from webhook body', async () => {
      mockService.processEvent.mockResolvedValue({ processed: true, message: 'ok' });

      await controller.handleStripeWebhook({
        id: 'evt_1', type: 'test', data: { object: { key: 'value' } },
      });

      expect(mockService.processEvent).toHaveBeenCalledWith(
        expect.objectContaining({ data: { key: 'value' } }),
      );
    });
  });

  describe('findAll', () => {
    it('should return webhook logs', async () => {
      mockService.findAll.mockResolvedValue([]);
      const result = await controller.findAll();
      expect(result).toEqual([]);
    });

    it('should pass limit parameter', async () => {
      mockService.findAll.mockResolvedValue([]);
      await controller.findAll('20');
      expect(mockService.findAll).toHaveBeenCalledWith(20);
    });
  });

  describe('findByType', () => {
    it('should filter by type', async () => {
      mockService.findByEventType.mockResolvedValue([]);
      await controller.findByType('payment_intent.succeeded');
      expect(mockService.findByEventType).toHaveBeenCalledWith('payment_intent.succeeded');
    });
  });
});
