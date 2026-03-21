import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionStateMachine } from '../transactions/transaction-state-machine';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { TransactionStatus, DisputeStatus } from '@prisma/client';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateMachine: TransactionStateMachine,
  ) {}

  async create(dto: CreateDisputeDto, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.HELD) {
      throw new BadRequestException('Can only dispute transactions in HELD status');
    }

    this.stateMachine.validateTransition(transaction.status, TransactionStatus.DISPUTED);

    const dispute = await this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        raisedById: userId,
        reason: dto.reason,
        evidence: dto.evidence,
      },
      include: { transaction: true, raisedBy: { select: { id: true, name: true, email: true } } },
    });

    await this.prisma.transaction.update({
      where: { id: dto.transactionId },
      data: { status: TransactionStatus.DISPUTED },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: dto.transactionId,
        fromState: TransactionStatus.HELD,
        toState: TransactionStatus.DISPUTED,
        reason: `Dispute raised: ${dto.reason}`,
        changedBy: userId,
      },
    });

    return dispute;
  }

  async findAll(filters?: { transactionId?: string; status?: DisputeStatus }) {
    return this.prisma.dispute.findMany({
      where: {
        ...(filters?.transactionId && { transactionId: filters.transactionId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        transaction: { select: { id: true, amount: true, status: true } },
        raisedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        transaction: true,
        raisedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    return dispute;
  }

  async resolve(id: string, dto: ResolveDisputeDto, adminId: string) {
    const dispute = await this.findById(id);

    if (dispute.status !== DisputeStatus.OPEN && dispute.status !== DisputeStatus.UNDER_REVIEW) {
      throw new BadRequestException('Dispute is already resolved');
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: dto.status,
        resolution: dto.resolution,
        resolvedAt: new Date(),
      },
      include: { transaction: true },
    });

    let newTransactionStatus: TransactionStatus;
    if (dto.status === DisputeStatus.RESOLVED_PROVIDER) {
      newTransactionStatus = TransactionStatus.RELEASED;
    } else if (dto.status === DisputeStatus.RESOLVED_BUYER) {
      newTransactionStatus = TransactionStatus.REFUNDED;
    } else {
      return updatedDispute;
    }

    this.stateMachine.validateTransition(dispute.transaction.status, newTransactionStatus);

    await this.prisma.transaction.update({
      where: { id: dispute.transactionId },
      data: { status: newTransactionStatus },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: dispute.transactionId,
        fromState: dispute.transaction.status,
        toState: newTransactionStatus,
        reason: `Dispute resolved: ${dto.resolution}`,
        changedBy: adminId,
      },
    });

    return updatedDispute;
  }
}
