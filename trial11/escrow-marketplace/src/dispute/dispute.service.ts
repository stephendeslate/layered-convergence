import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TransactionService } from '../transaction/transaction.service.js';
import { DisputeResolution, TransactionStatus, UserRole } from '../../generated/prisma/client.js';
import type { User } from '../../generated/prisma/client.js';

@Injectable()
export class DisputeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionService: TransactionService,
  ) {}

  async findByTransactionId(transactionId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { transactionId },
      include: { transaction: true, raisedBy: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async findById(id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { transaction: true, raisedBy: true },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async updateEvidence(id: string, evidence: string) {
    const dispute = await this.findById(id);

    if (dispute.resolution !== DisputeResolution.PENDING) {
      throw new BadRequestException('Cannot update evidence on a resolved dispute');
    }

    return this.prisma.dispute.update({
      where: { id },
      data: { evidence },
      include: { transaction: true, raisedBy: true },
    });
  }

  async resolve(id: string, resolution: DisputeResolution, adminUser: User) {
    const dispute = await this.findById(id);

    if (dispute.resolution !== DisputeResolution.PENDING) {
      throw new BadRequestException('Dispute already resolved');
    }

    if (resolution === DisputeResolution.PENDING) {
      throw new BadRequestException('Cannot resolve to PENDING status');
    }

    const updatedDispute = await this.prisma.dispute.update({
      where: { id },
      data: {
        resolution,
        resolvedAt: new Date(),
      },
      include: { transaction: true, raisedBy: true },
    });

    if (resolution === DisputeResolution.BUYER_WINS) {
      await this.transitionTransaction(dispute.transactionId, TransactionStatus.REFUNDED, adminUser);
    } else if (resolution === DisputeResolution.PROVIDER_WINS) {
      await this.transitionTransaction(dispute.transactionId, TransactionStatus.RELEASED, adminUser);
    }

    return updatedDispute;
  }

  private async transitionTransaction(transactionId: string, toState: TransactionStatus, adminUser: User) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) return;

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { status: toState },
    });

    await this.prisma.transactionStateHistory.create({
      data: {
        transactionId,
        fromState: transaction.status,
        toState,
        reason: `Dispute resolved: ${toState}`,
      },
    });
  }
}
