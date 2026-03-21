"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataSourceConfigsService", {
    enumerable: true,
    get: function() {
        return DataSourceConfigsService;
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
let DataSourceConfigsService = class DataSourceConfigsService {
    async create(dto) {
        return this.prisma.dataSourceConfig.create({
            data: {
                dataSourceId: dto.dataSourceId,
                connectionConfig: dto.connectionConfig,
                fieldMapping: dto.fieldMapping,
                transformSteps: dto.transformSteps ?? null,
                syncSchedule: dto.syncSchedule
            }
        });
    }
    async findByDataSource(dataSourceId) {
        const config = await this.prisma.dataSourceConfig.findUnique({
            where: {
                dataSourceId
            }
        });
        if (!config) {
            throw new _common.NotFoundException(`Config for DataSource ${dataSourceId} not found`);
        }
        return config;
    }
    async update(dataSourceId, dto) {
        return this.prisma.dataSourceConfig.update({
            where: {
                dataSourceId
            },
            data: {
                ...dto.connectionConfig !== undefined && {
                    connectionConfig: dto.connectionConfig
                },
                ...dto.fieldMapping !== undefined && {
                    fieldMapping: dto.fieldMapping
                },
                ...dto.transformSteps !== undefined && {
                    transformSteps: dto.transformSteps
                },
                ...dto.syncSchedule !== undefined && {
                    syncSchedule: dto.syncSchedule
                }
            }
        });
    }
    async remove(dataSourceId) {
        return this.prisma.dataSourceConfig.delete({
            where: {
                dataSourceId
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
DataSourceConfigsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DataSourceConfigsService);

//# sourceMappingURL=data-source-configs.service.js.map