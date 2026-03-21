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
    it('should create a new webhook log when key is new', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      const created = { id: 'log-1', eventType: 'payment.completed', idempotencyKey: 'key-1' };
      prisma.webhookLog.create.mockResolvedValue(created);

      const result = await service.process('payment.completed', { amount: 100 }, 'key-1');

      expect(prisma.webhookLog.findFirst).toHaveBeenCalledWith({
        where: { idempotencyKey: 'key-1' },
      });
      expect(prisma.webhookLog.create).toHaveBeenCalledWith({
        data: {
          eventType: 'payment.completed',
          payload: { amount: 100 },
          idempotencyKey: 'key-1',
          processedAt: expect.any(Date),
        },
      });
      expect(result).toEqual({ status: 'processed', id: 'log-1' });
    });

    it('should return already_processed when idempotencyKey exists', async () => {
      const existing = { id: 'log-1', eventType: 'payment.completed', idempotencyKey: 'key-1' };
      prisma.webhookLog.findFirst.mockResolvedValue(existing);

      const result = await service.process('payment.completed', { amount: 100 }, 'key-1');

      expect(prisma.webhookLog.create).not.toHaveBeenCalled();
      expect(result).toEqual({ status: 'already_processed', id: 'log-1' });
    });

    it('should pass the correct eventType to create', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'log-2' });

      await service.process('account.updated', {}, 'key-2');

      expect(prisma.webhookLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventType: 'account.updated',
        }),
      });
    });

    it('should pass the payload object to create', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      const payload = { nested: { data: 'value' } };
      prisma.webhookLog.create.mockResolvedValue({ id: 'log-3' });

      await service.process('test.event', payload, 'key-3');

      expect(prisma.webhookLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          payload: { nested: { data: 'value' } },
        }),
      });
    });

    it('should set processedAt as a Date', async () => {
      prisma.webhookLog.findFirst.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'log-4' });

      await service.process('test.event', {}, 'key-4');

      const callArgs = prisma.webhookLog.create.mock.calls[0][0];
      expect(callArgs.data.processedAt).toBeInstanceOf(Date);
    });

    it('should handle duplicate calls with same idempotencyKey', async () => {
      const existing = { id: 'log-1' };
      prisma.webhookLog.findFirst.mockResolvedValue(existing);

      const result1 = await service.process('event', {}, 'same-key');
      const result2 = await service.process('event', {}, 'same-key');

      expect(result1).toEqual({ status: 'already_processed', id: 'log-1' });
      expect(result2).toEqual({ status: 'already_processed', id: 'log-1' });
      expect(prisma.webhookLog.create).not.toHaveBeenCalled();
    });
  });
});
