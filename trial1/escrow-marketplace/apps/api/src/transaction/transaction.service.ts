import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { AuditService } from '../audit/audit.service';
import { BullMqService } from '../bullmq/bullmq.service';
import {
  TransactionStatus,
  AuditAction,
  OnboardingStatus,
} from '@prisma/client';

/**
 * Valid state transitions for the payment hold lifecycle.
 * Any transition NOT in this map is rejected with INVALID_TRANSITION.
 */
const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  CREATED: [TransactionStatus.PAYMENT_HELD, TransactionStatus.CANCELLED],
  PAYMENT_HELD: [
    TransactionStatus.DELIVERED,
    TransactionStatus.DISPUTED,
    TransactionStatus.EXPIRED,
  ],
  DELIVERED: [TransactionStatus.RELEASED, TransactionStatus.DISPUTED],
  RELEASED: [TransactionStatus.PAID_OUT],
  PAID_OUT: [],
  DISPUTED: [TransactionStatus.RELEASED, TransactionStatus.REFUNDED],
  REFUNDED: [],
  EXPIRED: [],
  CANCELLED: [],
};

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);
  private readonly feePercent: number;
  private readonly autoReleaseHours: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly audit: AuditService,
    private readonly bullmq: BullMqService,
    private readonly config: ConfigService,
  ) {
    this.feePercent = this.config.get<number>('PLATFORM_FEE_PERCENT', 10);
    this.autoReleaseHours = this.config.get<number>('AUTO_RELEASE_HOURS', 72);
  }

  // ─── Fee Calculation ────────────────────────────────────────────────────────

  calculatePlatformFee(amountCents: number): {
    platformFee: number;
    providerAmount: number;
  } {
    let platformFee = Math.floor(amountCents * this.feePercent / 100);

    // Enforce minimum fee of $0.50 (50 cents)
    if (platformFee < 50) {
      platformFee = 50;
    }

    const providerAmount = amountCents - platformFee;

    if (providerAmount <= 0) {
      throw new BadRequestException(
        'Transaction amount too low for fee calculation',
      );
    }

    return { platformFee, providerAmount };
  }

  // ─── State Machine ──────────────────────────────────────────────────────────

  validateTransition(
    from: TransactionStatus,
    to: TransactionStatus,
  ): void {
    const valid = VALID_TRANSITIONS[from];
    if (!valid || !valid.includes(to)) {
      throw new BadRequestException({
        statusCode: 400,
        message: `Invalid transition from ${from} to ${to}`,
        error: 'INVALID_TRANSITION',
      });
    }
  }

  /**
   * Atomically transition a transaction and log the state change.
   * Uses a WHERE clause on current status to prevent race conditions.
   */
  private async transitionState(
    transactionId: string,
    fromStatus: TransactionStatus,
    toStatus: TransactionStatus,
    action: AuditAction,
    actorId: string | null,
    updateData: Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ) {
    this.validateTransition(fromStatus, toStatus);

    // Optimistic concurrency: only update if status matches
    const updated = await this.prisma.transaction.updateMany({
      where: { id: transactionId, status: fromStatus },
      data: { status: toStatus, ...updateData },
    });

    if (updated.count === 0) {
      // Transaction was modified concurrently or status already changed
      const current = await this.prisma.transaction.findUnique({
        where: { id: transactionId },
      });
      if (current?.status === toStatus) {
        // Already in target state — idempotent success
        return current;
      }
      throw new BadRequestException({
        statusCode: 400,
        message: `Transaction is not in ${fromStatus} state`,
        error: 'INVALID_TRANSITION',
      });
    }

    // Create audit trail
    await this.audit.logTransition({
      transactionId,
      fromStatus,
      toStatus,
      action,
      actorId,
      metadata: metadata || null,
    });

    return this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { buyer: true, provider: true },
    });
  }

  // ─── Create Transaction ─────────────────────────────────────────────────────

  async createTransaction(
    buyerId: string,
    providerId: string,
    amount: number,
    description: string,
  ) {
    // Validate amount
    if (amount < 500) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Minimum amount is $5.00 (500 cents)',
        error: 'AMOUNT_TOO_LOW',
      });
    }
    if (amount > 1000000) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Maximum amount is $10,000.00 (1000000 cents)',
        error: 'AMOUNT_TOO_HIGH',
      });
    }

    // Validate provider exists and is onboarded
    const provider = await this.prisma.user.findUnique({
      where: { id: providerId },
      include: { connectedAccount: true },
    });

    if (!provider) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Provider not found',
        error: 'PROVIDER_NOT_FOUND',
      });
    }

    if (provider.role !== 'PROVIDER') {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Specified user is not a provider',
        error: 'NOT_A_PROVIDER',
      });
    }

    if (
      !provider.connectedAccount ||
      provider.connectedAccount.onboardingStatus !== OnboardingStatus.COMPLETE
    ) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Provider has not completed onboarding',
        error: 'PROVIDER_NOT_ONBOARDED',
      });
    }

    // Calculate fees
    const { platformFee, providerAmount } = this.calculatePlatformFee(amount);

    // Create transaction record
    const transaction = await this.prisma.transaction.create({
      data: {
        buyerId,
        providerId,
        amount,
        platformFee,
        providerAmount,
        currency: 'usd',
        description,
        status: TransactionStatus.CREATED,
      },
    });

    // Log initial state
    await this.audit.logTransition({
      transactionId: transaction.id,
      fromStatus: null,
      toStatus: TransactionStatus.CREATED,
      action: AuditAction.TRANSACTION_CREATED,
      actorId: buyerId,
    });

    // Create Stripe PaymentIntent (manual capture for payment hold)
    const pi = await this.stripe.createPaymentIntent({
      amount,
      currency: 'usd',
      captureMethod: 'manual',
      metadata: {
        transactionId: transaction.id,
        buyerId,
        providerId,
      },
    });

    // Store PaymentIntent ID
    const updated = await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { stripePaymentIntentId: pi.id },
    });

    return {
      ...updated,
      clientSecret: pi.clientSecret,
    };
  }

  // ─── Confirm Payment (webhook-triggered) ────────────────────────────────────

  async confirmPayment(transactionId: string, stripeChargeId?: string) {
    const txn = await this.findTransactionOrThrow(transactionId);

    return this.transitionState(
      transactionId,
      TransactionStatus.CREATED,
      TransactionStatus.PAYMENT_HELD,
      AuditAction.PAYMENT_HELD,
      null, // system action
      {
        paymentHeldAt: new Date(),
        ...(stripeChargeId ? { stripeChargeId } : {}),
      },
    );
  }

  // ─── Mark Delivery (provider) ───────────────────────────────────────────────

  async markDelivery(transactionId: string, providerId: string) {
    const txn = await this.findTransactionOrThrow(transactionId);

    if (txn.providerId !== providerId) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Only the transaction provider can mark delivery',
        error: 'NOT_PROVIDER',
      });
    }

    const autoReleaseAt = new Date(
      Date.now() + this.autoReleaseHours * 60 * 60 * 1000,
    );

    const result = await this.transitionState(
      transactionId,
      TransactionStatus.PAYMENT_HELD,
      TransactionStatus.DELIVERED,
      AuditAction.DELIVERY_MARKED,
      providerId,
      {
        deliveredAt: new Date(),
        autoReleaseAt,
      },
    );

    // Schedule auto-release timer
    await this.bullmq.scheduleAutoRelease(
      transactionId,
      this.autoReleaseHours * 60 * 60 * 1000,
    );

    return result;
  }

  // ─── Confirm Delivery / Release (buyer) ─────────────────────────────────────

  async confirmDelivery(transactionId: string, buyerId: string) {
    const txn = await this.findTransactionOrThrow(transactionId);

    if (txn.buyerId !== buyerId) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Only the transaction buyer can confirm delivery',
        error: 'NOT_BUYER',
      });
    }

    // Cancel auto-release timer
    await this.bullmq.cancelAutoRelease(transactionId);

    // Capture payment and create transfer
    const { stripeTransferId } = await this.captureAndTransfer(txn);

    return this.transitionState(
      transactionId,
      TransactionStatus.DELIVERED,
      TransactionStatus.RELEASED,
      AuditAction.DELIVERY_CONFIRMED,
      buyerId,
      {
        releasedAt: new Date(),
        autoReleaseAt: null,
        stripeTransferId,
      },
    );
  }

  // ─── Release Payment (admin or auto-release) ───────────────────────────────

  async releasePayment(
    transactionId: string,
    actorId: string | null,
    action: AuditAction = AuditAction.FUNDS_RELEASED,
  ) {
    const txn = await this.findTransactionOrThrow(transactionId);

    const { stripeTransferId } = await this.captureAndTransfer(txn);

    // Can release from DELIVERED or DISPUTED state
    return this.transitionState(
      transactionId,
      txn.status,
      TransactionStatus.RELEASED,
      action,
      actorId,
      {
        releasedAt: new Date(),
        autoReleaseAt: null,
        stripeTransferId,
      },
    );
  }

  // ─── Refund Transaction ─────────────────────────────────────────────────────

  async refundTransaction(
    transactionId: string,
    adminId: string,
    reason?: string,
  ) {
    const txn = await this.findTransactionOrThrow(transactionId);

    // Cancel or refund via Stripe
    let stripeRefundId: string | null = null;
    if (txn.stripePaymentIntentId) {
      if (txn.stripeChargeId) {
        // Payment was captured — issue refund
        const refund = await this.stripe.createRefund({
          paymentIntentId: txn.stripePaymentIntentId,
          reason,
        });
        stripeRefundId = refund.id;
      } else {
        // Payment not captured — cancel PaymentIntent
        await this.stripe.cancelPaymentIntent(txn.stripePaymentIntentId);
      }
    }

    return this.transitionState(
      transactionId,
      txn.status,
      TransactionStatus.REFUNDED,
      AuditAction.FUNDS_REFUNDED,
      adminId,
      {
        refundedAt: new Date(),
        ...(stripeRefundId ? { stripeRefundId } : {}),
      },
      reason ? { reason } : undefined,
    );
  }

  // ─── Expire Transaction ─────────────────────────────────────────────────────

  async expireTransaction(transactionId: string) {
    const txn = await this.findTransactionOrThrow(transactionId);

    // Cancel PaymentIntent if exists
    if (txn.stripePaymentIntentId) {
      try {
        await this.stripe.cancelPaymentIntent(txn.stripePaymentIntentId);
      } catch (err) {
        this.logger.warn(
          `Failed to cancel PaymentIntent for expired txn ${transactionId}: ${err}`,
        );
      }
    }

    return this.transitionState(
      transactionId,
      txn.status,
      TransactionStatus.EXPIRED,
      AuditAction.HOLD_EXPIRED,
      null,
      { expiredAt: new Date() },
    );
  }

  // ─── Cancel Transaction ─────────────────────────────────────────────────────

  async cancelTransaction(transactionId: string, buyerId: string) {
    const txn = await this.findTransactionOrThrow(transactionId);

    if (txn.buyerId !== buyerId) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Only the transaction buyer can cancel',
        error: 'NOT_BUYER',
      });
    }

    // Validate age < 1 hour
    const ageMs = Date.now() - txn.createdAt.getTime();
    if (ageMs > 60 * 60 * 1000) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Transaction can only be cancelled within 1 hour of creation',
        error: 'CANCELLATION_WINDOW_CLOSED',
      });
    }

    if (txn.stripePaymentIntentId) {
      try {
        await this.stripe.cancelPaymentIntent(txn.stripePaymentIntentId);
      } catch (err) {
        this.logger.warn(
          `Failed to cancel PaymentIntent for txn ${transactionId}: ${err}`,
        );
      }
    }

    return this.transitionState(
      transactionId,
      txn.status,
      TransactionStatus.CANCELLED,
      AuditAction.TRANSACTION_CANCELLED,
      buyerId,
      {},
    );
  }

  // ─── Paid Out (webhook-triggered) ───────────────────────────────────────────

  async markPaidOut(transactionId: string) {
    return this.transitionState(
      transactionId,
      TransactionStatus.RELEASED,
      TransactionStatus.PAID_OUT,
      AuditAction.PAYOUT_COMPLETED,
      null,
      { paidOutAt: new Date() },
    );
  }

  // ─── Queries ────────────────────────────────────────────────────────────────

  async findTransactionOrThrow(transactionId: string) {
    const txn = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        provider: { include: { connectedAccount: true } },
        buyer: true,
      },
    });

    if (!txn) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Transaction not found',
        error: 'NOT_FOUND',
      });
    }

    return txn;
  }

  async findByPaymentIntentId(paymentIntentId: string) {
    return this.prisma.transaction.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        provider: { include: { connectedAccount: true } },
        buyer: true,
      },
    });
  }

  async findByChargeId(chargeId: string) {
    return this.prisma.transaction.findFirst({
      where: { stripeChargeId: chargeId },
      include: {
        provider: { include: { connectedAccount: true } },
        buyer: true,
        dispute: true,
      },
    });
  }

  async listTransactions(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 20,
    statusFilter?: TransactionStatus,
  ) {
    const where =
      userRole === 'ADMIN'
        ? statusFilter
          ? { status: statusFilter }
          : {}
        : {
            OR: [{ buyerId: userId }, { providerId: userId }],
            ...(statusFilter ? { status: statusFilter } : {}),
          };

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: { buyer: true, provider: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTransactionDetail(transactionId: string) {
    const txn = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: true,
        provider: true,
        stateHistory: { orderBy: { createdAt: 'asc' } },
        dispute: { include: { evidence: true } },
        payout: true,
      },
    });

    if (!txn) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Transaction not found',
        error: 'NOT_FOUND',
      });
    }

    return txn;
  }

  async getTransactionHistory(transactionId: string) {
    // Verify transaction exists
    await this.findTransactionOrThrow(transactionId);

    return this.audit.getTransactionHistory(transactionId);
  }

  // ─── Timeline ──────────────────────────────────────────────────────────────

  async getTimeline(transactionId: string) {
    const txn = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: { select: { id: true, displayName: true } },
        provider: { select: { id: true, displayName: true } },
      },
    });

    if (!txn) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Transaction not found',
        error: 'NOT_FOUND',
      });
    }

    const history = await this.prisma.transactionStateHistory.findMany({
      where: { transactionId },
      include: {
        actor: { select: { id: true, displayName: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      transactionId,
      currentStatus: txn.status,
      timeline: history.map((entry) => ({
        id: entry.id,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        action: entry.action,
        actor: entry.actor
          ? { id: entry.actor.id, displayName: entry.actor.displayName, role: entry.actor.role }
          : { id: null, displayName: 'System', role: 'SYSTEM' },
        metadata: entry.metadata,
        timestamp: entry.createdAt.toISOString(),
      })),
    };
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private async captureAndTransfer(txn: {
    id: string;
    stripePaymentIntentId: string | null;
    providerAmount: number;
    provider: { connectedAccount?: { stripeAccountId: string } | null };
  }): Promise<{ stripeTransferId: string }> {
    let stripeTransferId = '';

    // Capture PaymentIntent
    if (txn.stripePaymentIntentId) {
      await this.stripe.capturePaymentIntent(txn.stripePaymentIntentId);
    }

    // Create transfer to provider's connected account
    const destination =
      txn.provider?.connectedAccount?.stripeAccountId || 'mock_destination';

    const transfer = await this.stripe.createTransfer({
      amount: txn.providerAmount,
      destination,
      transferGroup: txn.id,
      metadata: { transactionId: txn.id },
    });

    stripeTransferId = transfer.id;

    return { stripeTransferId };
  }
}
