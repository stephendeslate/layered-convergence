// TRACED:PV-003 — Dispute resolution flow exists for contested transactions
// TRACED:AC-006 — POST /disputes creates a dispute on a transaction
// TRACED:AC-007 — PATCH /disputes/:id/resolve resolves a dispute

import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { TransactionStatus, DisputeStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

const DISPUTABLE_STATUSES: TransactionStatus[] = [
  TransactionStatus.FUNDED,
  TransactionStatus.SHIPPED,
  TransactionStatus.DELIVERED,
];

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDisputeDto) {
    // findFirst justification: looking up transaction by id with ownership check
    // (buyer OR seller). findUnique does not support OR conditions in the where clause,
    // so findFirst is required for the compound ownership + id lookup.
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: dto.transactionId,
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (!DISPUTABLE_STATUSES.includes(transaction.status)) {
      throw new BadRequestException(
        `Cannot dispute a transaction in ${transaction.status} status`,
      );
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        filedBy: userId,
        reason: dto.reason,
      },
    });

    await this.prisma.transaction.update({
      where: { id: dto.transactionId },
      data: { status: TransactionStatus.DISPUTE },
    });

    this.logger.log(
      `Dispute ${dispute.id} filed on transaction ${dto.transactionId}`,
    );

    return dispute;
  }

  async findAllForUser(userId: string) {
    return this.prisma.dispute.findMany({
      where: {
        transaction: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      },
      include: { transaction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneForUser(id: string, userId: string) {
    // findFirst justification: querying dispute by id with nested ownership check
    // on the parent transaction (buyer OR seller). findUnique cannot express
    // nested relation filters with OR conditions.
    const dispute = await this.prisma.dispute.findFirst({
      where: {
        id,
        transaction: {
          OR: [{ buyerId: userId }, { sellerId: userId }],
        },
      },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async resolve(id: string, userId: string, dto: ResolveDisputeDto) {
    const dispute = await this.findOneForUser(id, userId);

    if (dispute.status === DisputeStatus.RESOLVED) {
      throw new BadRequestException('Dispute is already resolved');
    }

    const targetStatus =
      dto.outcome === 'REFUNDED'
        ? TransactionStatus.REFUNDED
        : TransactionStatus.FUNDED;

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: DisputeStatus.RESOLVED,
        resolution: dto.resolution,
      },
    });

    await this.prisma.transaction.update({
      where: { id: dispute.transactionId },
      data: { status: targetStatus },
    });

    this.logger.log(`Dispute ${id} resolved with outcome: ${dto.outcome}`);

    return updated;
  }
}
