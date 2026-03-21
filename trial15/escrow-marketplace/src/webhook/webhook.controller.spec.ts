import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookController } from './webhook.controller';
import { WebhookService, StripeWebhookPayload } from './webhook.service';

describe('WebhookController', () => {
  let controller: WebhookController;
  let service: {
    processWebhook: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  const mockEvent = { id: 'evt-1', stripeEventId: 'evt_stripe_1', eventType: 'test' };

  beforeEach(() => {
    service = {
      processWebhook: vi.fn().mockResolvedValue({ status: 'processed', event: mockEvent }),
      findAll: vi.fn().mockResolvedValue([mockEvent]),
      findOne: vi.fn().mockResolvedValue(mockEvent),
    };
    controller = new WebhookController(service as unknown as WebhookService);
  });

  it('should handle stripe webhook', async () => {
    const payload: StripeWebhookPayload = {
      id: 'evt_stripe_1',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } },
    };

    const result = await controller.handleStripeWebhook(payload);
    expect(service.processWebhook).toHaveBeenCalledWith(payload);
    expect(result.status).toBe('processed');
  });

  it('should find all webhook events', async () => {
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockEvent]);
  });

  it('should find one webhook event', async () => {
    const result = await controller.findOne('evt-1');
    expect(service.findOne).toHaveBeenCalledWith('evt-1');
    expect(result).toEqual(mockEvent);
  });
});
