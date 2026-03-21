import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { transactionId: string; userId: string; amount: number }) {
    return this.prisma.payout.create({
      data: {
        transactionId: data.transactionId,
        userId: data.userId,
        amount: data.amount,
      },
      include: { transaction: true, user: true },
    });
  }

  async findAll() {
    return this.prisma.payout.findMany({
      include: { transaction: true, user: true },
    });
  }

  async findOne(id: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: { transaction: true, user: true },
    });
    if (!payout) {
      throw new NotFoundException(`Payout ${id} not found`);
    }
    return payout;
  }

  async findByUser(userId: string) {
    return this.prisma.payout.findMany({
      where: { userId },
      include: { transaction: true, user: true },
    });
  }
}
