import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPayout(transactionId: string) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id: transactionId },
    });

    if (transaction.status !== 'released') {
      throw new BadRequestException(
        `Cannot create payout for transaction in '${transaction.status}' state. Must be 'released'.`,
      );
    }

    const payoutAmount = transaction.amount - transaction.platformFee;
    const simulatedTransferId = `tr_test_${transactionId.substring(0, 8)}`;

    const payout = await this.prisma.payout.create({
      data: {
        userId: transaction.providerId,
        transactionId,
        amount: payoutAmount,
        stripeTransferId: simulatedTransferId,
        status: 'pending',
      },
    });

    this.logger.log(`Payout created: ${payout.id} — $${(payoutAmount / 100).toFixed(2)} for provider ${transaction.providerId}`);
    return payout;
  }

  async completePayout(id: string) {
    return this.prisma.payout.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  async failPayout(id: string) {
    return this.prisma.payout.update({
      where: { id },
      data: { status: 'failed' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.payout.findMany({
      where: { userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.payout.findUniqueOrThrow({
      where: { id },
      include: { transaction: true },
    });
  }
}
