import { AnalyticsService } from './analytics.service';
import { RequestUser } from '../common/interfaces/request-user.interface';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getTransactionSummary(user: RequestUser): Promise<{
        totalTransactions: number;
        totalVolume: number;
        totalFees: number;
        byStatus: Record<string, number>;
    }>;
    getDisputeMetrics(user: RequestUser): Promise<{
        totalDisputes: number;
        disputeRate: number;
        resolvedDisputes: number;
        openDisputes: number;
    }>;
    getRevenueBreakdown(user: RequestUser): Promise<{
        totalRevenue: number;
        releasedRevenue: number;
        pendingRevenue: number;
    }>;
}
