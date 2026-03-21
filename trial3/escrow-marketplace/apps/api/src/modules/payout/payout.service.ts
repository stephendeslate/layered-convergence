import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayout(providerId: string, amount: number, currency: string = 'usd') {
    // Verify provider exists and is a provider
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: providerId, role: 'PROVIDER' },
      include: { connectedAccount: true },
    });

    if (!user.connectedAccount || !user.connectedAccount.payoutsEnabled) {
      throw new BadRequestException('Provider does not have payouts enabled. Complete onboarding first.');
    }

    return this.prisma.payout.create({
      data: {
        providerId,
        amount,
        currency,
        status: 'pending',
      },
    });
  }

  async findByProvider(providerId: string) {
    return this.prisma.payout.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, providerId: string) {
    return this.prisma.payout.findFirstOrThrow({
      where: { id, providerId },
    });
  }

  async updateStatus(id: string, status: string, stripeTransferId?: string) {
    return this.prisma.payout.update({
      where: { id },
      data: {
        status,
        ...(stripeTransferId ? { stripeTransferId } : {}),
      },
    });
  }

  async getProviderBalance(providerId: string) {
    // Sum of released transactions minus paid out amounts
    const [releasedSum, paidOutSum] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { providerId, status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.payout.aggregate({
        where: { providerId, status: 'completed' },
        _sum: { amount: true },
      }),
    ]);

    const earned = releasedSum._sum.amount ?? 0;
    const withdrawn = paidOutSum._sum.amount ?? 0;

    return {
      earned,
      withdrawn,
      available: earned - withdrawn,
      currency: 'usd',
    };
  }
}
