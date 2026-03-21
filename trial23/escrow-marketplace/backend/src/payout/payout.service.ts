import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(sellerId: string) {
    return this.prisma.payout.findMany({
      where: { sellerId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, sellerId: string) {
    // findFirst justification: locate payout by ID scoped to the seller to enforce ownership
    const payout = await this.prisma.payout.findFirst({
      where: {
        id,
        sellerId,
      },
      include: { transaction: true },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return payout;
  }
}
