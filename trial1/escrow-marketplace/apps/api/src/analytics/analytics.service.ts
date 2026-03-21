import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TransactionStatus, DisputeStatus } from '@prisma/client';

export interface DateRange {
  from: Date;
  to: Date;
}

export type GroupBy = 'day' | 'week' | 'month';

/** Default cache TTL for analytics queries: 5 minutes */
const ANALYTICS_CACHE_TTL = 300;

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ─── Cache helpers ──────────────────────────────────────────────────────

  private cacheKey(method: string, ...parts: (string | number | undefined)[]): string {
    return `analytics:${method}:${parts.filter(Boolean).join(':')}`;
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        this.logger.debug(`Cache hit: ${key}`);
        return JSON.parse(cached) as T;
      }
    } catch {
      // Redis unavailable — fall through to DB
    }
    return null;
  }

  private async setCache(key: string, value: unknown, ttl: number = ANALYTICS_CACHE_TTL): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch {
      // Redis unavailable — non-critical
    }
  }

  // ─── Transaction Volume ───────────────────────────────────────────────────

  async getTransactionVolume(
    dateRange: DateRange,
    groupBy: GroupBy = 'day',
    providerId?: string,
  ) {
    const cacheKey = this.cacheKey('volume', dateRange.from.toISOString(), dateRange.to.toISOString(), groupBy, providerId);
    const cached = await this.getFromCache<any[]>(cacheKey);
    if (cached) return cached;

    const dateFormat =
      groupBy === 'day'
        ? 'YYYY-MM-DD'
        : groupBy === 'week'
          ? 'IYYY-"W"IW'
          : 'YYYY-MM';

    // Use parameterized query to prevent SQL injection
    const params: (Date | string)[] = [dateRange.from, dateRange.to];
    let providerFilter = '';
    if (providerId) {
      params.push(providerId);
      providerFilter = `AND "providerId" = $${params.length}`;
    }

    const results = await this.prisma.$queryRawUnsafe<
      { period: string; count: bigint; total_amount: bigint }[]
    >(
      `SELECT
        TO_CHAR("createdAt", '${dateFormat}') AS period,
        COUNT(*)::bigint AS count,
        COALESCE(SUM(amount), 0)::bigint AS total_amount
      FROM transactions
      WHERE "createdAt" >= $1
        AND "createdAt" <= $2
        AND status NOT IN ('CANCELLED', 'EXPIRED')
        ${providerFilter}
      GROUP BY period
      ORDER BY period ASC`,
      ...params,
    );

    const result = results.map((r) => ({
      period: r.period,
      count: Number(r.count),
      totalAmountCents: Number(r.total_amount),
    }));
    await this.setCache(cacheKey, result);
    return result;
  }

  // ─── Platform Fees ────────────────────────────────────────────────────────

  async getPlatformFees(dateRange: DateRange) {
    const cKey = this.cacheKey('fees', dateRange.from.toISOString(), dateRange.to.toISOString());
    const cached = await this.getFromCache<any>(cKey);
    if (cached) return cached;

    const result = await this.prisma.transaction.aggregate({
      where: {
        status: {
          in: [
            TransactionStatus.RELEASED,
            TransactionStatus.PAID_OUT,
          ],
        },
        releasedAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
      },
      _sum: { platformFee: true, amount: true },
      _count: true,
    });

    const fees = {
      totalFeesCents: result._sum.platformFee || 0,
      totalVolumeCents: result._sum.amount || 0,
      transactionCount: result._count,
    };
    await this.setCache(cKey, fees);
    return fees;
  }

  // ─── Dispute Rate ─────────────────────────────────────────────────────────

  async getDisputeRate(dateRange: DateRange) {
    const cKey = this.cacheKey('disputeRate', dateRange.from.toISOString(), dateRange.to.toISOString());
    const cached = await this.getFromCache<any>(cKey);
    if (cached) return cached;

    const [totalTransactions, disputedTransactions] = await Promise.all([
      this.prisma.transaction.count({
        where: {
          createdAt: { gte: dateRange.from, lte: dateRange.to },
          status: { notIn: [TransactionStatus.CANCELLED] },
        },
      }),
      this.prisma.dispute.count({
        where: {
          createdAt: { gte: dateRange.from, lte: dateRange.to },
        },
      }),
    ]);

    const disputeRate = {
      totalTransactions,
      disputedTransactions,
      disputeRate:
        totalTransactions > 0
          ? Number((disputedTransactions / totalTransactions).toFixed(4))
          : 0,
    };
    await this.setCache(cKey, disputeRate);
    return disputeRate;
  }

  // ─── Average Hold Time ────────────────────────────────────────────────────

  async getAverageHoldTime(dateRange: DateRange) {
    const cKey = this.cacheKey('holdTime', dateRange.from.toISOString(), dateRange.to.toISOString());
    const cached = await this.getFromCache<any>(cKey);
    if (cached) return cached;

    const result = await this.prisma.$queryRawUnsafe<
      { avg_hold_hours: number | null }[]
    >(
      `SELECT
        AVG(EXTRACT(EPOCH FROM ("releasedAt" - "paymentHeldAt")) / 3600)::float AS avg_hold_hours
      FROM transactions
      WHERE "releasedAt" IS NOT NULL
        AND "paymentHeldAt" IS NOT NULL
        AND "releasedAt" >= $1
        AND "releasedAt" <= $2`,
      dateRange.from,
      dateRange.to,
    );

    const holdTime = {
      averageHoldHours: result[0]?.avg_hold_hours
        ? Number(result[0].avg_hold_hours.toFixed(2))
        : null,
    };
    await this.setCache(cKey, holdTime);
    return holdTime;
  }

  // ─── Provider Leaderboard ─────────────────────────────────────────────────

  async getProviderLeaderboard(limit: number = 10) {
    const cKey = this.cacheKey('leaderboard', String(limit));
    const cached = await this.getFromCache<any[]>(cKey);
    if (cached) return cached;

    const results = await this.prisma.$queryRawUnsafe<
      {
        provider_id: string;
        display_name: string;
        transaction_count: bigint;
        total_volume: bigint;
        total_earned: bigint;
      }[]
    >(
      `SELECT
        u.id AS provider_id,
        u."displayName" AS display_name,
        COUNT(t.id)::bigint AS transaction_count,
        COALESCE(SUM(t.amount), 0)::bigint AS total_volume,
        COALESCE(SUM(t."providerAmount"), 0)::bigint AS total_earned
      FROM users u
      INNER JOIN transactions t ON t."providerId" = u.id
      WHERE t.status IN ('RELEASED', 'PAID_OUT')
      GROUP BY u.id, u."displayName"
      ORDER BY total_volume DESC
      LIMIT $1`,
      limit,
    );

    const leaderboard = results.map((r) => ({
      providerId: r.provider_id,
      displayName: r.display_name,
      transactionCount: Number(r.transaction_count),
      totalVolumeCents: Number(r.total_volume),
      totalEarnedCents: Number(r.total_earned),
    }));
    await this.setCache(cKey, leaderboard);
    return leaderboard;
  }

  // ─── Overview Metrics ─────────────────────────────────────────────────────

  async getOverviewMetrics(providerId?: string) {
    const cKey = this.cacheKey('overview', providerId);
    const cached = await this.getFromCache<any>(cKey);
    if (cached) return cached;

    const providerFilter = providerId ? { providerId } : {};

    const [
      totalTransactions,
      activeHolds,
      openDisputes,
      totalFees,
      totalVolume,
    ] = await Promise.all([
      this.prisma.transaction.count({
        where: {
          ...providerFilter,
          status: { notIn: [TransactionStatus.CANCELLED] },
        },
      }),
      this.prisma.transaction.count({
        where: {
          ...providerFilter,
          status: {
            in: [TransactionStatus.PAYMENT_HELD, TransactionStatus.DELIVERED],
          },
        },
      }),
      this.prisma.dispute.count({
        where: {
          status: {
            in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW],
          },
          ...(providerId
            ? { transaction: { providerId } }
            : {}),
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          ...providerFilter,
          status: {
            in: [TransactionStatus.RELEASED, TransactionStatus.PAID_OUT],
          },
        },
        _sum: { platformFee: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          ...providerFilter,
          status: { notIn: [TransactionStatus.CANCELLED, TransactionStatus.EXPIRED] },
        },
        _sum: { amount: true },
      }),
    ]);

    const overview = {
      totalTransactions,
      activeHolds,
      openDisputes,
      totalFeesCents: totalFees._sum.platformFee || 0,
      totalVolumeCents: totalVolume._sum.amount || 0,
    };
    // Overview has shorter TTL (60s) since it's the main dashboard
    await this.setCache(cKey, overview, 60);
    return overview;
  }
}
