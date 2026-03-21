import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  TransactionStatus,
  DisputeStatus,
  OnboardingStatus,
  WebhookStatus,
} from '@prisma/client';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface TransactionQuery extends PaginationQuery {
  status?: TransactionStatus;
}

export interface DisputeQuery extends PaginationQuery {
  status?: DisputeStatus;
}

export interface ProviderQuery extends PaginationQuery {
  onboardingStatus?: OnboardingStatus;
}

export interface WebhookQuery extends PaginationQuery {
  status?: WebhookStatus;
  eventType?: string;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Transactions ─────────────────────────────────────────────────────────

  async getTransactions(query: TransactionQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where = query.status ? { status: query.status } : {};

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          buyer: { select: { id: true, displayName: true, email: true } },
          provider: { select: { id: true, displayName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Disputes ─────────────────────────────────────────────────────────────

  async getDisputes(query: DisputeQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const where = query.status ? { status: query.status } : {};

    const [data, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        include: {
          transaction: {
            select: {
              id: true,
              amount: true,
              status: true,
              description: true,
            },
          },
          filedBy: { select: { id: true, displayName: true, email: true } },
          evidence: { select: { id: true, createdAt: true, submittedById: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Providers ────────────────────────────────────────────────────────────

  async getProviders(query: ProviderQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: any = { role: 'PROVIDER' as const };
    if (query.onboardingStatus) {
      where.connectedAccount = {
        onboardingStatus: query.onboardingStatus,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          displayName: true,
          email: true,
          createdAt: true,
          connectedAccount: {
            select: {
              onboardingStatus: true,
              chargesEnabled: true,
              payoutsEnabled: true,
              createdAt: true,
            },
          },
          _count: {
            select: { providerTransactions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Webhook Logs ─────────────────────────────────────────────────────────

  async getWebhookLogs(query: WebhookQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.eventType) where.eventType = query.eventType;

    const [data, total] = await Promise.all([
      this.prisma.webhookLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.webhookLog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Platform Health ──────────────────────────────────────────────────────

  async getPlatformHealth() {
    const [
      pendingWebhooks,
      failedWebhooks,
      activeHolds,
      openDisputes,
      pendingPayouts,
      failedPayouts,
      totalUsers,
      totalProviders,
    ] = await Promise.all([
      this.prisma.webhookLog.count({
        where: { status: { in: [WebhookStatus.RECEIVED, WebhookStatus.PROCESSING] } },
      }),
      this.prisma.webhookLog.count({
        where: { status: WebhookStatus.FAILED },
      }),
      this.prisma.transaction.count({
        where: {
          status: {
            in: [TransactionStatus.PAYMENT_HELD, TransactionStatus.DELIVERED],
          },
        },
      }),
      this.prisma.dispute.count({
        where: {
          status: { in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] },
        },
      }),
      this.prisma.payout.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.payout.count({
        where: { status: 'FAILED' },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'PROVIDER' } }),
    ]);

    return {
      pendingWebhooks,
      failedWebhooks,
      activeHolds,
      openDisputes,
      pendingPayouts,
      failedPayouts,
      totalUsers,
      totalProviders,
      timestamp: new Date().toISOString(),
    };
  }
}
