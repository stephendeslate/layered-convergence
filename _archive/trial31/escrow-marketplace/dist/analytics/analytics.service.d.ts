import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getTransactionSummary(tenantId: string): Promise<{
        totalTransactions: number;
        totalVolume: number;
        totalFees: number;
        byStatus: Record<string, number>;
    }>;
    getDisputeMetrics(tenantId: string): Promise<{
        totalDisputes: number;
        disputeRate: number;
        resolvedDisputes: number;
        openDisputes: number;
    }>;
    getRevenueBreakdown(tenantId: string): Promise<{
        totalRevenue: number;
        releasedRevenue: number;
        pendingRevenue: number;
    }>;
}
