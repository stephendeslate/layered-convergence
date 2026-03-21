import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TransactionStatus, PayoutStatus } from '@prisma/client';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreatePayoutDto) {
    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: { id: dto.transactionId, providerId: userId },
    });

    if (transaction.status !== TransactionStatus.RELEASED) {
      throw new BadRequestException(
        'Payouts can only be created for released transactions',
      );
    }

    return this.prisma.payout.create({
      data: {
        userId,
        transactionId: dto.transactionId,
        amount: dto.amount,
        status: PayoutStatus.PENDING,
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.payout.findMany({
      where: { userId },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneOrThrow(id: string) {
    return this.prisma.payout.findFirstOrThrow({
      where: { id },
      include: { transaction: true, user: true },
    });
  }

  async updateStatus(id: string, status: PayoutStatus, stripeTransferId?: string) {
    await this.prisma.payout.findFirstOrThrow({ where: { id } });
    return this.prisma.payout.update({
      where: { id },
      data: {
        status,
        stripeTransferId,
      },
    });
  }
}
