"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "IngestionService", {
    enumerable: true,
    get: function() {
        return IngestionService;
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
let IngestionService = class IngestionService {
    async ingestWebhook(dataSourceId, dto) {
        const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
            where: {
                id: dataSourceId
            }
        });
        if (dataSource.type !== 'webhook') {
            throw new _common.BadRequestException('Data source is not a webhook type');
        }
        if (dataSource.status !== 'active') {
            throw new _common.BadRequestException('Data source is not active');
        }
        try {
            return await this.prisma.dataPoint.create({
                data: {
                    dataSourceId,
                    timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
                    dimensions: dto.dimensions || {},
                    metrics: dto.metrics || {}
                }
            });
        } catch (error) {
            await this.prisma.deadLetterEvent.create({
                data: {
                    dataSourceId,
                    payload: dto,
                    errorReason: error instanceof Error ? error.message : 'Unknown error'
                }
            });
            throw error;
        }
    }
    async ingestBatch(dataSourceId, events) {
        const dataSource = await this.prisma.dataSource.findUniqueOrThrow({
            where: {
                id: dataSourceId
            }
        });
        if (dataSource.status !== 'active') {
            throw new _common.BadRequestException('Data source is not active');
        }
        const results = {
            ingested: 0,
            failed: 0,
            errors: []
        };
        for (const event of events){
            try {
                await this.prisma.dataPoint.create({
                    data: {
                        dataSourceId,
                        timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
                        dimensions: event.dimensions || {},
                        metrics: event.metrics || {}
                    }
                });
                results.ingested++;
            } catch (error) {
                results.failed++;
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                results.errors.push(errorMsg);
                await this.prisma.deadLetterEvent.create({
                    data: {
                        dataSourceId,
                        payload: event,
                        errorReason: errorMsg
                    }
                });
            }
        }
        return results;
    }
    async transform(data, steps) {
        let result = {
            ...data
        };
        for (const step of steps){
            const s = step;
            switch(s.type){
                case 'rename':
                    {
                        const { from, to } = s.config;
                        if (from in result) {
                            result[to] = result[from];
                            delete result[from];
                        }
                        break;
                    }
                case 'cast':
                    {
                        const { field, targetType } = s.config;
                        if (field in result) {
                            if (targetType === 'number') result[field] = Number(result[field]);
                            if (targetType === 'string') result[field] = String(result[field]);
                            if (targetType === 'boolean') result[field] = Boolean(result[field]);
                        }
                        break;
                    }
                case 'filter':
                    {
                        const { field, operator, value } = s.config;
                        const fieldVal = result[field];
                        if (operator === 'eq' && fieldVal !== value) return {};
                        if (operator === 'neq' && fieldVal === value) return {};
                        if (operator === 'gt' && typeof fieldVal === 'number' && fieldVal <= value) return {};
                        if (operator === 'lt' && typeof fieldVal === 'number' && fieldVal >= value) return {};
                        break;
                    }
                case 'derive':
                    {
                        const { field, expression } = s.config;
                        if (expression.includes('+')) {
                            const parts = expression.split('+').map((p)=>p.trim());
                            const nums = parts.map((p)=>Number(result[p]) || 0);
                            result[field] = nums.reduce((a, b)=>a + b, 0);
                        }
                        break;
                    }
                default:
                    break;
            }
        }
        return result;
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
IngestionService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], IngestionService);

//# sourceMappingURL=ingestion.service.js.map