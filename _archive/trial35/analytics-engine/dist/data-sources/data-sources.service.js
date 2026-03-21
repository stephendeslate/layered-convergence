"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataSourcesService", {
    enumerable: true,
    get: function() {
        return DataSourcesService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../prisma/prisma.service");
const _pipelinestatemachine = require("../pipelines/pipeline-state-machine");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let DataSourcesService = class DataSourcesService {
    async create(dto) {
        return this.prisma.dataSource.create({
            data: {
                tenantId: dto.tenantId,
                name: dto.name,
                type: dto.type
            }
        });
    }
    async findAll(tenantId) {
        return this.prisma.dataSource.findMany({
            where: {
                tenantId
            },
            include: {
                dataSourceConfig: true
            }
        });
    }
    async findById(id) {
        const dataSource = await this.prisma.dataSource.findUnique({
            where: {
                id
            },
            include: {
                dataSourceConfig: true,
                syncRuns: {
                    orderBy: {
                        startedAt: 'desc'
                    },
                    take: 10
                }
            }
        });
        if (!dataSource) {
            throw new _common.NotFoundException(`DataSource ${id} not found`);
        }
        return dataSource;
    }
    async updateStatus(id, newStatus) {
        const dataSource = await this.findById(id);
        (0, _pipelinestatemachine.validatePipelineTransition)(dataSource.pipelineStatus, newStatus);
        return this.prisma.dataSource.update({
            where: {
                id
            },
            data: {
                pipelineStatus: newStatus
            }
        });
    }
    async update(id, dto) {
        if (dto.pipelineStatus) {
            return this.updateStatus(id, dto.pipelineStatus);
        }
        return this.prisma.dataSource.update({
            where: {
                id
            },
            data: {
                name: dto.name
            }
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
DataSourcesService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DataSourcesService);

//# sourceMappingURL=data-sources.service.js.map