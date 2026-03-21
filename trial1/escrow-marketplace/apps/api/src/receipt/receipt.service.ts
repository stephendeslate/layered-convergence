import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus } from '@prisma/client';

export interface Receipt {
  receiptId: string;
  transactionId: string;
  status: string;
  generatedAt: string;

  // Parties
  buyer: { displayName: string; email: string };
  provider: { displayName: string; email: string };

  // Amounts
  amountCents: number;
  platformFeeCents: number;
  providerAmountCents: number;
  currency: string;

  // Description
  description: string;

  // Dates
  createdAt: string;
  paymentHeldAt: string | null;
  deliveredAt: string | null;
  releasedAt: string | null;
  paidOutAt: string | null;

  // Stripe references (redacted)
  paymentIntentId: string | null;
  transferId: string | null;
}

const RECEIPT_ELIGIBLE_STATUSES: TransactionStatus[] = [
  TransactionStatus.RELEASED,
  TransactionStatus.PAID_OUT,
];

@Injectable()
export class ReceiptService {
  private readonly logger = new Logger(ReceiptService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateReceipt(transactionId: string): Promise<Receipt> {
    const txn = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        buyer: { select: { displayName: true, email: true } },
        provider: { select: { displayName: true, email: true } },
      },
    });

    if (!txn) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Transaction not found',
        error: 'NOT_FOUND',
      });
    }

    if (!RECEIPT_ELIGIBLE_STATUSES.includes(txn.status)) {
      throw new BadRequestException({
        statusCode: 400,
        message:
          'Receipts can only be generated for completed (RELEASED or PAID_OUT) transactions',
        error: 'INVALID_STATUS',
      });
    }

    return {
      receiptId: `RCP-${txn.id}`,
      transactionId: txn.id,
      status: txn.status,
      generatedAt: new Date().toISOString(),

      buyer: txn.buyer,
      provider: txn.provider,

      amountCents: txn.amount,
      platformFeeCents: txn.platformFee,
      providerAmountCents: txn.providerAmount,
      currency: txn.currency,

      description: txn.description,

      createdAt: txn.createdAt.toISOString(),
      paymentHeldAt: txn.paymentHeldAt?.toISOString() || null,
      deliveredAt: txn.deliveredAt?.toISOString() || null,
      releasedAt: txn.releasedAt?.toISOString() || null,
      paidOutAt: txn.paidOutAt?.toISOString() || null,

      paymentIntentId: txn.stripePaymentIntentId
        ? `${txn.stripePaymentIntentId.slice(0, 7)}...`
        : null,
      transferId: txn.stripeTransferId
        ? `${txn.stripeTransferId.slice(0, 7)}...`
        : null,
    };
  }
}
