import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookService, StripeWebhookPayload } from './webhook.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WebhookService', () => {
  let service: WebhookService;
  let prisma: {
    webhookEvent: {
      create: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    transaction: {
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    stripeAccount: {
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    payout: {
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };

  const mockEvent = {
    id: 'evt-1',
    stripeEventId: 'evt_stripe_1',
    eventType: 'payment_intent.succeeded',
    payload: {},
    processed: false,
    processedAt: null,
    createdAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      webhookEvent: {
        create: vi.fn().mockResolvedValue(mockEvent),
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([mockEvent]),
        findUnique: vi.fn().mockResolvedValue(mockEvent),
        update: vi.fn().mockResolvedValue({ ...mockEvent, processed: true }),
      },
      transaction: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
      },
      stripeAccount: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
      },
      payout: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue({}),
      },
    };
    service = new WebhookService(prisma as unknown as PrismaService);
  });

  describe('processWebhook', () => {
    it('should process a new webhook event', async () => {
      const payload: StripeWebhookPayload = {
        id: 'evt_stripe_1',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
      };

      const result = await service.processWebhook(payload);
      expect(result.status).toBe('processed');
      expect(prisma.webhookEvent.create).toHaveBeenCalled();
    });

    it('should skip already processed events', async () => {
      prisma.webhookEvent.findFirst.mockResolvedValue(mockEvent);

      const payload: StripeWebhookPayload = {
        id: 'evt_stripe_1',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
      };

      const result = await service.processWebhook(payload);
      expect(result.status).toBe('already_processed');
      expect(prisma.webhookEvent.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for missing id', async () => {
      const payload = { id: '', type: 'test', data: { object: {} } } as StripeWebhookPayload;
      await expect(service.processWebhook(payload)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing type', async () => {
      const payload = { id: 'evt_1', type: '', data: { object: {} } } as StripeWebhookPayload;
      await expect(service.processWebhook(payload)).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleEvent', () => {
    it('should handle payment_intent.succeeded', async () => {
      const transaction = { id: 'txn-1', status: 'PENDING' };
      prisma.transaction.findFirst.mockResolvedValue(transaction);

      const payload: StripeWebhookPayload = {
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
      };

      await service.handleEvent('evt-1', payload);
      expect(prisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'txn-1' },
        data: { status: 'FUNDED' },
      });
    });

    it('should not update non-PENDING transaction on payment success', async () => {
      prisma.transaction.findFirst.mockResolvedValue({ id: 'txn-1', status: 'FUNDED' });

      const payload: StripeWebhookPayload = {
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
      };

      await service.handleEvent('evt-1', payload);
      expect(prisma.transaction.update).not.toHaveBeenCalled();
    });

    it('should handle account.updated', async () => {
      const account = { id: 'sa-1', chargesEnabled: false, payoutsEnabled: false, detailsSubmitted: false };
      prisma.stripeAccount.findFirst.mockResolvedValue(account);

      const payload: StripeWebhookPayload = {
        id: 'evt_1',
        type: 'account.updated',
        data: {
          object: {
            id: 'acct_123',
            charges_enabled: true,
            payouts_enabled: true,
            details_submitted: true,
          },
        },
      };

      await service.handleEvent('evt-1', payload);
      expect(prisma.stripeAccount.update).toHaveBeenCalled();
    });

    it('should handle payout.paid', async () => {
      prisma.payout.findFirst.mockResolvedValue({ id: 'payout-1', stripePayoutId: 'po_123' });

      const payload: StripeWebhookPayload = {
        id: 'evt_1',
        type: 'payout.paid',
        data: { object: { id: 'po_123' } },
      };

      await service.handleEvent('evt-1', payload);
      expect(prisma.payout.update).toHaveBeenCalledWith({
        where: { id: 'payout-1' },
        data: { status: 'completed' },
      });
    });

    it('should handle payout.failed', async () => {
      prisma.payout.findFirst.mockResolvedValue({ id: 'payout-1', stripePayoutId: 'po_123' });

      const payload: StripeWebhookPayload = {
        id: 'evt_1',
        type: 'payout.failed',
        data: { object: { id: 'po_123' } },
      };

      await service.handleEvent('evt-1', payload);
      expect(prisma.payout.update).toHaveBeenCalledWith({
        where: { id: 'payout-1' },
        data: { status: 'failed' },
      });
    });

    it('should handle unknown event types gracefully', async () => {
      const payload: StripeWebhookPayload = {
        id: 'evt_1',
        type: 'unknown.event',
        data: { object: {} },
      };

      await expect(service.handleEvent('evt-1', payload)).resolves.not.toThrow();
      expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-1' },
        data: { processed: true, processedAt: expect.any(Date) },
      });
    });

    it('should mark event as processed', async () => {
      const payload: StripeWebhookPayload = {
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        data: { object: { id: 'pi_123' } },
      };

      await service.handleEvent('evt-1', payload);
      expect(prisma.webhookEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-1' },
        data: { processed: true, processedAt: expect.any(Date) },
      });
    });
  });

  describe('findAll', () => {
    it('should return all webhook events', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockEvent]);
    });
  });

  describe('findOne', () => {
    it('should return a webhook event by id', async () => {
      const result = await service.findOne('evt-1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.webhookEvent.findUnique.mockResolvedValue(null);
      await expect(service.findOne('none')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByStripeEventId', () => {
    it('should return event by stripe event ID', async () => {
      const result = await service.findByStripeEventId('evt_stripe_1');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if not found', async () => {
      prisma.webhookEvent.findUnique.mockResolvedValue(null);
      await expect(service.findByStripeEventId('none')).rejects.toThrow(NotFoundException);
    });
  });
});
