import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPayout(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    });

    if (transaction.status !== 'released') {
      throw new BadRequestException(
        `Cannot create payout for transaction in "${transaction.status}" state. Transaction must be "released".`,
      );
    }

    if (transaction.providerId !== userId) {
      throw new BadRequestException('Only the provider can receive payouts');
    }

    const payoutAmount = transaction.amount - transaction.platformFeeAmount;
    this.logger.log(`Creating payout of ${payoutAmount} cents for provider ${userId}`);

    // In production, this would create a Stripe Transfer
    const stripeTransferId = `tr_demo_${transactionId.slice(0, 8)}`;

    return this.prisma.payout.create({
      data: {
        userId,
        transactionId,
        amount: payoutAmount,
        stripeTransferId,
        status: 'processing',
      },
      include: { user: true, transaction: true },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.payout.findMany({
      where: { userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.payout.findUniqueOrThrow({
      where: { id },
      include: { user: true, transaction: true },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.payout.update({
      where: { id },
      data: { status },
    });
  }
}
