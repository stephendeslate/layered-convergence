"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataPointService", {
    enumerable: true,
    get: function() {
        return DataPointService;
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
let DataPointService = class DataPointService {
    async create(dto) {
        return this.prisma.dataPoint.create({
            data: {
                dataSourceId: dto.dataSourceId,
                timestamp: new Date(dto.timestamp),
                dimensions: dto.dimensions || {},
                metrics: dto.metrics || {}
            }
        });
    }
    async findAll(dataSourceId) {
        return this.prisma.dataPoint.findMany({
            where: dataSourceId ? {
                dataSourceId
            } : undefined,
            orderBy: {
                timestamp: 'desc'
            },
            take: 100
        });
    }
    async findOne(id) {
        return this.prisma.dataPoint.findUniqueOrThrow({
            where: {
                id
            }
        });
    }
    async findByDateRange(dataSourceId, startDate, endDate) {
        return this.prisma.dataPoint.findMany({
            where: {
                dataSourceId,
                timestamp: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });
    }
    async remove(id) {
        return this.prisma.dataPoint.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
DataPointService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DataPointService);

//# sourceMappingURL=data-point.service.js.map