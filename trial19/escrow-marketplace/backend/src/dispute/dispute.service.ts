import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DisputeStatus, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

const VALID_DISPUTE_TRANSITIONS: Record<DisputeStatus, DisputeStatus[]> = {
  OPEN: [DisputeStatus.INVESTIGATING],
  INVESTIGATING: [DisputeStatus.RESOLVED],
  RESOLVED: [],
};

const DISPUTABLE_STATUSES: TransactionStatus[] = [
  TransactionStatus.FUNDED,
  TransactionStatus.SHIPPED,
  TransactionStatus.DELIVERED,
];

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, role: string, dto: CreateDisputeDto) {
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

    if (!DISPUTABLE_STATUSES.includes(transaction.status)) {
      throw new BadRequestException(
        `Cannot dispute a transaction in ${transaction.status} status`,
      );
    }

    await this.prisma.transaction.update({
      where: { id: dto.transactionId },
      data: { status: TransactionStatus.DISPUTED },
    });

    return this.prisma.dispute.create({
      data: {
        reason: dto.reason,
        transactionId: dto.transactionId,
        buyerId: transaction.buyerId,
        sellerId: transaction.sellerId,
        status: DisputeStatus.OPEN,
      },
    });
  }

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.dispute.findMany({
        include: { transaction: true, buyer: true, seller: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.dispute.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: { transaction: true, buyer: true, seller: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId: string, role: string) {
    // findUnique: id is the primary key (@id)
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true, buyer: true, seller: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (
      role !== 'ADMIN' &&
      dispute.buyerId !== userId &&
      dispute.sellerId !== userId
    ) {
      throw new ForbiddenException('Access denied to this dispute');
    }

    return dispute;
  }

  async updateStatus(id: string, newStatus: DisputeStatus, userId: string, role: string) {
    // findUnique: id is the primary key (@id)
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (
      role !== 'ADMIN' &&
      dispute.buyerId !== userId &&
      dispute.sellerId !== userId
    ) {
      throw new ForbiddenException('Access denied to this dispute');
    }

    const allowedTransitions = VALID_DISPUTE_TRANSITIONS[dispute.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition dispute from ${dispute.status} to ${newStatus}`,
      );
    }

    return this.prisma.dispute.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async resolve(id: string, userId: string, role: string, dto: ResolveDisputeDto) {
    // findUnique: id is the primary key (@id)
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (
      role !== 'ADMIN' &&
      dispute.buyerId !== userId &&
      dispute.sellerId !== userId
    ) {
      throw new ForbiddenException('Access denied to this dispute');
    }

    if (dispute.status === DisputeStatus.RESOLVED) {
      throw new BadRequestException('Dispute is already resolved');
    }

    await this.prisma.transaction.update({
      where: { id: dispute.transactionId },
      data: { status: TransactionStatus.RESOLVED },
    });

    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: DisputeStatus.RESOLVED,
        resolution: dto.resolution,
      },
    });
  }

  getValidTransitions(status: DisputeStatus): DisputeStatus[] {
    return VALID_DISPUTE_TRANSITIONS[status] ?? [];
  }
}
