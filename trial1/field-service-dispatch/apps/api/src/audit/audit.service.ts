import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEntry {
  companyId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          companyId: entry.companyId,
          userId: entry.userId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          metadata: entry.metadata ?? undefined,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
        },
      });
    } catch (err: any) {
      // Audit logging should never break business logic
      this.logger.error(`Failed to write audit log: ${err.message}`, err.stack);
    }
  }

  /**
   * Log a work order state transition.
   */
  async logWorkOrderTransition(
    companyId: string,
    userId: string | undefined,
    workOrderId: string,
    fromStatus: string | null,
    toStatus: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      companyId,
      userId,
      action: 'work_order.status_change',
      entityType: 'WorkOrder',
      entityId: workOrderId,
      metadata: {
        fromStatus,
        toStatus,
        ...metadata,
      },
    });
  }

  /**
   * Log a dispatch action (assign, unassign, route optimize).
   */
  async logDispatchAction(
    companyId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.log({
      companyId,
      userId,
      action: `dispatch.${action}`,
      entityType,
      entityId,
      metadata,
    });
  }
}
