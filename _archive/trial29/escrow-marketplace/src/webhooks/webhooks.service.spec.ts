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
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: { id: 'pi_1' },
      });

      expect(result.processed).toBe(true);
      expect(result.message).toContain('payment_intent.succeeded');
    });

    it('should return not processed for duplicate event', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue({ id: 'existing' });

      const result = await service.processEvent({
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: { id: 'pi_1' },
      });

      expect(result.processed).toBe(false);
      expect(result.message).toBe('Event already processed');
    });

    it('should throw ConflictException on race condition P2002', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      const prismaError = new Error('Unique constraint');
      Object.assign(prismaError, { code: 'P2002', clientVersion: '6.0.0' });
      Object.defineProperty(prismaError, 'constructor', {
        value: class PrismaClientKnownRequestError extends Error {
          code = 'P2002';
          clientVersion = '6.0.0';
        },
      });
      mockPrisma.webhookLog.create.mockRejectedValue(prismaError);

      await expect(
        service.processEvent({ id: 'evt_dup', type: 'test', data: {} }),
      ).rejects.toThrow();
    });

    it('should log webhook for each event type', async () => {
      mockPrisma.webhookLog.findUnique.mockResolvedValue(null);
      mockPrisma.webhookLog.create.mockResolvedValue({});

      const types = ['transfer.created', 'payout.paid', 'charge.dispute.created', 'charge.dispute.closed', 'unknown.type'];
      for (const type of types) {
        const result = await service.processEvent({ id: `evt_${type}`, type, data: { id: '1' } });
        expect(result.processed).toBe(true);
      }
    });
  });

  describe('findAll', () => {
    it('should return webhook logs with default limit', async () => {
      mockPrisma.webhookLog.findMany.mockResolvedValue([{ id: 'log-1' }]);

      const result = await service.findAll();

      expect(mockPrisma.webhookLog.findMany).toHaveBeenCalledWith({
        take: 50,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });

    it('should respect custom limit', async () => {
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
      mockPrisma.webhookLog.findMany.mockResolvedValue([]);

      await service.findByEventType('payment_intent.succeeded');

      expect(mockPrisma.webhookLog.findMany).toHaveBeenCalledWith({
        where: { eventType: 'payment_intent.succeeded' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
