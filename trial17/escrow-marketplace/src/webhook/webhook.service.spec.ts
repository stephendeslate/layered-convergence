import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../prisma/prisma.service';
import { PayoutService } from '../payout/payout.service';
import { StripeAccountService } from '../stripe-account/stripe-account.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let prisma: {
    webhook: {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
  };
  let payoutService: { updateStatus: ReturnType<typeof vi.fn> };
  let stripeAccountService: { update: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      webhook: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
    };

    payoutService = { updateStatus: vi.fn() };
    stripeAccountService = { update: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: PrismaService, useValue: prisma },
        { provide: PayoutService, useValue: payoutService },
        { provide: StripeAccountService, useValue: stripeAccountService },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  describe('handleEvent', () => {
    it('should process payout.paid event', async () => {
      prisma.webhook.findUnique.mockResolvedValue(null);
      prisma.webhook.create.mockResolvedValue({});
      prisma.webhook.update.mockResolvedValue({});
      payoutService.updateStatus.mockResolvedValue({});

      await service.handleEvent({
        id: 'evt_1',
        type: 'payout.paid',
        data: {
          object: {
            id: 'po_123',
            metadata: { escrowPayoutId: 'payout-1' },
          },
        },
      });

      expect(payoutService.updateStatus).toHaveBeenCalledWith(
        'payout-1',
        'COMPLETED',
        'po_123',
      );
    });

    it('should process payout.failed event', async () => {
      prisma.webhook.findUnique.mockResolvedValue(null);
      prisma.webhook.create.mockResolvedValue({});
      prisma.webhook.update.mockResolvedValue({});
      payoutService.updateStatus.mockResolvedValue({});

      await service.handleEvent({
        id: 'evt_2',
        type: 'payout.failed',
        data: {
          object: {
            metadata: { escrowPayoutId: 'payout-1' },
          },
        },
      });

      expect(payoutService.updateStatus).toHaveBeenCalledWith(
        'payout-1',
        'FAILED',
      );
    });

    it('should handle account.updated event', async () => {
      prisma.webhook.findUnique.mockResolvedValue(null);
      prisma.webhook.create.mockResolvedValue({});
      prisma.webhook.update.mockResolvedValue({});
      stripeAccountService.update.mockResolvedValue({});

      await service.handleEvent({
        id: 'evt_3',
        type: 'account.updated',
        data: {
          object: {
            id: 'acct_123',
            charges_enabled: true,
            payouts_enabled: true,
            details_submitted: true,
          },
        },
      });

      expect(stripeAccountService.update).toHaveBeenCalledWith('acct_123', {
        chargesEnabled: true,
        payoutsEnabled: true,
        detailsSubmitted: true,
      });
    });

    it('should skip duplicate events (idempotency)', async () => {
      prisma.webhook.findUnique.mockResolvedValue({ id: 'existing', stripeEventId: 'evt_dup' });

      const result = await service.handleEvent({
        id: 'evt_dup',
        type: 'payout.paid',
        data: { object: {} },
      });

      expect(result).toEqual({ received: true, duplicate: true });
      expect(prisma.webhook.create).not.toHaveBeenCalled();
    });

    it('should handle unknown event types gracefully', async () => {
      prisma.webhook.findUnique.mockResolvedValue(null);
      prisma.webhook.create.mockResolvedValue({});
      prisma.webhook.update.mockResolvedValue({});

      const result = await service.handleEvent({
        id: 'evt_4',
        type: 'charge.succeeded',
        data: { object: {} },
      });

      expect(result).toEqual({ received: true });
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should parse valid JSON payload', () => {
      const originalEnv = process.env.STRIPE_WEBHOOK_SECRET;
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

      const event = service.verifyWebhookSignature(
        '{"id":"evt_1","type":"test","data":{"object":{}}}',
        'sig_test',
      );

      expect(event.id).toBe('evt_1');
      process.env.STRIPE_WEBHOOK_SECRET = originalEnv;
    });

    it('should throw if webhook secret not configured', () => {
      const originalEnv = process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_WEBHOOK_SECRET;

      expect(() =>
        service.verifyWebhookSignature('{}', 'sig'),
      ).toThrow(BadRequestException);

      process.env.STRIPE_WEBHOOK_SECRET = originalEnv;
    });

    it('should throw for invalid JSON', () => {
      const originalEnv = process.env.STRIPE_WEBHOOK_SECRET;
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

      expect(() =>
        service.verifyWebhookSignature('not-json', 'sig'),
      ).toThrow(BadRequestException);

      process.env.STRIPE_WEBHOOK_SECRET = originalEnv;
    });
  });
});
