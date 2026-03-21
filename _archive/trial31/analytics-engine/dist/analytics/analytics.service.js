"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AnalyticsService", {
    enumerable: true,
    get: function() {
        return AnalyticsService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let AnalyticsService = class AnalyticsService {
    async query(dto) {
        const where = {
            dataSourceId: dto.dataSourceId
        };
        if (dto.startDate || dto.endDate) {
            const timestamp = {};
            if (dto.startDate) timestamp.gte = new Date(dto.startDate);
            if (dto.endDate) timestamp.lte = new Date(dto.endDate);
            where.timestamp = timestamp;
        }
        const dataPoints = await this.prisma.dataPoint.findMany({
            where,
            orderBy: {
                timestamp: 'asc'
            }
        });
        return this.aggregate(dataPoints, dto.granularity || 'day');
    }
    aggregate(dataPoints, granularity) {
        const buckets = new Map();
        for (const dp of dataPoints){
            const period = this.getBucketKey(dp.timestamp, granularity);
            const existing = buckets.get(period) || {
                metrics: {},
                count: 0
            };
            const dpMetrics = dp.metrics;
            for (const [key, value] of Object.entries(dpMetrics)){
                if (typeof value === 'number') {
                    existing.metrics[key] = (existing.metrics[key] || 0) + value;
                }
            }
            existing.count++;
            buckets.set(period, existing);
        }
        return Array.from(buckets.entries()).map(([period, data])=>({
                period,
                metrics: data.metrics
            }));
    }
    getBucketKey(date, granularity) {
        const d = new Date(date);
        switch(granularity){
            case 'hour':
                d.setMinutes(0, 0, 0);
                return d.toISOString();
            case 'day':
                d.setHours(0, 0, 0, 0);
                return d.toISOString().split('T')[0];
            case 'week':
                {
                    const day = d.getDay();
                    d.setDate(d.getDate() - day);
                    d.setHours(0, 0, 0, 0);
                    return d.toISOString().split('T')[0];
                }
            case 'month':
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            default:
                return d.toISOString().split('T')[0];
        }
    }
    async getKpi(dataSourceId) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const dataPoints = await this.prisma.dataPoint.findMany({
            where: {
                dataSourceId,
                timestamp: {
                    gte: thirtyDaysAgo
                }
            }
        });
        const totalMetrics = {};
        for (const dp of dataPoints){
            const dpMetrics = dp.metrics;
            for (const [key, value] of Object.entries(dpMetrics)){
                if (typeof value === 'number') {
                    totalMetrics[key] = (totalMetrics[key] || 0) + value;
                }
            }
        }
        return {
            dataSourceId,
            period: '30d',
            totalDataPoints: dataPoints.length,
            metrics: totalMetrics
        };
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
AnalyticsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], AnalyticsService);

//# sourceMappingURL=analytics.service.js.map