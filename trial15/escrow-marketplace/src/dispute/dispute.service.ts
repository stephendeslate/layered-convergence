import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { SubmitEvidenceDto } from './dto/submit-evidence.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionStatus, Role } from '@prisma/client';
import { JwtPayload } from '../auth/auth.service';

@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async create(dto: CreateDisputeDto, user: JwtPayload) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: dto.transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.buyerId !== user.sub) {
      throw new ForbiddenException('Only the buyer can file a dispute');
    }

    if (transaction.status !== TransactionStatus.FUNDED) {
      throw new BadRequestException('Can only dispute a FUNDED transaction');
    }

    // Update transaction status to DISPUTED
    await this.transactionService.updateStatus(
      dto.transactionId,
      TransactionStatus.DISPUTED,
      user,
    );

    return this.prisma.dispute.create({
      data: {
        transactionId: dto.transactionId,
        filedById: user.sub,
        reason: dto.reason,
        evidence: [],
      },
      include: { transaction: true, filedBy: true },
    });
  }

  async findAll(user: JwtPayload) {
    if (user.role === Role.ADMIN) {
      return this.prisma.dispute.findMany({
        include: { transaction: true, filedBy: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.dispute.findMany({
      where: { filedById: user.sub },
      include: { transaction: true, filedBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: JwtPayload) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true, filedBy: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (user.role !== Role.ADMIN && dispute.filedById !== user.sub) {
      // findFirst justified: checking if user is buyer or seller on the transaction
      const transaction = await this.prisma.transaction.findFirst({
        // justification: checking participant access - user must be buyer or seller
        where: {
          id: dispute.transactionId,
          OR: [{ buyerId: user.sub }, { sellerId: user.sub }],
        },
      });

      if (!transaction) {
        throw new ForbiddenException('Access denied');
      }
    }

    return dispute;
  }

  async submitEvidence(disputeId: string, dto: SubmitEvidenceDto, user: JwtPayload) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    // Both buyer and seller can submit evidence
    if (
      user.role !== Role.ADMIN &&
      dispute.transaction.buyerId !== user.sub &&
      dispute.transaction.sellerId !== user.sub
    ) {
      throw new ForbiddenException('Only transaction participants can submit evidence');
    }

    if (dispute.resolvedAt) {
      throw new BadRequestException('Cannot submit evidence to a resolved dispute');
    }

    const currentEvidence = (dispute.evidence as unknown[]) ?? [];
    const newEvidence = [
      ...currentEvidence,
      {
        submittedBy: user.sub,
        submittedAt: new Date().toISOString(),
        description: dto.description,
        documentUrl: dto.documentUrl ?? null,
        evidenceType: dto.evidenceType ?? 'general',
      },
    ];

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: { evidence: newEvidence },
      include: { transaction: true, filedBy: true },
    });
  }

  async resolve(disputeId: string, dto: ResolveDisputeDto, user: JwtPayload) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can resolve disputes');
    }

    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    if (dispute.resolvedAt) {
      throw new BadRequestException('Dispute already resolved');
    }

    // First transition to RESOLVED
    await this.transactionService.updateStatus(
      dispute.transactionId,
      TransactionStatus.RESOLVED,
      user,
    );

    // Then to final outcome (RELEASED or REFUNDED)
    if (dto.outcome === TransactionStatus.RELEASED || dto.outcome === TransactionStatus.REFUNDED) {
      await this.transactionService.updateStatus(
        dispute.transactionId,
        dto.outcome,
        user,
      );
    } else {
      throw new BadRequestException('Dispute outcome must be RELEASED or REFUNDED');
    }

    return this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        resolution: dto.resolution,
        resolvedAt: new Date(),
      },
      include: { transaction: true, filedBy: true },
    });
  }
}
