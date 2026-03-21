import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { validateTransition } from './transaction-state-machine';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        buyerId,
        providerId: dto.providerId,
        amount: dto.amount,
        currency: dto.currency ?? 'USD',
        description: dto.description,
        platformFee: dto.platformFee ?? 0,
        status: TransactionStatus.PENDING,
      },
    });
  }

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.transaction.findMany({
        include: { buyer: true, provider: true, milestones: true },
      });
    }
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
      include: { milestones: true },
    });
  }

  async findById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        buyer: true,
        provider: true,
        milestones: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        disputes: true,
      },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return transaction;
  }

  async updateStatus(
    id: string,
    newStatus: TransactionStatus,
    reason?: string,
    changedBy?: string,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    validateTransition(transaction.status, newStatus);

    return this.prisma.$transaction(async (tx) => {
      await tx.transactionStatusHistory.create({
        data: {
          transactionId: id,
          fromStatus: transaction.status,
          toStatus: newStatus,
          reason,
          changedBy,
        },
      });

      return tx.transaction.update({
        where: { id },
        data: { status: newStatus },
      });
    });
  }

  async getStatusHistory(transactionId: string) {
    return this.prisma.transactionStatusHistory.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
