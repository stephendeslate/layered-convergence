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
    it('should process a new event', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      const result = await service.processEvent({
        id: 'evt-1', type: 'payment_intent.succeeded', data: { id: 'pi-1' },
      });

      expect(result.processed).toBe(true);
      expect(result.message).toContain('payment_intent.succeeded');
    });

    it('should return processed:false for duplicate events', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue({ id: 'existing' });

      const result = await service.processEvent({
        id: 'evt-1', type: 'payment_intent.succeeded', data: {},
      });

      expect(result.processed).toBe(false);
      expect(result.message).toBe('Event already processed');
    });

    it('should handle all known event types without error', async () => {
      const eventTypes = [
        'payment_intent.succeeded',
        'transfer.created',
        'payout.paid',
        'charge.dispute.created',
        'charge.dispute.closed',
        'unknown.event',
      ];

      for (const type of eventTypes) {
        mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
        mockPrisma.webhookLog.create.mockResolvedValue({});

        const result = await service.processEvent({ id: `evt-${type}`, type, data: { id: 'x' } });
        expect(result.processed).toBe(true);
      }
    });
  });

  describe('findAll', () => {
    it('should return webhook logs with default limit', async () => {
      mockPrisma.webhookLog.findMany.mockResolvedValue([]);
      await service.findAll();
      expect(mockPrisma.webhookLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });

    it('should use custom limit', async () => {
      mockPrisma.webhookLog.findMany.mockResolvedValue([]);
      await service.findAll(10);
      expect(mockPrisma.webhookLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('findByEventType', () => {
    it('should filter by event type', async () => {
      mockPrisma.webhookLog.findMany.mockResolvedValue([]);
      await service.findByEventType('payment_intent.succeeded');
      expect(mockPrisma.webhookLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { eventType: 'payment_intent.succeeded' } }),
      );
    });
  });
});
