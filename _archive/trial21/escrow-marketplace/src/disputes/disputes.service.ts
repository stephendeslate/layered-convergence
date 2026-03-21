import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import { CreateDisputeDto, ResolveDisputeDto } from './dto';
import { DisputeStatus, TransactionStatus } from '@prisma/client';

@Injectable()
export class DisputesService {
  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService,
  ) {}

  async create(userId: string, tenantId: string, dto: CreateDisputeDto) {
    const transaction = await this.transactionsService.findOne(
      dto.transactionId,
      tenantId,
    );

    if (transaction.status !== TransactionStatus.HELD) {
      throw new BadRequestException(
        'Can only dispute transactions in HELD status',
      );
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        raisedById: userId,
        reason: dto.reason,
        evidence: dto.evidence,
        tenantId,
        status: DisputeStatus.OPEN,
      },
      include: {
        transaction: true,
        raisedBy: { select: { id: true, email: true, name: true } },
      },
    });

    await this.transactionsService.transition(
      dto.transactionId,
      tenantId,
      { toStatus: TransactionStatus.DISPUTED },
      userId,
    );

    return dispute;
  }

  async findAll(tenantId: string) {
    return this.prisma.dispute.findMany({
      where: { tenantId },
      include: {
        transaction: true,
        raisedBy: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const dispute = await this.prisma.dispute.findFirst({
      where: { id, tenantId },
      include: {
        transaction: true,
        raisedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (!dispute) {
      throw new NotFoundException(`Dispute ${id} not found`);
    }

    return dispute;
  }

  async resolve(id: string, tenantId: string, dto: ResolveDisputeDto, resolvedBy: string) {
    const dispute = await this.findOne(id, tenantId);

    if (
      dispute.status !== DisputeStatus.OPEN &&
      dispute.status !== DisputeStatus.EVIDENCE_SUBMITTED &&
      dispute.status !== DisputeStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(
        `Cannot resolve dispute in ${dispute.status} status`,
      );
    }

    const updated = await this.prisma.dispute.update({
      where: { id },
      data: {
        status: dto.status,
        resolution: dto.resolution,
      },
      include: {
        transaction: true,
        raisedBy: { select: { id: true, email: true, name: true } },
      },
    });

    if (dto.status === DisputeStatus.RESOLVED_BUYER) {
      await this.transactionsService.transition(
        dispute.transactionId,
        tenantId,
        { toStatus: TransactionStatus.RESOLVED_BUYER, reason: dto.resolution },
        resolvedBy,
      );
    } else if (dto.status === DisputeStatus.RESOLVED_PROVIDER) {
      await this.transactionsService.transition(
        dispute.transactionId,
        tenantId,
        { toStatus: TransactionStatus.RESOLVED_PROVIDER, reason: dto.resolution },
        resolvedBy,
      );
    }

    return updated;
  }

  async submitEvidence(id: string, tenantId: string, evidence: string) {
    await this.findOne(id, tenantId);

    return this.prisma.dispute.update({
      where: { id },
      data: {
        evidence,
        status: DisputeStatus.EVIDENCE_SUBMITTED,
      },
    });
  }
}
