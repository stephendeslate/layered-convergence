import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

// TRACED:PV-002: Transaction lifecycle follows state machine pattern
// TRACED:AC-004: Transaction state transitions are validated
const VALID_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  [TransactionStatus.PENDING]: [TransactionStatus.FUNDED],
  [TransactionStatus.FUNDED]: [
    TransactionStatus.SHIPPED,
    TransactionStatus.DISPUTE,
  ],
  [TransactionStatus.SHIPPED]: [
    TransactionStatus.DELIVERED,
    TransactionStatus.DISPUTE,
  ],
  [TransactionStatus.DELIVERED]: [
    TransactionStatus.COMPLETED,
    TransactionStatus.DISPUTE,
  ],
  [TransactionStatus.COMPLETED]: [],
  [TransactionStatus.DISPUTE]: [
    TransactionStatus.REFUNDED,
    TransactionStatus.FUNDED,
  ],
  [TransactionStatus.REFUNDED]: [],
};

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto, buyerId: string) {
    return this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        buyerId,
        sellerId: dto.sellerId,
        status: TransactionStatus.PENDING,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    // findFirst justification: locate transaction by ID and verify user is a party
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: { disputes: true, payouts: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async updateStatus(
    id: string,
    newStatus: TransactionStatus,
    userId: string,
  ) {
    const transaction = await this.findOne(id, userId);

    const allowedStatuses = VALID_TRANSITIONS[transaction.status];

    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition from ${transaction.status} to ${newStatus}`,
      );
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: newStatus },
    });
  }
}
