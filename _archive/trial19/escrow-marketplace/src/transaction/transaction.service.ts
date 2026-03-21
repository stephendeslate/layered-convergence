import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionStatus } from './dto/transition-transaction.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['FUNDED', 'EXPIRED'],
  FUNDED: ['DELIVERED', 'DISPUTED'],
  DELIVERED: ['RELEASED', 'DISPUTED'],
  RELEASED: [],
  DISPUTED: ['REFUNDED', 'RELEASED'],
  REFUNDED: [],
  EXPIRED: [],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        buyerId,
        providerId: dto.providerId,
        status: TransactionStatus.PENDING,
      },
      include: { buyer: true, provider: true },
    });
  }

  async findAll() {
    return this.prisma.transaction.findMany({
      include: { buyer: true, provider: true, stateHistory: true },
    });
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { buyer: true, provider: true, stateHistory: true },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return transaction;
  }

  async findByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { providerId: userId }],
      },
      include: { buyer: true, provider: true, stateHistory: true },
    });
  }

  async transition(id: string, newStatus: TransactionStatus) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    const currentStatus = transaction.status;
    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${currentStatus} to ${newStatus}`,
      );
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id },
        data: { status: newStatus as any },
        include: { buyer: true, provider: true, stateHistory: true },
      }),
      this.prisma.transactionStateHistory.create({
        data: {
          transactionId: id,
          fromStatus: currentStatus as any,
          toStatus: newStatus as any,
        },
      }),
    ]);

    return updated;
  }

  getValidTransitions() {
    return VALID_TRANSITIONS;
  }
}
