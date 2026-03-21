import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PayoutStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayoutDto } from './dto/create-payout.dto';

const VALID_PAYOUT_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  PENDING: [PayoutStatus.PROCESSING],
  PROCESSING: [PayoutStatus.COMPLETED, PayoutStatus.FAILED],
  COMPLETED: [],
  FAILED: [PayoutStatus.PENDING],
};

@Injectable()
export class PayoutService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, role: string, dto: CreatePayoutDto) {
    // findUnique: id is the primary key (@id)
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (
      role !== 'ADMIN' &&
      transaction.buyerId !== userId &&
      transaction.sellerId !== userId
    ) {
      throw new ForbiddenException('Access denied to this transaction');
    }

    return this.prisma.payout.create({
      data: {
        amount: new Prisma.Decimal(dto.amount),
        transactionId: dto.transactionId,
        recipientId: dto.recipientId,
        status: PayoutStatus.PENDING,
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
    // findUnique: id is the primary key (@id)
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

  async updateStatus(id: string, newStatus: PayoutStatus, userId: string, role: string) {
    // findUnique: id is the primary key (@id)
    const payout = await this.prisma.payout.findUnique({
      where: { id },
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    if (role !== 'ADMIN' && payout.recipientId !== userId) {
      throw new ForbiddenException('Access denied to this payout');
    }

    const allowedTransitions = VALID_PAYOUT_TRANSITIONS[payout.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition payout from ${payout.status} to ${newStatus}`,
      );
    }

    const data: { status: PayoutStatus; completedAt?: Date } = { status: newStatus };
    if (newStatus === PayoutStatus.COMPLETED) {
      data.completedAt = new Date();
    }

    return this.prisma.payout.update({
      where: { id },
      data,
    });
  }
}
