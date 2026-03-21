import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhookHandlersService } from './webhook-handlers.service';
import { TransactionStatus, DisputeStatus } from '@prisma/client';

const mockPrisma = {
  transaction: {
    findFirst: vi.fn(),
  },
  dispute: {
    update: vi.fn(),
  },
};

const mockConfig = {
  get: vi.fn().mockReturnValue('redis://localhost:6379'),
};

const mockTransactionService = {
  findByPaymentIntentId: vi.fn(),
  findByChargeId: vi.fn(),
  confirmPayment: vi.fn(),
  expireTransaction: vi.fn(),
  markPaidOut: vi.fn(),
  refundTransaction: vi.fn(),
};

const mockDisputeService = {
  createChargebackDispute: vi.fn(),
};

const mockProviderService = {
  handleOnboardingUpdate: vi.fn(),
};

const mockPayoutService = {
  markPayoutPaid: vi.fn(),
  markPayoutFailed: vi.fn(),
};

const mockWebhookService = {
  markProcessed: vi.fn(),
  markFailed: vi.fn(),
  markSkipped: vi.fn(),
};

describe('WebhookHandlersService', () => {
  let service: WebhookHandlersService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WebhookHandlersService(
      mockPrisma as any,
      mockConfig as any,
      mockTransactionService as any,
      mockDisputeService as any,
      mockProviderService as any,
      mockPayoutService as any,
      mockWebhookService as any,
    );
  });

  // ─── Payment Intent Succeeded ─────────────────────────────────────────────

  describe('payment_intent.succeeded', () => {
    it('should confirm payment for matching transaction', async () => {
      mockTransactionService.findByPaymentIntentId.mockResolvedValue({
        id: 'txn-1',
        status: TransactionStatus.CREATED,
      });

      await service.processEvent({
        data: {
          eventId: 'evt_1',
          eventType: 'payment_intent.succeeded',
          data: { id: 'pi_1', latest_charge: 'ch_1' },
        },
      } as any);

      expect(mockTransactionService.confirmPayment).toHaveBeenCalledWith(
        'txn-1',
        'ch_1',
      );
      expect(mockWebhookService.markProcessed).toHaveBeenCalledWith('evt_1');
    });

    it('should skip if no matching transaction', async () => {
      mockTransactionService.findByPaymentIntentId.mockResolvedValue(null);

      await service.processEvent({
        data: {
          eventId: 'evt_2',
          eventType: 'payment_intent.succeeded',
          data: { id: 'pi_unknown' },
        },
      } as any);

      expect(mockTransactionService.confirmPayment).not.toHaveBeenCalled();
      expect(mockWebhookService.markSkipped).toHaveBeenCalledWith('evt_2');
    });

    it('should skip if transaction not in CREATED state (idempotent)', async () => {
      mockTransactionService.findByPaymentIntentId.mockResolvedValue({
        id: 'txn-1',
        status: TransactionStatus.PAYMENT_HELD, // already processed
      });

      await service.processEvent({
        data: {
          eventId: 'evt_3',
          eventType: 'payment_intent.succeeded',
          data: { id: 'pi_1' },
        },
      } as any);

      expect(mockTransactionService.confirmPayment).not.toHaveBeenCalled();
      expect(mockWebhookService.markSkipped).toHaveBeenCalledWith('evt_3');
    });
  });

  // ─── Payment Intent Canceled ──────────────────────────────────────────────

  describe('payment_intent.canceled', () => {
    it('should expire CREATED transaction', async () => {
      mockTransactionService.findByPaymentIntentId.mockResolvedValue({
        id: 'txn-1',
        status: TransactionStatus.CREATED,
      });

      await service.processEvent({
        data: {
          eventId: 'evt_4',
          eventType: 'payment_intent.canceled',
          data: { id: 'pi_1' },
        },
      } as any);

      expect(mockTransactionService.expireTransaction).toHaveBeenCalledWith(
        'txn-1',
      );
    });

    it('should expire PAYMENT_HELD transaction', async () => {
      mockTransactionService.findByPaymentIntentId.mockResolvedValue({
        id: 'txn-1',
        status: TransactionStatus.PAYMENT_HELD,
      });

      await service.processEvent({
        data: {
          eventId: 'evt_5',
          eventType: 'payment_intent.canceled',
          data: { id: 'pi_1' },
        },
      } as any);

      expect(mockTransactionService.expireTransaction).toHaveBeenCalledWith(
        'txn-1',
      );
    });
  });

  // ─── Payout Paid ──────────────────────────────────────────────────────────

  describe('payout.paid', () => {
    it('should mark payout as paid and transition transaction', async () => {
      mockPayoutService.markPayoutPaid.mockResolvedValue({
        id: 'payout-1',
        transactionId: 'txn-1',
      });

      await service.processEvent({
        data: {
          eventId: 'evt_6',
          eventType: 'payout.paid',
          data: { id: 'po_1' },
        },
      } as any);

      expect(mockPayoutService.markPayoutPaid).toHaveBeenCalledWith('po_1');
      expect(mockTransactionService.markPaidOut).toHaveBeenCalledWith('txn-1');
    });

    it('should skip if no matching payout', async () => {
      mockPayoutService.markPayoutPaid.mockResolvedValue(null);

      await service.processEvent({
        data: {
          eventId: 'evt_7',
          eventType: 'payout.paid',
          data: { id: 'po_unknown' },
        },
      } as any);

      expect(mockTransactionService.markPaidOut).not.toHaveBeenCalled();
      expect(mockWebhookService.markSkipped).toHaveBeenCalledWith('evt_7');
    });
  });

  // ─── Charge Dispute Created ───────────────────────────────────────────────

  describe('charge.dispute.created', () => {
    it('should create chargeback dispute', async () => {
      mockTransactionService.findByChargeId.mockResolvedValue({
        id: 'txn-1',
        status: TransactionStatus.PAYMENT_HELD,
      });

      await service.processEvent({
        data: {
          eventId: 'evt_8',
          eventType: 'charge.dispute.created',
          data: { charge: 'ch_1' },
        },
      } as any);

      expect(mockDisputeService.createChargebackDispute).toHaveBeenCalledWith(
        'txn-1',
      );
    });

    it('should skip if no charge ID', async () => {
      await service.processEvent({
        data: {
          eventId: 'evt_9',
          eventType: 'charge.dispute.created',
          data: {},
        },
      } as any);

      expect(mockDisputeService.createChargebackDispute).not.toHaveBeenCalled();
      expect(mockWebhookService.markSkipped).toHaveBeenCalledWith('evt_9');
    });
  });

  // ─── Charge Dispute Closed ────────────────────────────────────────────────

  describe('charge.dispute.closed', () => {
    it('should resolve dispute as RELEASED when provider wins', async () => {
      mockTransactionService.findByChargeId.mockResolvedValue({
        id: 'txn-1',
        status: TransactionStatus.DISPUTED,
        dispute: { id: 'dispute-1' },
      });

      await service.processEvent({
        data: {
          eventId: 'evt_10',
          eventType: 'charge.dispute.closed',
          data: { charge: 'ch_1', status: 'won' },
        },
      } as any);

      expect(mockPrisma.dispute.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dispute-1' },
          data: expect.objectContaining({
            status: DisputeStatus.RESOLVED_RELEASED,
          }),
        }),
      );
    });

    it('should resolve and refund when buyer wins', async () => {
      mockTransactionService.findByChargeId.mockResolvedValue({
        id: 'txn-1',
        status: TransactionStatus.DISPUTED,
        dispute: { id: 'dispute-1' },
      });

      await service.processEvent({
        data: {
          eventId: 'evt_11',
          eventType: 'charge.dispute.closed',
          data: { charge: 'ch_1', status: 'lost' },
        },
      } as any);

      expect(mockPrisma.dispute.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: DisputeStatus.RESOLVED_REFUNDED,
          }),
        }),
      );
      expect(mockTransactionService.refundTransaction).toHaveBeenCalled();
    });
  });

  // ─── Account Updated ──────────────────────────────────────────────────────

  describe('account.updated', () => {
    it('should update provider onboarding status', async () => {
      await service.processEvent({
        data: {
          eventId: 'evt_12',
          eventType: 'account.updated',
          data: { id: 'acct_1' },
        },
      } as any);

      expect(
        mockProviderService.handleOnboardingUpdate,
      ).toHaveBeenCalledWith('acct_1');
    });
  });

  // ─── Unhandled Events ─────────────────────────────────────────────────────

  describe('unhandled events', () => {
    it('should skip unhandled event types', async () => {
      await service.processEvent({
        data: {
          eventId: 'evt_13',
          eventType: 'some.unknown.event',
          data: {},
        },
      } as any);

      expect(mockWebhookService.markSkipped).toHaveBeenCalledWith('evt_13');
    });
  });

  // ─── Error Handling ───────────────────────────────────────────────────────

  describe('error handling', () => {
    it('should mark webhook as failed on handler error', async () => {
      mockTransactionService.findByPaymentIntentId.mockRejectedValue(
        new Error('DB connection lost'),
      );

      await expect(
        service.processEvent({
          data: {
            eventId: 'evt_14',
            eventType: 'payment_intent.succeeded',
            data: { id: 'pi_1' },
          },
        } as any),
      ).rejects.toThrow('DB connection lost');

      expect(mockWebhookService.markFailed).toHaveBeenCalledWith(
        'evt_14',
        'DB connection lost',
      );
    });
  });

  // ─── Payout Failed ────────────────────────────────────────────────────────

  describe('payout.failed', () => {
    it('should mark payout as failed', async () => {
      mockPayoutService.markPayoutFailed.mockResolvedValue({
        id: 'payout-1',
      });

      await service.processEvent({
        data: {
          eventId: 'evt_15',
          eventType: 'payout.failed',
          data: { id: 'po_1', failure_message: 'Insufficient funds' },
        },
      } as any);

      expect(mockPayoutService.markPayoutFailed).toHaveBeenCalledWith(
        'po_1',
        'Insufficient funds',
      );
    });
  });
});
