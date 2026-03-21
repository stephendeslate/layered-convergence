import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { toJsonValue } from '../../common/helpers/json.helper';

const VALID_DISPUTE_TRANSITIONS: Record<string, string[]> = {
  open: ['under_review'],
  under_review: ['resolved_buyer', 'resolved_provider', 'escalated'],
  escalated: ['resolved_buyer', 'resolved_provider'],
  // Terminal states: resolved_buyer, resolved_provider
};

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateDisputeDto) {
    this.logger.log(`User ${userId} creating dispute for transaction ${dto.transactionId}`);

    // Verify the transaction is in a disputable state
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id: dto.transactionId },
    });

    if (transaction.status !== 'held') {
      throw new BadRequestException(
        `Cannot dispute transaction in "${transaction.status}" state. Only "held" transactions can be disputed.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Transition the transaction to disputed
      await tx.transaction.update({
        where: { id: dto.transactionId },
        data: { status: 'disputed' },
      });

      await tx.transactionStateHistory.create({
        data: {
          transactionId: dto.transactionId,
          fromState: 'held',
          toState: 'disputed',
          reason: dto.reason,
        },
      });

      return tx.dispute.create({
        data: {
          transactionId: dto.transactionId,
          raisedById: userId,
          reason: dto.reason,
          evidence: dto.evidence ? toJsonValue(dto.evidence) : undefined,
        },
        include: { transaction: true, raisedBy: true },
      });
    });
  }

  async findAll(filters?: { transactionId?: string; status?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.transactionId) where.transactionId = filters.transactionId;
    if (filters?.status) where.status = filters.status;

    return this.prisma.dispute.findMany({
      where,
      include: { transaction: true, raisedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.dispute.findUniqueOrThrow({
      where: { id },
      include: { transaction: true, raisedBy: true },
    });
  }

  async resolve(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findUniqueOrThrow({
      where: { id },
    });

    const allowed = VALID_DISPUTE_TRANSITIONS[dispute.status] ?? [];
    if (!allowed.includes(dto.resolution)) {
      throw new BadRequestException(
        `Invalid dispute transition: ${dispute.status} -> ${dto.resolution}. ` +
        `Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
      );
    }

    this.logger.log(`Resolving dispute ${id}: ${dispute.status} -> ${dto.resolution}`);

    return this.prisma.$transaction(async (tx) => {
      // Update the associated transaction based on resolution
      const newTransactionState = dto.resolution === 'resolved_buyer' ? 'refunded' : 'released';

      if (dto.resolution === 'resolved_buyer' || dto.resolution === 'resolved_provider') {
        await tx.transaction.update({
          where: { id: dispute.transactionId },
          data: { status: newTransactionState },
        });

        await tx.transactionStateHistory.create({
          data: {
            transactionId: dispute.transactionId,
            fromState: 'disputed',
            toState: newTransactionState,
            reason: `Dispute ${dto.resolution}: ${dto.reason}`,
          },
        });
      }

      return tx.dispute.update({
        where: { id },
        data: {
          status: dto.resolution,
          resolution: dto.reason,
          resolvedAt: new Date(),
        },
        include: { transaction: true, raisedBy: true },
      });
    });
  }

  async addEvidence(id: string, evidence: Record<string, unknown>[]) {
    const dispute = await this.prisma.dispute.findUniqueOrThrow({
      where: { id },
    });

    if (dispute.status === 'resolved_buyer' || dispute.status === 'resolved_provider') {
      throw new BadRequestException('Cannot add evidence to a resolved dispute');
    }

    return this.prisma.dispute.update({
      where: { id },
      data: { evidence: toJsonValue(evidence) },
    });
  }
}
