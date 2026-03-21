import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionStatus, Role, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { CurrentUserPayload } from '../common/decorators/current-user.decorator';

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePayoutDto, user: CurrentUserPayload) {
    await this.prisma.setRLSContext(user.sub, user.role);

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
      include: { seller: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.RELEASED) {
      throw new BadRequestException(
        'Payouts can only be created for RELEASED transactions',
      );
    }

    if (user.role !== Role.ADMIN && transaction.sellerId !== user.sub) {
      throw new ForbiddenException('Only the seller or admin can request a payout');
    }

    const existingPayout = await this.prisma.payout.findFirst({
      where: { transactionId: dto.transactionId },
    });

    if (existingPayout) {
      throw new BadRequestException('A payout already exists for this transaction');
    }

    const payoutAmount = new Prisma.Decimal(transaction.amount.toString())
      .minus(new Prisma.Decimal(transaction.platformFee.toString()))
      .toDecimalPlaces(2);

    return this.prisma.payout.create({
      data: {
        transactionId: dto.transactionId,
        userId: transaction.sellerId,
        amount: payoutAmount,
        platformFee: transaction.platformFee,
        status: 'PENDING',
      },
      include: { transaction: true, user: true },
    });
  }

  async createForTransaction(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.RELEASED) {
      throw new BadRequestException(
        'Payouts can only be created for RELEASED transactions',
      );
    }

    const existing = await this.prisma.payout.findFirst({
      where: { transactionId },
    });

    if (existing) {
      throw new BadRequestException('A payout already exists for this transaction');
    }

    const payoutAmount = new Prisma.Decimal(transaction.amount.toString())
      .minus(new Prisma.Decimal(transaction.platformFee.toString()))
      .toDecimalPlaces(2);

    return this.prisma.payout.create({
      data: {
        transactionId,
        userId: transaction.sellerId,
        amount: payoutAmount,
        platformFee: transaction.platformFee,
        status: 'PENDING',
      },
      include: { transaction: true, user: true },
    });
  }

  async findAll(user: CurrentUserPayload) {
    await this.prisma.setRLSContext(user.sub, user.role);

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

  async findOne(id: string) {
    const payout = await this.prisma.payout.findUnique({
      where: { id },
      include: { transaction: true, user: true },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    return payout;
  }

  async updateStatus(id: string, status: string, stripePayoutId?: string) {
    return this.prisma.payout.update({
      where: { id },
      data: {
        status,
        ...(stripePayoutId ? { stripePayoutId } : {}),
      },
      include: { transaction: true, user: true },
    });
  }
}
