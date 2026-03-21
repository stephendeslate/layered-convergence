import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStateMachine } from './transaction-state-machine';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransitionTransactionDto } from './dto/transition-transaction.dto';
import { TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateMachine: TransactionStateMachine,
    @InjectQueue('escrow-timer') private readonly escrowQueue: Queue,
  ) {}

  async create(dto: CreateTransactionDto, buyerId: string, tenantId: string) {
    const feePercent = parseInt(process.env.PLATFORM_FEE_PERCENT || '5', 10);
    const platformFee = Math.round(dto.amount * (feePercent / 100));

    const transaction = await this.prisma.transaction.create({
      data: {
        amount: dto.amount,
        currency: dto.currency || 'usd',
        description: dto.description,
        platformFee,
        buyerId,
        providerId: dto.providerId,
        tenantId,
        status: TransactionStatus.CREATED,
      },
      include: { buyer: { select: { id: true, name: true, email: true } }, provider: { select: { id: true, name: true, email: true } } },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: transaction.id,
        fromState: TransactionStatus.CREATED,
        toState: TransactionStatus.CREATED,
        reason: 'Transaction created',
        changedBy: buyerId,
      },
    });

    return transaction;
  }

  async findAll(tenantId: string, filters?: { status?: TransactionStatus; buyerId?: string; providerId?: string }) {
    return this.prisma.transaction.findMany({
      where: {
        tenantId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.buyerId && { buyerId: filters.buyerId }),
        ...(filters?.providerId && { providerId: filters.providerId }),
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, tenantId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, tenantId },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        stateHistory: { orderBy: { createdAt: 'asc' } },
        disputes: true,
        payouts: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async transition(id: string, dto: TransitionTransactionDto, userId: string, tenantId: string) {
    const transaction = await this.findById(id, tenantId);

    this.stateMachine.validateTransition(transaction.status, dto.status);

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.status === TransactionStatus.HELD && {
          holdUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }),
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: id,
        fromState: transaction.status,
        toState: dto.status,
        reason: dto.reason,
        changedBy: userId,
      },
    });

    if (dto.status === TransactionStatus.HELD && updated.holdUntil) {
      const delay = updated.holdUntil.getTime() - Date.now();
      await this.escrowQueue.add('auto-release', { transactionId: id, tenantId }, { delay });
    }

    return updated;
  }

  async getStateHistory(transactionId: string, tenantId: string) {
    await this.findById(transactionId, tenantId);
    return this.prisma.transactionStateHistory.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
