"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataSourceService", {
    enumerable: true,
    get: function() {
        return DataSourceService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
const _transitions = require("../common/constants/transitions");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DataSourceService = class DataSourceService {
    async create(dto) {
        return this.prisma.dataSource.create({
            data: dto
        });
    }
    async findAll(tenantId) {
        return this.prisma.dataSource.findMany({
            where: tenantId ? {
                tenantId
            } : undefined,
            include: {
                dataSourceConfig: true
            }
        });
    }
    async findOne(id) {
        return this.prisma.dataSource.findUniqueOrThrow({
            where: {
                id
            },
            include: {
                dataSourceConfig: true,
                syncRuns: {
                    take: 10,
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
    }
    async update(id, dto) {
        if (dto.status) {
            const current = await this.prisma.dataSource.findUniqueOrThrow({
                where: {
                    id
                }
            });
            const allowed = _transitions.DATA_SOURCE_TRANSITIONS[current.status] || [];
            if (!allowed.includes(dto.status)) {
                throw new _common.BadRequestException(`Invalid status transition from '${current.status}' to '${dto.status}'`);
            }
        }
        return this.prisma.dataSource.update({
            where: {
                id
            },
            data: dto
        });
    }
    async remove(id) {
        return this.prisma.dataSource.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
DataSourceService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DataSourceService);

//# sourceMappingURL=data-source.service.js.map