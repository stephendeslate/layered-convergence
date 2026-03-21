import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus, Role } from '@prisma/client';
import { JwtPayload } from '../auth/auth.service';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayout(transactionId: string, user: JwtPayload) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { seller: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.RELEASED) {
      throw new BadRequestException('Can only create payouts for RELEASED transactions');
    }

    if (user.role !== Role.ADMIN && user.sub !== transaction.sellerId) {
      throw new ForbiddenException('Access denied');
    }

    // Check for existing payout
    // findFirst justified: checking if any payout already exists for this transaction
    const existingPayout = await this.prisma.payout.findFirst({
      // justification: checking for duplicate payout on transaction - no unique constraint on transactionId
      where: { transactionId },
    });

    if (existingPayout) {
      throw new BadRequestException('Payout already exists for this transaction');
    }

    return this.prisma.payout.create({
      data: {
        transactionId,
        userId: transaction.sellerId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: 'pending',
      },
      include: { transaction: true, user: true },
    });
  }

  async findAll(user: JwtPayload) {
    if (user.role === Role.ADMIN) {
      return this.prisma.payout.findMany({
        include: { transaction: true, user: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.payout.findMany({
      where: { userId: user.sub },
      include: { transaction: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: JwtPayload) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: { transaction: true, user: true },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (user.role !== Role.ADMIN && payout.userId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }

    return payout;
  }

  async updateStatus(id: string, status: string, stripePayoutId: string | null, user: JwtPayload) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can update payout status');
    }

    const payout = await this.prisma.payout.findUnique({
      where: { id },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return this.prisma.payout.update({
      where: { id },
      data: {
        status,
        ...(stripePayoutId && { stripePayoutId }),
      },
      include: { transaction: true, user: true },
    });
  }
}
