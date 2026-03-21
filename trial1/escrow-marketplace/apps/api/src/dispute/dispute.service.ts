import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { BullMqService } from '../bullmq/bullmq.service';
import { TransactionService } from '../transaction/transaction.service';
import {
  TransactionStatus,
  DisputeStatus,
  DisputeReason,
  AuditAction,
} from '@prisma/client';

const DISPUTE_WINDOW_MS = 72 * 60 * 60 * 1000; // 72 hours

@Injectable()
export class DisputeService {
  private readonly logger = new Logger(DisputeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly bullmq: BullMqService,
    private readonly transactionService: TransactionService,
  ) {}

  // ─── Create Dispute ─────────────────────────────────────────────────────────

  async createDispute(
    transactionId: string,
    filedById: string,
    reason: DisputeReason,
    description: string,
  ) {
    const txn = await this.transactionService.findTransactionOrThrow(
      transactionId,
    );

    // Only buyer can file disputes
    if (txn.buyerId !== filedById) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Only the transaction buyer can file a dispute',
        error: 'NOT_BUYER',
      });
    }

    // Transaction must be in PAYMENT_HELD or DELIVERED state
    if (
      txn.status !== TransactionStatus.PAYMENT_HELD &&
      txn.status !== TransactionStatus.DELIVERED
    ) {
      throw new BadRequestException({
        statusCode: 400,
        message:
          'Disputes can only be filed when transaction is in PAYMENT_HELD or DELIVERED state',
        error: 'INVALID_STATUS',
      });
    }

    // If DELIVERED, check 72-hour dispute window
    if (txn.status === TransactionStatus.DELIVERED && txn.deliveredAt) {
      const elapsed = Date.now() - txn.deliveredAt.getTime();
      if (elapsed > DISPUTE_WINDOW_MS) {
        throw new BadRequestException({
          statusCode: 400,
          message:
            'Dispute window has closed (72 hours after delivery)',
          error: 'DISPUTE_WINDOW_CLOSED',
        });
      }
    }

    // Check no existing dispute
    const existing = await this.prisma.dispute.findUnique({
      where: { transactionId },
    });
    if (existing) {
      throw new ConflictException({
        statusCode: 409,
        message: 'A dispute already exists for this transaction',
        error: 'DISPUTE_EXISTS',
      });
    }

    // Create dispute record
    const dispute = await this.prisma.dispute.create({
      data: {
        transactionId,
        filedById,
        reason,
        description,
        status: DisputeStatus.OPEN,
      },
    });

    // Transition transaction to DISPUTED
    await this.prisma.transaction.updateMany({
      where: { id: transactionId, status: txn.status },
      data: {
        status: TransactionStatus.DISPUTED,
        disputedAt: new Date(),
      },
    });

    // Log state transition
    await this.audit.logTransition({
      transactionId,
      fromStatus: txn.status,
      toStatus: TransactionStatus.DISPUTED,
      action: AuditAction.DISPUTE_OPENED,
      actorId: filedById,
      metadata: { disputeId: dispute.id, reason },
    });

    // Cancel auto-release timer if exists
    await this.bullmq.cancelAutoRelease(transactionId);

    return dispute;
  }

  // ─── Submit Evidence ────────────────────────────────────────────────────────

  async submitEvidence(
    disputeId: string,
    submittedById: string,
    content: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
  ) {
    const dispute = await this.findDisputeOrThrow(disputeId);

    // Dispute must be OPEN or UNDER_REVIEW
    if (
      dispute.status !== DisputeStatus.OPEN &&
      dispute.status !== DisputeStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Evidence can only be submitted for OPEN or UNDER_REVIEW disputes',
        error: 'DISPUTE_NOT_OPEN',
      });
    }

    // Actor must be buyer or provider of the transaction
    const txn = await this.transactionService.findTransactionOrThrow(
      dispute.transactionId,
    );
    if (txn.buyerId !== submittedById && txn.providerId !== submittedById) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Only parties to the transaction can submit evidence',
        error: 'NOT_PARTY',
      });
    }

    // Create evidence record
    const evidence = await this.prisma.disputeEvidence.create({
      data: {
        disputeId,
        submittedById,
        content,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
      },
    });

    // Transition dispute to UNDER_REVIEW if currently OPEN
    if (dispute.status === DisputeStatus.OPEN) {
      await this.prisma.dispute.update({
        where: { id: disputeId },
        data: { status: DisputeStatus.UNDER_REVIEW },
      });
    }

    // Log audit
    await this.audit.logTransition({
      transactionId: dispute.transactionId,
      fromStatus: TransactionStatus.DISPUTED,
      toStatus: TransactionStatus.DISPUTED,
      action: AuditAction.DISPUTE_EVIDENCE_ADDED,
      actorId: submittedById,
      metadata: { evidenceId: evidence.id },
    });

    return evidence;
  }

  // ─── Resolve Dispute ────────────────────────────────────────────────────────

  async resolveDispute(
    disputeId: string,
    adminId: string,
    resolution: 'RELEASE' | 'REFUND' | 'ESCALATE',
    note: string,
  ) {
    const dispute = await this.findDisputeOrThrow(disputeId);

    // Must be OPEN or UNDER_REVIEW
    if (
      dispute.status !== DisputeStatus.OPEN &&
      dispute.status !== DisputeStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Dispute is already resolved or escalated',
        error: 'DISPUTE_ALREADY_RESOLVED',
      });
    }

    if (resolution === 'ESCALATE') {
      return this.escalateDispute(disputeId, adminId, note);
    }

    if (resolution === 'RELEASE') {
      // Resolve in provider's favor — release funds
      await this.prisma.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED_RELEASED,
          resolvedById: adminId,
          resolutionNote: note,
          resolvedAt: new Date(),
        },
      });

      // Release payment
      const txn = await this.transactionService.releasePayment(
        dispute.transactionId,
        adminId,
        AuditAction.DISPUTE_RESOLVED,
      );

      return {
        dispute: await this.prisma.dispute.findUnique({
          where: { id: disputeId },
        }),
        transaction: txn,
      };
    }

    if (resolution === 'REFUND') {
      // Resolve in buyer's favor — refund
      await this.prisma.dispute.update({
        where: { id: disputeId },
        data: {
          status: DisputeStatus.RESOLVED_REFUNDED,
          resolvedById: adminId,
          resolutionNote: note,
          resolvedAt: new Date(),
        },
      });

      // Refund payment
      const txn = await this.transactionService.refundTransaction(
        dispute.transactionId,
        adminId,
        note,
      );

      return {
        dispute: await this.prisma.dispute.findUnique({
          where: { id: disputeId },
        }),
        transaction: txn,
      };
    }

    throw new BadRequestException({
      statusCode: 400,
      message: 'Invalid resolution action',
      error: 'INVALID_ACTION',
    });
  }

  // ─── Escalate Dispute ───────────────────────────────────────────────────────

  async escalateDispute(
    disputeId: string,
    adminId: string,
    note: string,
  ) {
    const dispute = await this.findDisputeOrThrow(disputeId);

    await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: DisputeStatus.ESCALATED,
        resolvedById: adminId,
        resolutionNote: note,
      },
    });

    await this.audit.logTransition({
      transactionId: dispute.transactionId,
      fromStatus: TransactionStatus.DISPUTED,
      toStatus: TransactionStatus.DISPUTED,
      action: AuditAction.DISPUTE_ESCALATED,
      actorId: adminId,
      metadata: { disputeId, note },
    });

    return this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { evidence: true },
    });
  }

  // ─── Queries ────────────────────────────────────────────────────────────────

  async findDisputeOrThrow(disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { evidence: true, transaction: true },
    });

    if (!dispute) {
      throw new NotFoundException({
        statusCode: 404,
        message: 'Dispute not found',
        error: 'NOT_FOUND',
      });
    }

    return dispute;
  }

  async listDisputes(
    userId: string,
    userRole: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const where =
      userRole === 'ADMIN'
        ? {}
        : {
            transaction: {
              OR: [{ buyerId: userId }, { providerId: userId }],
            },
          };

    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        include: {
          transaction: { select: { buyerId: true, providerId: true, amount: true, status: true } },
          evidence: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDisputeDetail(disputeId: string) {
    return this.findDisputeOrThrow(disputeId);
  }

  /**
   * Create a dispute from a Stripe chargeback event (system-initiated).
   */
  async createChargebackDispute(transactionId: string) {
    const txn = await this.transactionService.findTransactionOrThrow(
      transactionId,
    );

    // Check if dispute already exists
    const existing = await this.prisma.dispute.findUnique({
      where: { transactionId },
    });
    if (existing) {
      return existing;
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        transactionId,
        filedById: txn.buyerId,
        reason: DisputeReason.OTHER,
        description: 'Stripe chargeback dispute',
        status: DisputeStatus.OPEN,
      },
    });

    // Only transition if not already disputed
    if (txn.status !== TransactionStatus.DISPUTED) {
      const validFromStates: string[] = [
        TransactionStatus.PAYMENT_HELD,
        TransactionStatus.DELIVERED,
      ];
      if (validFromStates.includes(txn.status)) {
        await this.prisma.transaction.updateMany({
          where: { id: transactionId, status: txn.status },
          data: {
            status: TransactionStatus.DISPUTED,
            disputedAt: new Date(),
          },
        });

        await this.audit.logTransition({
          transactionId,
          fromStatus: txn.status,
          toStatus: TransactionStatus.DISPUTED,
          action: AuditAction.DISPUTE_OPENED,
          actorId: null,
          metadata: { source: 'stripe_chargeback', disputeId: dispute.id },
        });

        // Cancel auto-release timer
        await this.bullmq.cancelAutoRelease(transactionId);
      }
    }

    return dispute;
  }
}
