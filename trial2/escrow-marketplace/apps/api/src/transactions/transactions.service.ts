import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionStatus, TransitionTrigger, canTransition, calculateFee, UserRole } from '@repo/shared';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AutoReleaseService } from './auto-release.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
    private configService: ConfigService,
    private autoReleaseService: AutoReleaseService,
  ) {}

  async create(buyerId: string, dto: CreateTransactionDto) {
    const provider = await this.prisma.user.findUnique({
      where: { id: dto.providerId },
    });

    if (!provider || provider.role !== 'PROVIDER') {
      throw new NotFoundException('Provider not found');
    }

    const feePercent = this.configService.get<number>('PLATFORM_FEE_PERCENT', 10);
    const minFee = this.configService.get<number>('MIN_PLATFORM_FEE_CENTS', 50);
    const feeResult = calculateFee(dto.amount, feePercent, minFee);

    const paymentIntent = await this.stripeService.createPaymentIntent(
      dto.amount,
      'usd',
      {
        buyerId,
        providerId: dto.providerId,
        platformFee: feeResult.platformFeeAmount.toString(),
      },
    );

    const transaction = await this.prisma.transaction.create({
      data: {
        buyerId,
        providerId: dto.providerId,
        amount: dto.amount,
        description: dto.description,
        status: 'CREATED',
        platformFeeAmount: feeResult.platformFeeAmount,
        platformFeePercent: feeResult.platformFeePercent,
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: transaction.id,
        fromState: 'CREATED',
        toState: 'CREATED',
        reason: 'Transaction created',
        performedBy: buyerId,
      },
    });

    return {
      ...transaction,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async findAll(userId: string, role: string, query: {
    status?: TransactionStatus;
    page?: number;
    limit?: number;
  }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (role === UserRole.BUYER) {
      where.buyerId = userId;
    } else if (role === UserRole.PROVIDER) {
      where.providerId = userId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, email: true } },
          provider: { select: { id: true, name: true, email: true } },
        },
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

  async findOne(id: string, userId: string, role: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        stateHistory: { orderBy: { createdAt: 'asc' } },
        disputes: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (
      role !== UserRole.ADMIN &&
      transaction.buyerId !== userId &&
      transaction.providerId !== userId
    ) {
      throw new ForbiddenException('Not authorized to view this transaction');
    }

    return transaction;
  }

  async releaseTransaction(
    transactionId: string,
    performedBy: string,
    trigger: TransitionTrigger = 'BUYER_CONFIRMED',
    reason: string = 'Delivery confirmed',
  ) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          provider: { include: { connectedAccount: true } },
        },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (!canTransition(transaction.status as TransactionStatus, TransactionStatus.RELEASED, trigger)) {
        throw new ConflictException(
          `Cannot release transaction in ${transaction.status} state`,
        );
      }

      const connectedAccount = transaction.provider.connectedAccount;
      if (!connectedAccount || connectedAccount.onboardingStatus !== 'ACTIVE') {
        throw new BadRequestException(
          'Provider does not have an active Stripe account',
        );
      }

      const providerAmount = transaction.amount - transaction.platformFeeAmount;

      const transfer = await this.stripeService.createTransfer(
        providerAmount,
        transaction.currency,
        connectedAccount.stripeAccountId,
        transaction.id,
        `transfer-${transaction.id}`,
        {
          transactionId: transaction.id,
          platformFee: transaction.platformFeeAmount.toString(),
        },
      );

      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'RELEASED',
          stripeTransferId: transfer.id,
          releasedAt: new Date(),
        },
      });

      await tx.payout.create({
        data: {
          transactionId,
          providerId: transaction.providerId,
          amount: providerAmount,
          currency: transaction.currency,
          status: 'PENDING',
          stripeTransferId: transfer.id,
        },
      });

      await tx.transactionStateHistory.create({
        data: {
          transactionId,
          fromState: transaction.status,
          toState: 'RELEASED',
          reason,
          performedBy,
        },
      });

      await this.autoReleaseService.cancelAutoRelease(transactionId);

      return updated;
    });
  }

  async refundTransaction(
    transactionId: string,
    performedBy: string,
    trigger: TransitionTrigger = 'ADMIN_REFUNDED',
    reason: string = 'Admin refund',
  ) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (!canTransition(transaction.status as TransactionStatus, TransactionStatus.REFUNDED, trigger)) {
        throw new ConflictException(
          `Cannot refund transaction in ${transaction.status} state`,
        );
      }

      if (transaction.stripePaymentIntentId) {
        await this.stripeService.createRefund(
          transaction.stripePaymentIntentId,
          `refund-${transaction.id}`,
        );
      }

      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
        },
      });

      await tx.transactionStateHistory.create({
        data: {
          transactionId,
          fromState: transaction.status,
          toState: 'REFUNDED',
          reason,
          performedBy,
        },
      });

      await this.autoReleaseService.cancelAutoRelease(transactionId);

      return updated;
    });
  }

  async holdTransaction(transactionId: string, stripePaymentIntentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { stripePaymentIntentId },
      });

      if (!transaction) {
        throw new NotFoundException(`No transaction for PaymentIntent ${stripePaymentIntentId}`);
      }

      if (transaction.status !== 'CREATED') {
        return transaction;
      }

      const holdDays = this.configService.get<number>('DEFAULT_HOLD_PERIOD_DAYS', 14);
      const holdExpiresAt = new Date();
      holdExpiresAt.setDate(holdExpiresAt.getDate() + holdDays);

      const updated = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: 'HELD',
          holdExpiresAt,
        },
      });

      await tx.transactionStateHistory.create({
        data: {
          transactionId: transaction.id,
          fromState: 'CREATED',
          toState: 'HELD',
          reason: 'Payment confirmed by Stripe',
          performedBy: 'system',
        },
      });

      await this.autoReleaseService.scheduleAutoRelease(transaction.id, holdExpiresAt);

      return updated;
    });
  }
}
