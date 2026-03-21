import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TransactionStatus, UserRole } from '@repo/shared';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  async create(buyerId: string, dto: CreateDisputeDto) {
    return this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: dto.transactionId },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      if (transaction.status !== TransactionStatus.HELD) {
        throw new BadRequestException('Can only dispute HELD transactions');
      }

      if (transaction.buyerId !== buyerId) {
        throw new ForbiddenException('Only the buyer can raise a dispute');
      }

      const existingDispute = await tx.dispute.findFirst({
        where: {
          transactionId: dto.transactionId,
          status: {
            notIn: ['RESOLVED_BUYER', 'RESOLVED_PROVIDER', 'CLOSED'],
          },
        },
      });

      if (existingDispute) {
        throw new BadRequestException('Active dispute already exists for this transaction');
      }

      const dispute = await tx.dispute.create({
        data: {
          transactionId: dto.transactionId,
          raisedById: buyerId,
          reason: dto.reason,
          description: dto.description,
          status: 'OPEN',
        },
      });

      await tx.transaction.update({
        where: { id: dto.transactionId },
        data: { status: 'DISPUTED' },
      });

      await tx.transactionStateHistory.create({
        data: {
          transactionId: dto.transactionId,
          fromState: 'HELD',
          toState: 'DISPUTED',
          reason: `Dispute raised: ${dto.reason}`,
          performedBy: buyerId,
        },
      });

      return dispute;
    });
  }

  async findAll(userId: string, role: string, query: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (role !== UserRole.ADMIN) {
      where.OR = [
        { raisedById: userId },
        {
          transaction: {
            OR: [
              { buyerId: userId },
              { providerId: userId },
            ],
          },
        },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          transaction: {
            include: {
              buyer: { select: { id: true, name: true, email: true } },
              provider: { select: { id: true, name: true, email: true } },
            },
          },
          raisedBy: { select: { id: true, name: true } },
        },
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string, role: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        transaction: {
          include: {
            buyer: { select: { id: true, name: true, email: true } },
            provider: { select: { id: true, name: true, email: true } },
            stateHistory: { orderBy: { createdAt: 'asc' } },
          },
        },
        raisedBy: { select: { id: true, name: true } },
      },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (
      role !== UserRole.ADMIN &&
      dispute.raisedById !== userId &&
      dispute.transaction.buyerId !== userId &&
      dispute.transaction.providerId !== userId
    ) {
      throw new ForbiddenException('Not authorized to view this dispute');
    }

    return dispute;
  }

  async submitEvidence(disputeId: string, userId: string, role: string, evidence: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const isBuyer = dispute.transaction.buyerId === userId;
    const isProvider = dispute.transaction.providerId === userId;

    if (!isBuyer && !isProvider && role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to submit evidence');
    }

    const updateData: Record<string, unknown> = {
      status: 'EVIDENCE_SUBMITTED',
    };

    if (isBuyer) {
      updateData.buyerEvidence = evidence;
    } else if (isProvider) {
      updateData.providerEvidence = evidence;
    }

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: updateData,
    });
  }

  async resolve(disputeId: string, adminId: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const resolvableStates = ['OPEN', 'EVIDENCE_SUBMITTED', 'UNDER_REVIEW'];
    if (!resolvableStates.includes(dispute.status)) {
      throw new BadRequestException('Dispute is not in a resolvable state');
    }

    const newDisputeStatus = dto.resolution === 'BUYER'
      ? 'RESOLVED_BUYER'
      : 'RESOLVED_PROVIDER';

    const newTransactionStatus = dto.resolution === 'BUYER'
      ? TransactionStatus.REFUNDED
      : TransactionStatus.RELEASED;

    const trigger = dto.resolution === 'BUYER'
      ? 'DISPUTE_RESOLVED_BUYER' as const
      : 'DISPUTE_RESOLVED_PROVIDER' as const;

    // Update dispute
    const updated = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: newDisputeStatus,
        resolution: `Resolved in ${dto.resolution.toLowerCase()}'s favor`,
        adminNotes: dto.notes,
        resolvedAt: new Date(),
        resolvedById: adminId,
      },
    });

    // Execute the appropriate transaction action
    if (dto.resolution === 'BUYER') {
      await this.transactionsService.refundTransaction(
        dispute.transactionId,
        adminId,
        trigger,
        `Dispute resolved in buyer's favor: ${dto.notes}`,
      );
    } else {
      await this.transactionsService.releaseTransaction(
        dispute.transactionId,
        adminId,
        trigger,
        `Dispute resolved in provider's favor: ${dto.notes}`,
      );
    }

    return updated;
  }
}
