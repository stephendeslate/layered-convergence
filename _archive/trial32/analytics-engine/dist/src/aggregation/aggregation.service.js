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
exports.AggregationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const aggregation_query_dto_js_1 = require("./dto/aggregation-query.dto.js");
let AggregationService = class AggregationService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async aggregate(tenantId, dataSourceId, bucket, startDate, endDate, metricKey) {
        const where = { tenantId, dataSourceId };
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) {
                where.timestamp.gte = new Date(startDate);
            }
            if (endDate) {
                where.timestamp.lte = new Date(endDate);
            }
        }
        const dataPoints = await this.prisma.dataPoint.findMany({
            where,
            orderBy: { timestamp: 'asc' },
        });
        return this.bucketize(dataPoints, bucket, metricKey);
    }
    bucketize(dataPoints, bucket, metricKey) {
        const buckets = new Map();
        for (const dp of dataPoints) {
            const key = this.getBucketKey(new Date(dp.timestamp), bucket);
            if (!buckets.has(key)) {
                buckets.set(key, []);
            }
            buckets.get(key).push(dp);
        }
        const result = [];
        for (const [bucketKey, points] of buckets) {
            const aggregated = this.sumMetrics(points, metricKey);
            result.push({ bucket: bucketKey, metrics: aggregated });
        }
        return result;
    }
    getBucketKey(date, bucket) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        switch (bucket) {
            case aggregation_query_dto_js_1.TimeBucket.HOURLY:
                return `${year}-${month}-${day}T${hour}:00`;
            case aggregation_query_dto_js_1.TimeBucket.DAILY:
                return `${year}-${month}-${day}`;
            case aggregation_query_dto_js_1.TimeBucket.WEEKLY: {
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay());
                const wy = startOfWeek.getFullYear();
                const wm = String(startOfWeek.getMonth() + 1).padStart(2, '0');
                const wd = String(startOfWeek.getDate()).padStart(2, '0');
                return `${wy}-${wm}-${wd}`;
            }
        }
    }
    sumMetrics(dataPoints, metricKey) {
        const result = {};
        for (const dp of dataPoints) {
            const metrics = dp.metrics;
            for (const [key, value] of Object.entries(metrics)) {
                if (metricKey && key !== metricKey) {
                    continue;
                }
                if (typeof value === 'number') {
                    result[key] = (result[key] ?? 0) + value;
                }
            }
        }
        return result;
    }
};
exports.AggregationService = AggregationService;
exports.AggregationService = AggregationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], AggregationService);
//# sourceMappingURL=aggregation.service.js.map