import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto/create-dispute.dto';
import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(userId: string, dto: CreateDisputeDto) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id: dto.transactionId },
    });

    if (transaction.status !== 'held') {
      throw new BadRequestException(
        'Disputes can only be raised against held transactions',
      );
    }

    // Transition transaction to disputed state
    await this.transactionService.transition(dto.transactionId, 'disputed', dto.reason);

    return this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        raisedById: userId,
        reason: dto.reason,
        evidence: dto.evidence ?? [],
      },
    });
  }

  async findAll(filters?: { transactionId?: string; status?: string }) {
    return this.prisma.dispute.findMany({
      where: filters,
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

    if (dispute.status !== 'open' && dispute.status !== 'under_review') {
      throw new BadRequestException(
        `Cannot resolve dispute in ${dispute.status} status`,
      );
    }

    const resolvedStatus = dto.outcome === 'buyer' ? 'resolved_buyer' : 'resolved_provider';

    // Transition the transaction based on outcome
    if (dto.outcome === 'buyer') {
      await this.transactionService.refund(dispute.transactionId, `Dispute resolved in buyer's favor: ${dto.resolution}`);
    } else {
      await this.transactionService.release(dispute.transactionId, `Dispute resolved in provider's favor: ${dto.resolution}`);
    }

    return this.prisma.dispute.update({
      where: { id },
      data: {
        status: resolvedStatus,
        resolution: dto.resolution,
        resolvedAt: new Date(),
      },
    });
  }

  async escalate(id: string) {
    return this.prisma.dispute.update({
      where: { id },
      data: { status: 'escalated' },
    });
  }

  async submitEvidence(id: string, evidence: Record<string, unknown>) {
    const dispute = await this.prisma.dispute.findUniqueOrThrow({
      where: { id },
    });

    const currentEvidence = dispute.evidence as Record<string, unknown>[];
    return this.prisma.dispute.update({
      where: { id },
      data: {
        evidence: [...currentEvidence, evidence],
        status: 'under_review',
      },
    });
  }
}
