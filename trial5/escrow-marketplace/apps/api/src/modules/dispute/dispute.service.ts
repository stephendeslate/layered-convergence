import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DisputeStatus, TransactionStatus } from '@prisma/client';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDisputeDto) {
    const transaction = await this.prisma.transaction.findUniqueOrThrow({
      where: { id: dto.transactionId },
    });

    if (transaction.status !== TransactionStatus.HELD) {
      throw new BadRequestException(
        'Can only dispute transactions that are in HELD status',
      );
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        raisedById: dto.raisedById,
        reason: dto.reason,
        evidence: dto.evidence || {},
      },
    });

    // Side effect: transition transaction to DISPUTED
    await this.prisma.transaction.update({
      where: { id: dto.transactionId },
      data: { status: TransactionStatus.DISPUTED },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: dto.transactionId,
        fromStatus: TransactionStatus.HELD,
        toStatus: TransactionStatus.DISPUTED,
        reason: `Dispute raised: ${dto.reason}`,
      },
    });

    this.logger.log(`Dispute created for transaction ${dto.transactionId}`);

    return dispute;
  }

  async resolve(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findUniqueOrThrow({
      where: { id },
      include: { transaction: true },
    });

    if (dispute.status !== DisputeStatus.OPEN && dispute.status !== DisputeStatus.UNDER_REVIEW) {
      throw new BadRequestException('Dispute is not in a resolvable state');
    }

    const disputeResolution = dto.resolution === 'buyer'
      ? DisputeStatus.RESOLVED_BUYER
      : DisputeStatus.RESOLVED_PROVIDER;

    const transactionStatus = dto.resolution === 'buyer'
      ? TransactionStatus.RESOLVED_BUYER
      : TransactionStatus.RESOLVED_PROVIDER;

    await this.prisma.dispute.update({
      where: { id },
      data: {
        status: disputeResolution,
        resolution: dto.resolutionNote,
      },
    });

    await this.prisma.transaction.update({
      where: { id: dispute.transactionId },
      data: { status: transactionStatus },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: dispute.transactionId,
        fromStatus: TransactionStatus.DISPUTED,
        toStatus: transactionStatus,
        reason: dto.resolutionNote || `Resolved in ${dto.resolution}'s favor`,
      },
    });

    this.logger.log(`Dispute ${id} resolved in ${dto.resolution}'s favor`);

    return this.prisma.dispute.findUniqueOrThrow({
      where: { id },
      include: { transaction: true },
    });
  }

  async submitEvidence(id: string, evidence: Record<string, unknown>) {
    await this.prisma.dispute.findUniqueOrThrow({ where: { id } });
    return this.prisma.dispute.update({
      where: { id },
      data: {
        evidence,
        status: DisputeStatus.EVIDENCE_SUBMITTED,
      },
    });
  }

  async findAll() {
    return this.prisma.dispute.findMany({
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
}
