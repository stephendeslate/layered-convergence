import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { PayoutStatus } from '@prisma/client';

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePayoutDto, providerId: string) {
    return this.prisma.payout.create({
      data: {
        transactionId: dto.transactionId,
        providerId,
        amount: dto.amount,
        stripeTransferId: dto.stripeTransferId,
        status: PayoutStatus.PENDING,
      },
      include: {
        transaction: { select: { id: true, amount: true, status: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll(providerId?: string) {
    return this.prisma.payout.findMany({
      where: providerId ? { providerId } : {},
      include: {
        transaction: { select: { id: true, amount: true, status: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        transaction: true,
        provider: { select: { id: true, name: true, email: true } },
      },
    });
    if (!payout) {
      throw new NotFoundException('Payout not found');
    }
    return payout;
  }

  async updateStatus(id: string, status: PayoutStatus) {
    await this.findById(id);
    return this.prisma.payout.update({
      where: { id },
      data: { status },
    });
  }

  async getProviderPayoutSummary(providerId: string) {
    const payouts = await this.prisma.payout.findMany({
      where: { providerId },
    });

    const totalPaid = payouts
      .filter((p) => p.status === PayoutStatus.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payouts
      .filter((p) => p.status === PayoutStatus.PENDING || p.status === PayoutStatus.PROCESSING)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPaid,
      totalPending,
      count: payouts.length,
    };
  }
}
