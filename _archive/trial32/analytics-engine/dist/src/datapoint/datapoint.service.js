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
exports.DataPointService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let DataPointService = class DataPointService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, dto) {
        return this.prisma.dataPoint.create({
            data: {
                tenantId,
                dataSourceId: dto.dataSourceId,
                timestamp: new Date(dto.timestamp),
                dimensions: dto.dimensions,
                metrics: dto.metrics,
            },
        });
    }
    async createMany(tenantId, dataSourceId, points) {
        const data = points.map((p) => ({
            tenantId,
            dataSourceId,
            timestamp: p.timestamp,
            dimensions: p.dimensions,
            metrics: p.metrics,
        }));
        return this.prisma.dataPoint.createMany({ data });
    }
    async query(tenantId, query) {
        const where = { tenantId };
        if (query.dataSourceId) {
            where.dataSourceId = query.dataSourceId;
        }
        if (query.startDate || query.endDate) {
            where.timestamp = {};
            if (query.startDate) {
                where.timestamp.gte = new Date(query.startDate);
            }
            if (query.endDate) {
                where.timestamp.lte = new Date(query.endDate);
            }
        }
        const dataPoints = await this.prisma.dataPoint.findMany({
            where,
            orderBy: { timestamp: 'asc' },
        });
        if (query.aggregation && dataPoints.length > 0) {
            return this.aggregate(dataPoints, query.aggregation, query.groupBy);
        }
        return dataPoints;
    }
    aggregate(dataPoints, aggregation, groupBy) {
        if (groupBy) {
            const groups = new Map();
            for (const dp of dataPoints) {
                const key = String(dp.dimensions[groupBy] ?? 'unknown');
                if (!groups.has(key)) {
                    groups.set(key, []);
                }
                groups.get(key).push(dp);
            }
            const result = {};
            for (const [key, points] of groups) {
                result[key] = this.computeAggregation(points, aggregation);
            }
            return result;
        }
        return this.computeAggregation(dataPoints, aggregation);
    }
    computeAggregation(dataPoints, aggregation) {
        const metrics = dataPoints.map((dp) => dp.metrics);
        const allKeys = new Set();
        for (const m of metrics) {
            for (const k of Object.keys(m)) {
                allKeys.add(k);
            }
        }
        const result = {};
        for (const key of allKeys) {
            const values = metrics
                .map((m) => m[key])
                .filter((v) => typeof v === 'number');
            switch (aggregation) {
                case 'sum':
                    result[key] = values.reduce((a, b) => a + b, 0);
                    break;
                case 'avg':
                    result[key] =
                        values.length > 0
                            ? values.reduce((a, b) => a + b, 0) / values.length
                            : 0;
                    break;
                case 'count':
                    result[key] = values.length;
                    break;
                case 'min':
                    result[key] = values.length > 0 ? Math.min(...values) : 0;
                    break;
                case 'max':
                    result[key] = values.length > 0 ? Math.max(...values) : 0;
                    break;
            }
        }
        return result;
    }
};
exports.DataPointService = DataPointService;
exports.DataPointService = DataPointService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], DataPointService);
//# sourceMappingURL=datapoint.service.js.map