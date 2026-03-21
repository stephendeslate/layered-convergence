import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { TransactionService } from '../transaction/transaction.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dispute.dto';

/**
 * Dispute state machine:
 *
 *   open → resolved_buyer    (admin resolves in buyer's favor → refund)
 *   open → resolved_provider (admin resolves in provider's favor → release)
 *   open → escalated         (escalated to Stripe dispute process)
 *
 * Invalid transitions throw BadRequestException.
 */
const VALID_DISPUTE_TRANSITIONS: Record<string, string[]> = {
  open: ['resolved_buyer', 'resolved_provider', 'escalated'],
};

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(raisedById: string, dto: CreateDisputeDto) {
    // Verify transaction is in a disputable state
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id: dto.transactionId },
    });

    if (transaction.status !== 'held') {
      throw new BadRequestException(
        `Cannot dispute a transaction in '${transaction.status}' state. Only 'held' transactions can be disputed.`,
      );
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        raisedById,
        reason: dto.reason,
        evidence: dto.evidence ?? [],
        status: 'open',
      },
    });

    // Transition the transaction to disputed state
    await this.transactionService.dispute(dto.transactionId, dto.reason);

    this.logger.log(`Dispute created: ${dispute.id} for transaction ${dto.transactionId}`);
    return dispute;
  }

  async findAll(filters?: { transactionId?: string; status?: string }) {
    return this.prisma.dispute.findMany({
      where: {
        ...(filters?.transactionId && { transactionId: filters.transactionId }),
        ...(filters?.status && { status: filters.status }),
      },
      include: { transaction: true, raisedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.dispute.findUniqueOrThrow({
      where: { id },
      include: { transaction: true, raisedBy: true },
    });
  }

  async resolve(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findUniqueOrThrow({ where: { id } });
    const allowed = VALID_DISPUTE_TRANSITIONS[dispute.status] ?? [];

    if (!allowed.includes(dto.resolution)) {
      throw new BadRequestException(
        `Cannot transition dispute from '${dispute.status}' to '${dto.resolution}'. Allowed: [${allowed.join(', ')}]`,
      );
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: dto.resolution,
        resolution: dto.notes,
        resolvedAt: new Date(),
      },
    });

    // Apply the resolution to the transaction
    if (dto.resolution === 'resolved_buyer') {
      await this.transactionService.refund(dispute.transactionId, `Dispute ${id} resolved in buyer favor`);
    } else if (dto.resolution === 'resolved_provider') {
      await this.transactionService.release(dispute.transactionId, `Dispute ${id} resolved in provider favor`);
    }

    this.logger.log(`Dispute ${id} resolved: ${dto.resolution}`);
    return updated;
  }

  async addEvidence(id: string, evidence: Record<string, unknown>) {
    const dispute = await this.prisma.dispute.findUniqueOrThrow({ where: { id } });
    const existingEvidence = dispute.evidence as Record<string, unknown>[];

    return this.prisma.dispute.update({
      where: { id },
      data: { evidence: [...existingEvidence, evidence] },
    });
  }
}
