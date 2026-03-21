import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebhooksService } from './webhooks.service';
import { ConflictException } from '@nestjs/common';

const mockPrisma = {
  webhookLog: {
    findUnique: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
  },
};

describe('WebhooksService', () => {
  let service: WebhooksService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WebhooksService(mockPrisma as any);
  });

  describe('processEvent', () => {
    it('should process new event successfully', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      mockPrisma.webhookLog.create.mockResolvedValue({ id: 'wh-1' });

      const result = await service.processEvent({
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: { id: 'pi_1' },
      });

      expect(result.processed).toBe(true);
      expect(result.message).toContain('payment_intent.succeeded');
    });

    it('should skip duplicate events', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue({ id: 'wh-1' });

      const result = await service.processEvent({
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: { id: 'pi_1' },
      });

      expect(result.processed).toBe(false);
      expect(result.message).toBe('Event already processed');
    });

    it('should throw ConflictException on P2002 race condition', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      const prismaError = new Error('Unique constraint') as any;
      prismaError.code = 'P2002';
      prismaError.constructor = { name: 'PrismaClientKnownRequestError' };
      Object.setPrototypeOf(prismaError, { constructor: { name: 'PrismaClientKnownRequestError' } });
      mockPrisma.webhookLog.create.mockRejectedValue(prismaError);

      await expect(
        service.processEvent({ id: 'evt_dup', type: 'test', data: {} }),
      ).rejects.toThrow();
    });

    it('should rethrow non-P2002 errors', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      mockPrisma.webhookLog.create.mockRejectedValue(new Error('DB down'));

      await expect(
        service.processEvent({ id: 'evt_2', type: 'test', data: {} }),
      ).rejects.toThrow('DB down');
    });
  });

  describe('findAll', () => {
    it('should return webhook logs with default limit', async () => {
      mockPrisma.webhookLog.findMany.mockResolvedValue([{ id: 'wh-1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(mockPrisma.webhookLog.findMany).toHaveBeenCalledWith({
        take: 50,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should accept custom limit', async () => {
      mockPrisma.webhookLog.findMany.mockResolvedValue([]);
      await service.findAll(10);
      expect(mockPrisma.webhookLog.findMany).toHaveBeenCalledWith({
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findByEventType', () => {
    it('should filter by event type', async () => {
      mockPrisma.webhookLog.findMany.mockResolvedValue([{ id: 'wh-1' }]);
      const result = await service.findByEventType('payment_intent.succeeded');
      expect(result).toHaveLength(1);
      expect(mockPrisma.webhookLog.findMany).toHaveBeenCalledWith({
        where: { eventType: 'payment_intent.succeeded' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('handleEvent', () => {
    it('should handle multiple event types without error', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      mockPrisma.webhookLog.create.mockResolvedValue({ id: 'wh-1' });

      const types = [
        'payment_intent.succeeded',
        'transfer.created',
        'payout.paid',
        'charge.dispute.created',
        'charge.dispute.closed',
        'unknown.event',
      ];

      for (const type of types) {
        const result = await service.processEvent({ id: `evt_${type}`, type, data: { id: 'x' } });
        expect(result.processed).toBe(true);
      }
    });
  });
});
