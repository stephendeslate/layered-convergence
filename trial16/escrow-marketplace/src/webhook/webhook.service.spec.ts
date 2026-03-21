import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { PayoutService } from '../payout/payout.service';
import { StripeAccountService } from '../stripe-account/stripe-account.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let payoutService: {
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let stripeAccountService: {
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    payoutService = { updateStatus: vi.fn() };
    stripeAccountService = { update: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: PayoutService, useValue: payoutService },
        { provide: StripeAccountService, useValue: stripeAccountService },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  describe('handleEvent', () => {
    it('should handle payout.paid event', async () => {
      payoutService.updateStatus.mockResolvedValue({});

      const result = await service.handleEvent({
        type: 'payout.paid',
        data: {
          object: {
            id: 'po_123',
            metadata: { escrowPayoutId: 'payout-1' },
          },
        },
      });

      expect(result.received).toBe(true);
      expect(payoutService.updateStatus).toHaveBeenCalledWith(
        'payout-1',
        'COMPLETED',
        'po_123',
      );
    });

    it('should handle payout.failed event', async () => {
      payoutService.updateStatus.mockResolvedValue({});

      await service.handleEvent({
        type: 'payout.failed',
        data: {
          object: {
            id: 'po_123',
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
      stripeAccountService.update.mockResolvedValue({});

      await service.handleEvent({
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

      expect(stripeAccountService.update).toHaveBeenCalled();
    });

    it('should handle unknown event type gracefully', async () => {
      const result = await service.handleEvent({
        type: 'unknown.event',
        data: { object: {} },
      });

      expect(result.received).toBe(true);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should throw if webhook secret not configured', () => {
      const original = process.env.STRIPE_WEBHOOK_SECRET;
      delete process.env.STRIPE_WEBHOOK_SECRET;

      expect(() =>
        service.verifyWebhookSignature('{}', 'sig'),
      ).toThrow(BadRequestException);

      if (original) process.env.STRIPE_WEBHOOK_SECRET = original;
    });

    it('should parse valid JSON payload', () => {
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

      const event = service.verifyWebhookSignature(
        JSON.stringify({ type: 'test', data: { object: {} } }),
        'sig',
      );

      expect(event.type).toBe('test');
      delete process.env.STRIPE_WEBHOOK_SECRET;
    });

    it('should throw for invalid JSON', () => {
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';

      expect(() =>
        service.verifyWebhookSignature('invalid', 'sig'),
      ).toThrow(BadRequestException);

      delete process.env.STRIPE_WEBHOOK_SECRET;
    });
  });
});
