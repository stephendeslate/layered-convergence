import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookService } from './webhook.service';

const mockPrismaService = {
  webhookLog: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
  },
};

const mockStripeService = {
  constructWebhookEvent: vi.fn(),
  isMockMode: true,
};

const mockBullMqService = {
  enqueueWebhook: vi.fn(),
};

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WebhookService(
      mockPrismaService as any,
      mockStripeService as any,
      mockBullMqService as any,
    );
  });

  describe('processWebhook', () => {
    const mockEvent = {
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_123' } },
    };

    it('should process a new webhook event', async () => {
      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockPrismaService.webhookLog.findUnique.mockResolvedValue(null);
      mockPrismaService.webhookLog.upsert.mockResolvedValue({});
      mockBullMqService.enqueueWebhook.mockResolvedValue({});

      const rawBody = Buffer.from(JSON.stringify(mockEvent));
      await service.processWebhook(rawBody, 'sig_test');

      expect(mockPrismaService.webhookLog.findUnique).toHaveBeenCalledWith({
        where: { stripeEventId: 'evt_test_123' },
      });
      expect(mockPrismaService.webhookLog.upsert).toHaveBeenCalled();
      expect(mockBullMqService.enqueueWebhook).toHaveBeenCalledWith(
        'evt_test_123',
        'payment_intent.succeeded',
        { id: 'pi_test_123' },
      );
    });

    it('should skip duplicate webhook events (already PROCESSED)', async () => {
      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockPrismaService.webhookLog.findUnique.mockResolvedValue({
        stripeEventId: 'evt_test_123',
        status: 'PROCESSED',
      });

      const rawBody = Buffer.from(JSON.stringify(mockEvent));
      await service.processWebhook(rawBody, 'sig_test');

      expect(mockPrismaService.webhookLog.upsert).not.toHaveBeenCalled();
      expect(mockBullMqService.enqueueWebhook).not.toHaveBeenCalled();
    });

    it('should skip duplicate webhook events (PROCESSING)', async () => {
      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockPrismaService.webhookLog.findUnique.mockResolvedValue({
        stripeEventId: 'evt_test_123',
        status: 'PROCESSING',
      });

      const rawBody = Buffer.from(JSON.stringify(mockEvent));
      await service.processWebhook(rawBody, 'sig_test');

      expect(mockBullMqService.enqueueWebhook).not.toHaveBeenCalled();
    });

    it('should retry FAILED webhook events', async () => {
      mockStripeService.constructWebhookEvent.mockReturnValue(mockEvent);
      mockPrismaService.webhookLog.findUnique.mockResolvedValue({
        stripeEventId: 'evt_test_123',
        status: 'FAILED',
      });
      mockPrismaService.webhookLog.upsert.mockResolvedValue({});
      mockBullMqService.enqueueWebhook.mockResolvedValue({});

      const rawBody = Buffer.from(JSON.stringify(mockEvent));
      await service.processWebhook(rawBody, 'sig_test');

      expect(mockPrismaService.webhookLog.upsert).toHaveBeenCalled();
      expect(mockBullMqService.enqueueWebhook).toHaveBeenCalled();
    });

    it('should throw BadRequestException on invalid signature', async () => {
      mockStripeService.constructWebhookEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const rawBody = Buffer.from('invalid');
      await expect(
        service.processWebhook(rawBody, 'bad_sig'),
      ).rejects.toThrow();
    });
  });

  describe('markProcessed', () => {
    it('should update webhook status to PROCESSED', async () => {
      mockPrismaService.webhookLog.update.mockResolvedValue({});

      await service.markProcessed('evt_test_123');

      expect(mockPrismaService.webhookLog.update).toHaveBeenCalledWith({
        where: { stripeEventId: 'evt_test_123' },
        data: expect.objectContaining({
          status: 'PROCESSED',
        }),
      });
    });
  });

  describe('markFailed', () => {
    it('should update webhook status to FAILED with error message', async () => {
      mockPrismaService.webhookLog.update.mockResolvedValue({});

      await service.markFailed('evt_test_123', 'Processing error');

      expect(mockPrismaService.webhookLog.update).toHaveBeenCalledWith({
        where: { stripeEventId: 'evt_test_123' },
        data: {
          status: 'FAILED',
          errorMessage: 'Processing error',
        },
      });
    });
  });

  describe('markSkipped', () => {
    it('should update webhook status to SKIPPED', async () => {
      mockPrismaService.webhookLog.update.mockResolvedValue({});

      await service.markSkipped('evt_test_123');

      expect(mockPrismaService.webhookLog.update).toHaveBeenCalledWith({
        where: { stripeEventId: 'evt_test_123' },
        data: expect.objectContaining({
          status: 'SKIPPED',
        }),
      });
    });
  });
});
