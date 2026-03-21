import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PayoutStatus } from '@prisma/client';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePayoutDto) {
    return this.prisma.payout.create({
      data: {
        userId: dto.userId,
        transactionId: dto.transactionId,
        amount: dto.amount,
        status: PayoutStatus.PENDING,
      },
    });
  }

  async processPayout(id: string) {
    const payout = await this.prisma.payout.findUniqueOrThrow({
      where: { id },
      include: { user: { include: { stripeAccount: true } } },
    });

    // In production: create Stripe transfer to connected account
    const stripeTransferId = `tr_demo_${Date.now()}`;

    const updated = await this.prisma.payout.update({
      where: { id },
      data: {
        status: PayoutStatus.COMPLETED,
        stripeTransferId,
      },
    });

    this.logger.log(`Payout ${id} processed: $${payout.amount / 100} to user ${payout.userId}`);

    return updated;
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
      include: { transaction: true, user: true },
    });
  }

  async getPayoutSummary(userId: string) {
    const payouts = await this.prisma.payout.findMany({
      where: { userId },
    });

    const total = payouts.reduce((sum, p) => sum + p.amount, 0);
    const completed = payouts.filter((p) => p.status === PayoutStatus.COMPLETED);
    const pending = payouts.filter((p) => p.status === PayoutStatus.PENDING);

    return {
      totalPayouts: payouts.length,
      totalAmount: total,
      completedCount: completed.length,
      completedAmount: completed.reduce((sum, p) => sum + p.amount, 0),
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
    };
  }
}
