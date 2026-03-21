import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateDisputeDto, ResolveDisputeDto, DisputeEvidenceDto } from './dto/create-dispute.dto';
import { DisputeQueryDto } from './dto/dispute-query.dto';
import { DisputeStatus, TransactionStatus } from '@prisma/client';
import { toJsonField, fromJsonField } from '../../common/helpers/json-field.helper';

interface EvidenceItem {
  description: string;
  evidenceUrl: string;
  addedAt: string;
}

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDisputeDto) {
    // Also transition the transaction to DISPUTED
    const [dispute] = await this.prisma.$transaction([
      this.prisma.dispute.create({
        data: {
          transactionId: dto.transactionId,
          raisedById: dto.raisedById,
          reason: dto.reason,
          status: DisputeStatus.OPEN,
        },
      }),
      this.prisma.transaction.update({
        where: { id: dto.transactionId },
        data: { status: TransactionStatus.DISPUTED },
      }),
      this.prisma.transactionStateHistory.create({
        data: {
          transactionId: dto.transactionId,
          fromState: TransactionStatus.HELD,
          toState: TransactionStatus.DISPUTED,
          reason: `Dispute raised: ${dto.reason}`,
        },
      }),
    ]);

    return dispute;
  }

  async addEvidence(disputeId: string, dto: DisputeEvidenceDto) {
    const dispute = await this.prisma.dispute.findFirstOrThrow({
      where: { id: disputeId },
    });

    const existingEvidence = fromJsonField<EvidenceItem[]>(dispute.evidence);
    const newEvidence: EvidenceItem = {
      description: dto.description,
      evidenceUrl: dto.evidenceUrl,
      addedAt: new Date().toISOString(),
    };

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        evidence: toJsonField([...existingEvidence, newEvidence]),
        status: DisputeStatus.UNDER_REVIEW,
      },
    });
  }

  async resolve(disputeId: string, dto: ResolveDisputeDto) {
    const dispute = await this.prisma.dispute.findFirstOrThrow({
      where: { id: disputeId },
      include: { transaction: true },
    });

    const newStatus =
      dto.resolvedInFavorOf === 'buyer'
        ? DisputeStatus.RESOLVED_BUYER
        : DisputeStatus.RESOLVED_PROVIDER;

    const transactionStatus =
      dto.resolvedInFavorOf === 'buyer'
        ? TransactionStatus.REFUNDED
        : TransactionStatus.RELEASED;

    const [updated] = await this.prisma.$transaction([
      this.prisma.dispute.update({
        where: { id: disputeId },
        data: {
          status: newStatus,
          resolution: dto.resolution,
          resolvedAt: new Date(),
        },
      }),
      this.prisma.transaction.update({
        where: { id: dispute.transactionId },
        data: { status: transactionStatus },
      }),
      this.prisma.transactionStateHistory.create({
        data: {
          transactionId: dispute.transactionId,
          fromState: TransactionStatus.DISPUTED,
          toState: transactionStatus,
          reason: `Dispute resolved: ${dto.resolution}`,
        },
      }),
    ]);

    return updated;
  }

  async findAll(query: DisputeQueryDto) {
    return this.prisma.dispute.findMany({
      where: {
        ...(query.transactionId
          ? { transactionId: query.transactionId }
          : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      include: { transaction: true, raisedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.dispute.findFirstOrThrow({
      where: { id },
      include: { transaction: true, raisedBy: true },
    });
  }
}
