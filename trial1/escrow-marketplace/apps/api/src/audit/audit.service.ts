import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuditAction, TransactionStatus } from '@prisma/client';

export interface AuditLogParams {
  transactionId: string;
  fromStatus: TransactionStatus | null;
  toStatus: TransactionStatus;
  action: AuditAction;
  actorId?: string | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log a state transition in the TransactionStateHistory table.
   * This is the single source of truth for all transaction state changes.
   */
  async logTransition(params: AuditLogParams) {
    const entry = await this.prisma.transactionStateHistory.create({
      data: {
        transactionId: params.transactionId,
        fromStatus: params.fromStatus,
        toStatus: params.toStatus,
        action: params.action,
        actorId: params.actorId || null,
        metadata: (params.metadata as any) || undefined,
      },
    });

    this.logger.log(
      `Transition: ${params.fromStatus ?? 'null'} -> ${params.toStatus} ` +
        `[${params.action}] txn:${params.transactionId} actor:${params.actorId || 'system'}`,
    );

    return entry;
  }

  /**
   * Get the full audit trail for a transaction.
   */
  async getTransactionHistory(transactionId: string) {
    return this.prisma.transactionStateHistory.findMany({
      where: { transactionId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
