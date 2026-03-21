"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DataSourceConfigService", {
    enumerable: true,
    get: function() {
        return DataSourceConfigService;
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
let DataSourceConfigService = class DataSourceConfigService {
    async create(dto) {
        return this.prisma.dataSourceConfig.create({
            data: dto
        });
    }
    async findByDataSource(dataSourceId) {
        return this.prisma.dataSourceConfig.findUnique({
            where: {
                dataSourceId
            }
        });
    }
    async findOne(id) {
        return this.prisma.dataSourceConfig.findUniqueOrThrow({
            where: {
                id
            }
        });
    }
    async update(id, dto) {
        return this.prisma.dataSourceConfig.update({
            where: {
                id
            },
            data: dto
        });
    }
    async remove(id) {
        return this.prisma.dataSourceConfig.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
DataSourceConfigService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DataSourceConfigService);

//# sourceMappingURL=data-source-config.service.js.map