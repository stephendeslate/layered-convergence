import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DisputeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(transactionId: string, userId: string, data: {
    reason: string;
    description?: string;
  }) {
    // Verify transaction exists and user is the buyer
    const transaction = await this.prisma.transaction.findFirstOrThrow({
      where: { id: transactionId, buyerId: userId },
    });

    if (transaction.status !== 'HELD') {
      throw new BadRequestException(
        `Cannot dispute a transaction in ${transaction.status} state. Must be HELD.`,
      );
    }

    // Check no existing open dispute
    // findFirst justified: checking for existence before creating is a valid null-check pattern
    const existingDispute = await this.prisma.dispute.findFirst({
      where: {
        transactionId,
        status: { in: ['OPEN', 'EVIDENCE_SUBMITTED', 'UNDER_REVIEW'] },
      },
    });

    if (existingDispute) {
      throw new BadRequestException('An open dispute already exists for this transaction');
    }

    const [dispute] = await this.prisma.$transaction([
      this.prisma.dispute.create({
        data: {
          transactionId,
          raisedBy: userId,
          reason: data.reason,
          description: data.description,
        },
      }),
      this.prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'DISPUTED' },
      }),
      this.prisma.transactionStateHistory.create({
        data: {
          transactionId,
          fromState: 'HELD',
          toState: 'DISPUTED',
          reason: `Dispute raised: ${data.reason}`,
        },
      }),
    ]);

    return dispute;
  }

  async findById(id: string) {
    return this.prisma.dispute.findFirstOrThrow({
      where: { id },
      include: {
        transaction: true,
        raisedByUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.dispute.findMany({
      include: {
        transaction: {
          select: { id: true, amount: true, description: true, buyerId: true, providerId: true },
        },
        raisedByUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitEvidence(id: string, userId: string, text: string) {
    const dispute = await this.prisma.dispute.findFirstOrThrow({
      where: { id },
      include: { transaction: true },
    });

    // Verify user is buyer or provider of the transaction
    const txn = dispute.transaction;
    if (txn.buyerId !== userId && txn.providerId !== userId) {
      throw new BadRequestException('You are not a party to this dispute');
    }

    const currentEvidence = Array.isArray(dispute.evidence) ? dispute.evidence : [];
    const newEvidence = [
      ...currentEvidence,
      { submittedBy: userId, text, submittedAt: new Date().toISOString() },
    ];

    return this.prisma.dispute.update({
      where: { id },
      data: {
        evidence: newEvidence,
        status: 'EVIDENCE_SUBMITTED',
      },
    });
  }

  async resolve(id: string, resolution: 'BUYER_FAVOR' | 'PROVIDER_FAVOR' | 'ESCALATED', notes?: string) {
    const dispute = await this.prisma.dispute.findFirstOrThrow({
      where: { id },
      include: { transaction: true },
    });

    const transactionId = dispute.transactionId;
    let newTransactionStatus: string;
    let disputeStatus: string;

    switch (resolution) {
      case 'BUYER_FAVOR':
        newTransactionStatus = 'RESOLVED_BUYER';
        disputeStatus = 'RESOLVED_BUYER';
        break;
      case 'PROVIDER_FAVOR':
        newTransactionStatus = 'RESOLVED_PROVIDER';
        disputeStatus = 'RESOLVED_PROVIDER';
        break;
      case 'ESCALATED':
        newTransactionStatus = 'DISPUTED'; // stays disputed
        disputeStatus = 'ESCALATED';
        break;
      default:
        throw new BadRequestException(`Invalid resolution: ${resolution}`);
    }

    await this.prisma.$transaction([
      this.prisma.dispute.update({
        where: { id },
        data: {
          status: disputeStatus as never,
          resolution: notes,
          resolvedAt: new Date(),
        },
      }),
      this.prisma.transaction.update({
        where: { id: transactionId },
        data: { status: newTransactionStatus as never },
      }),
      this.prisma.transactionStateHistory.create({
        data: {
          transactionId,
          fromState: 'DISPUTED',
          toState: newTransactionStatus,
          reason: `Dispute resolved: ${resolution}. ${notes ?? ''}`,
        },
      }),
    ]);

    return this.findById(id);
  }
}
