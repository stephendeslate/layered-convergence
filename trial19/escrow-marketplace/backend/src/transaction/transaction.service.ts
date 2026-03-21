import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  PENDING: [TransactionStatus.FUNDED],
  FUNDED: [TransactionStatus.SHIPPED, TransactionStatus.DISPUTED],
  SHIPPED: [TransactionStatus.DELIVERED, TransactionStatus.DISPUTED],
  DELIVERED: [TransactionStatus.RELEASED, TransactionStatus.DISPUTED],
  RELEASED: [],
  DISPUTED: [TransactionStatus.RESOLVED],
  RESOLVED: [TransactionStatus.RELEASED, TransactionStatus.REFUNDED],
  REFUNDED: [],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        title: dto.title,
        description: dto.description,
        amount: new Prisma.Decimal(dto.amount),
        buyerId,
        sellerId: dto.sellerId,
        status: TransactionStatus.PENDING,
      },
    });
  }

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.transaction.findMany({
        include: { buyer: true, seller: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: { buyer: true, seller: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string, role: string) {
    // findUnique: id is the primary key (@id)
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { buyer: true, seller: true, disputes: true, payouts: true },
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

    return transaction;
  }

  async updateStatus(
    id: string,
    newStatus: TransactionStatus,
    userId: string,
    role: string,
  ) {
    // findUnique: id is the primary key (@id)
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
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

    const allowedTransitions = VALID_TRANSITIONS[transaction.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${transaction.status} to ${newStatus}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  getValidTransitions(status: TransactionStatus): TransactionStatus[] {
    return VALID_TRANSITIONS[status] ?? [];
  }
}
