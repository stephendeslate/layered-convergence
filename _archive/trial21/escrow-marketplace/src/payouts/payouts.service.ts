import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayoutDto } from './dto';
import { PayoutStatus, TransactionStatus } from '@prisma/client';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, tenantId: string, dto: CreatePayoutDto) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: dto.transactionId, tenantId },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${dto.transactionId} not found`);
    }

    if (transaction.status !== TransactionStatus.RELEASED) {
      throw new BadRequestException(
        'Can only create payouts for RELEASED transactions',
      );
    }

    const existingPayout = await this.prisma.payout.findUnique({
      where: { transactionId: dto.transactionId },
    });

    if (existingPayout) {
      throw new BadRequestException(
        'Payout already exists for this transaction',
      );
    }

    return this.prisma.payout.create({
      data: {
        userId: transaction.providerId,
        transactionId: dto.transactionId,
        amount: dto.amount,
        currency: dto.currency || 'usd',
        tenantId,
        status: PayoutStatus.PENDING,
      },
      include: {
        transaction: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.payout.findMany({
      where: { tenantId },
      include: {
        transaction: true,
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const payout = await this.prisma.payout.findFirst({
      where: { id, tenantId },
      include: {
        transaction: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    if (!payout) {
      throw new NotFoundException(`Payout ${id} not found`);
    }

    return payout;
  }

  async findByUser(userId: string, tenantId: string) {
    return this.prisma.payout.findMany({
      where: { userId, tenantId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, tenantId: string, status: PayoutStatus, stripeTransferId?: string) {
    await this.findOne(id, tenantId);

    return this.prisma.payout.update({
      where: { id },
      data: {
        status,
        ...(stripeTransferId && { stripeTransferId }),
      },
    });
  }
}
