import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async create(transactionId: string, recipientId: string, amount: number) {
    return this.prisma.payout.create({
      data: {
        transactionId,
        recipientId,
        amount: new Prisma.Decimal(amount),
      },
    });
  }

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.payout.findMany({
        include: { transaction: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.payout.findMany({
      where: { recipientId: userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string, role: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: { transaction: true },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (role !== 'ADMIN' && payout.recipientId !== userId) {
      throw new ForbiddenException('Access denied to this payout');
    }

    return payout;
  }

  async markCompleted(id: string) {
    return this.prisma.payout.update({
      where: { id },
      data: { completedAt: new Date() },
    });
  }
}
