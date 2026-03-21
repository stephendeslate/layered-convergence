"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTransactionSummary(tenantId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { tenantId },
        });
        const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
        const totalFees = transactions.reduce((sum, t) => sum + t.platformFee, 0);
        const byStatus = {};
        for (const t of transactions) {
            byStatus[t.status] = (byStatus[t.status] || 0) + 1;
        }
        return {
            totalTransactions: transactions.length,
            totalVolume,
            totalFees,
            byStatus,
        };
    }
    async getDisputeMetrics(tenantId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { tenantId },
            include: { disputes: true },
        });
        const totalTransactions = transactions.length;
        const disputedTransactions = transactions.filter((t) => t.status === client_1.TransactionStatus.DISPUTED || t.disputes.length > 0).length;
        const disputes = transactions.flatMap((t) => t.disputes);
        const resolvedDisputes = disputes.filter((d) => d.status === 'RESOLVED_BUYER' || d.status === 'RESOLVED_PROVIDER').length;
        return {
            totalDisputes: disputes.length,
            disputeRate: totalTransactions > 0 ? disputedTransactions / totalTransactions : 0,
            resolvedDisputes,
            openDisputes: disputes.length - resolvedDisputes,
        };
    }
    async getRevenueBreakdown(tenantId) {
        const transactions = await this.prisma.transaction.findMany({
            where: {
                tenantId,
                status: { in: [client_1.TransactionStatus.RELEASED, client_1.TransactionStatus.HELD] },
            },
        });
        const totalRevenue = transactions.reduce((sum, t) => sum + t.platformFee, 0);
        const releasedRevenue = transactions
            .filter((t) => t.status === client_1.TransactionStatus.RELEASED)
            .reduce((sum, t) => sum + t.platformFee, 0);
        const pendingRevenue = transactions
            .filter((t) => t.status === client_1.TransactionStatus.HELD)
            .reduce((sum, t) => sum + t.platformFee, 0);
        return {
            totalRevenue,
            releasedRevenue,
            pendingRevenue,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map