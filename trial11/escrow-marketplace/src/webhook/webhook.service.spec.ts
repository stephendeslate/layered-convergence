import { Test, TestingModule } from '@nestjs/testing';
import { WebhookService } from './webhook.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('WebhookService', () => {
  let service: WebhookService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      webhookLog: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      transaction: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      transactionStateHistory: {
        create: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  describe('processStripeEvent', () => {
    it('should process a new event and log it', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'log-1' });
      prisma.webhookLog.update.mockResolvedValue({});

      const result = await service.processStripeEvent(
        'evt_123',
        'checkout.session.completed',
        { object: { id: 'cs_123' } },
      );

      expect(result.status).toBe('processed');
      expect(result.webhookLogId).toBe('log-1');
      expect(prisma.webhookLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            idempotencyKey: 'evt_123',
            eventType: 'checkout.session.completed',
          }),
        }),
      );
    });

    it('should return already_processed for duplicate events', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue({ id: 'log-1' });

      const result = await service.processStripeEvent('evt_123', 'checkout.session.completed', {});

      expect(result.status).toBe('already_processed');
      expect(prisma.webhookLog.create).not.toHaveBeenCalled();
    });

    it('should handle payment_intent.succeeded by funding transaction', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'log-1' });
      prisma.webhookLog.update.mockResolvedValue({});
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: 'PENDING',
        stripePaymentIntentId: 'pi_123',
      });
      prisma.transaction.update.mockResolvedValue({});

      await service.processStripeEvent('evt_456', 'payment_intent.succeeded', {
        object: { id: 'pi_123' },
      });

      expect(prisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tx-1' },
          data: { status: 'FUNDED' },
        }),
      );
      expect(prisma.transactionStateHistory.create).toHaveBeenCalled();
    });

    it('should handle payment_intent.payment_failed by expiring transaction', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'log-1' });
      prisma.webhookLog.update.mockResolvedValue({});
      prisma.transaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        status: 'PENDING',
        stripePaymentIntentId: 'pi_123',
      });
      prisma.transaction.update.mockResolvedValue({});

      await service.processStripeEvent('evt_789', 'payment_intent.payment_failed', {
        object: { id: 'pi_123' },
      });

      expect(prisma.transaction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tx-1' },
          data: { status: 'EXPIRED' },
        }),
      );
    });

    it('should not update transaction if not found for payment event', async () => {
      prisma.webhookLog.findUnique.mockResolvedValue(null);
      prisma.webhookLog.create.mockResolvedValue({ id: 'log-1' });
      prisma.webhookLog.update.mockResolvedValue({});
      prisma.transaction.findFirst.mockResolvedValue(null);

      await service.processStripeEvent('evt_999', 'payment_intent.succeeded', {
        object: { id: 'pi_unknown' },
      });

      expect(prisma.transaction.update).not.toHaveBeenCalled();
    });
  });
});
