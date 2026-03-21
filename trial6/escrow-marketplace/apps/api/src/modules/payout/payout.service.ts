import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { PayoutQueryDto } from './dto/payout-query.dto';
import { PayoutStatus } from '@prisma/client';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayout(userId: string, amount: number) {
    return this.prisma.payout.create({
      data: {
        userId,
        amount,
        status: PayoutStatus.PENDING,
        stripeTransferId: `tr_${Date.now()}`,
      },
    });
  }

  async findAll(query: PayoutQueryDto) {
    return this.prisma.payout.findMany({
      where: {
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.payout.findFirstOrThrow({
      where: { id },
      include: { user: true },
    });
  }

  async completePayout(id: string) {
    return this.prisma.payout.update({
      where: { id },
      data: { status: PayoutStatus.COMPLETED },
    });
  }
}
