import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookService } from './webhook.service.js';

describe('WebhookService', () => {
  let service: WebhookService;
  let prisma: {
    webhookLog: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    prisma = {
      webhookLog: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
    };
    service = new WebhookService(prisma as any);
  });

  describe('process', () => {
    const eventType = 'payment.completed';
    const payload = { amount: 100 };
    const idempotencyKey = 'key-123';

    it('should process a new webhook and return processed status', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({
        id: 'log-1',
        eventType,
        payload,
        idempotencyKey,
        processedAt: new Date(),
      });

      const result = await service.process(eventType, payload, idempotencyKey);

      expect(result).toEqual({ status: 'processed', id: 'log-1' });
      expect(prisma.webhookLog.findFirst).toHaveBeenCalledWith({
        where: { idempotencyKey },
      });
      expect(prisma.webhookLog.create).toHaveBeenCalledWith({
        data: {
          eventType,
          payload,
          idempotencyKey,
          processedAt: expect.any(Date),
        },
      });
    });

    it('should return already_processed for duplicate idempotency key', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue({
        id: 'existing-log',
        idempotencyKey,
      });

      const result = await service.process(eventType, payload, idempotencyKey);

      expect(result).toEqual({ status: 'already_processed', id: 'existing-log' });
      expect(prisma.webhookLog.create).not.toHaveBeenCalled();
    });

    it('should store the full payload as JSON', async () => {
      const complexPayload = { nested: { key: 'value' }, array: [1, 2, 3] };
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'log-1' });

      await service.process('event.type', complexPayload, 'key-456');

      expect(prisma.webhookLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          payload: complexPayload,
        }),
      });
    });

    it('should use the provided event type', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'log-1' });

      await service.process('charge.succeeded', {}, 'key-789');

      expect(prisma.webhookLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'charge.succeeded',
        }),
      });
    });

    it('should set processedAt timestamp on creation', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'log-1' });

      await service.process('event', {}, 'key-999');

      const createCall = prisma.webhookLog.create.mock.calls[0][0];
      expect(createCall.data.processedAt).toBeInstanceOf(Date);
    });
  });
});
