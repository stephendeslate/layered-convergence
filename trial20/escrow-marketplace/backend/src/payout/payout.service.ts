import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStatus, PayoutStatus, Role } from '@prisma/client';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Injectable()
export class PayoutService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, userRole: string, dto: CreatePayoutDto) {
    if (userRole !== Role.SELLER) {
      throw new ForbiddenException('Only sellers can request payouts');
    }

    await this.prisma.setRlsContext(userId);

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.sellerId !== userId) {
      throw new ForbiddenException('Only the seller can request a payout');
    }

    if (
      transaction.status !== TransactionStatus.DELIVERED &&
      transaction.status !== TransactionStatus.RELEASED &&
      transaction.status !== TransactionStatus.RESOLVED
    ) {
      throw new BadRequestException(
        'Transaction must be delivered, released, or resolved for payout',
      );
    }

    const existingPayout = await this.prisma.payout.findFirst({
      where: { transactionId: dto.transactionId },
    });

    if (existingPayout) {
      throw new BadRequestException('Payout already exists for this transaction');
    }

    return this.prisma.payout.create({
      data: {
        recipientId: userId,
        transactionId: dto.transactionId,
        amount: transaction.amount,
        status: PayoutStatus.PENDING,
      },
      include: {
        recipient: { select: { id: true, email: true, role: true } },
        transaction: true,
      },
    });
  }

  async findAll(userId: string) {
    await this.prisma.setRlsContext(userId);

    return this.prisma.payout.findMany({
      where: { recipientId: userId },
      include: {
        recipient: { select: { id: true, email: true, role: true } },
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    await this.prisma.setRlsContext(userId);

    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: {
        recipient: { select: { id: true, email: true, role: true } },
        transaction: true,
      },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (payout.recipientId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return payout;
  }
}
