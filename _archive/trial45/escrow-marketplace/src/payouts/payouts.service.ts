import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PayoutStatus, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayoutDto } from './dto/create-payout.dto';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async create(providerId: string, dto: CreatePayoutDto) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
    });
    if (!transaction) {
      throw new NotFoundException(
        `Transaction ${dto.transactionId} not found`,
      );
    }
    if (transaction.status !== TransactionStatus.RELEASED) {
      throw new BadRequestException(
        'Payouts can only be created for released transactions',
      );
    }
    if (transaction.providerId !== providerId) {
      throw new BadRequestException(
        'You can only create payouts for your own transactions',
      );
    }

    return this.prisma.payout.create({
      data: {
        providerId,
        transactionId: dto.transactionId,
        amount: dto.amount,
        currency: dto.currency ?? 'USD',
        status: PayoutStatus.PENDING,
      },
    });
  }

  async findAll(providerId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.payout.findMany({
        include: { provider: true, transaction: true },
      });
    }
    return this.prisma.payout.findMany({
      where: { providerId },
      include: { transaction: true },
    });
  }

  async findById(id: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: { provider: true, transaction: true },
    });
    if (!payout) {
      throw new NotFoundException(`Payout ${id} not found`);
    }
    return payout;
  }

  async updateStatus(id: string, status: PayoutStatus) {
    const payout = await this.prisma.payout.findUnique({ where: { id } });
    if (!payout) {
      throw new NotFoundException(`Payout ${id} not found`);
    }

    return this.prisma.payout.update({
      where: { id },
      data: {
        status,
        processedAt:
          status === PayoutStatus.COMPLETED ? new Date() : undefined,
      },
    });
  }
}
