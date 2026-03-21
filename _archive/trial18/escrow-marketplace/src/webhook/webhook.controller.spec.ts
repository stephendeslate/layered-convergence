import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookController } from './webhook.controller.js';

describe('WebhookController', () => {
  let controller: WebhookController;
  let webhookService: {
    process: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    webhookService = {
      process: vi.fn(),
    };
    controller = new WebhookController(webhookService as any);
  });

  describe('process', () => {
    it('should delegate to webhookService.process', async () => {
      const expected = { status: 'processed', id: 'log-1' };
      webhookService.process.mockResolvedValue(expected);

      const result = await controller.process({
        eventType: 'payment.completed',
        payload: { amount: 100 },
        idempotencyKey: 'key-1',
      });

      expect(webhookService.process).toHaveBeenCalledWith(
        'payment.completed',
        { amount: 100 },
        'key-1',
      );
      expect(result).toEqual(expected);
    });

    it('should return already_processed result from service', async () => {
      const expected = { status: 'already_processed', id: 'log-1' };
      webhookService.process.mockResolvedValue(expected);

      const result = await controller.process({
        eventType: 'payment.completed',
        payload: {},
        idempotencyKey: 'duplicate-key',
      });

      expect(result).toEqual(expected);
    });
  });
});
