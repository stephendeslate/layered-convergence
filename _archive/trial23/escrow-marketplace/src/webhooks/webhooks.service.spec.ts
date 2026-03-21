import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { Prisma } from '@prisma/client';

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
      mockPrisma.webhookLog.create.mockResolvedValue({ id: 'wh-1' });

      const result = await service.processEvent({
        id: 'evt_1', type: 'payment_intent.succeeded', data: { id: 'pi_1' },
      });

      expect(result.processed).toBe(true);
      expect(result.message).toContain('payment_intent.succeeded');
    });

    it('should return not processed for duplicate event', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue({ id: 'wh-1' });

      const result = await service.processEvent({
        id: 'evt_1', type: 'payment_intent.succeeded', data: {},
      });

      expect(result.processed).toBe(false);
      expect(result.message).toContain('already processed');
    });

    it('should throw ConflictException on P2002', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002', clientVersion: '6.0.0',
      });
      mockPrisma.webhookLog.create.mockRejectedValue(error);

      await expect(
        service.processEvent({ id: 'evt_dup', type: 'test', data: {} }),
      ).rejects.toThrow(ConflictException);
    });

    it('should store event with idempotency key', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      mockPrisma.webhookLog.create.mockResolvedValue({ id: 'wh-1' });

      await service.processEvent({
        id: 'evt_unique', type: 'transfer.created', data: { amount: 5000 },
      });

      expect(mockPrisma.webhookLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ idempotencyKey: 'evt_unique' }),
        }),
      );
    });

    it('should handle payment_intent.succeeded event type', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      const result = await service.processEvent({
        id: 'evt_1', type: 'payment_intent.succeeded', data: { id: 'pi_1' },
      });
      expect(result.processed).toBe(true);
    });

    it('should handle transfer.created event type', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      const result = await service.processEvent({
        id: 'evt_2', type: 'transfer.created', data: { id: 'tr_1' },
      });
      expect(result.processed).toBe(true);
    });

    it('should handle unknown event types gracefully', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      const result = await service.processEvent({
        id: 'evt_3', type: 'unknown.event', data: {},
      });
      expect(result.processed).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return webhook logs', async () => {
      mockPrisma.webhookLog.findMany.mockResolvedValue([{ id: 'wh-1' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should use provided limit', async () => {
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
        expect.objectContaining({
          where: { eventType: 'payment_intent.succeeded' },
        }),
      );
    });
  });
});
