"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmbedConfigsService", {
    enumerable: true,
    get: function() {
        return EmbedConfigsService;
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
let EmbedConfigsService = class EmbedConfigsService {
    async create(dto) {
        return this.prisma.embedConfig.create({
            data: {
                dashboardId: dto.dashboardId,
                allowedOrigins: dto.allowedOrigins,
                themeOverrides: dto.themeOverrides ?? null
            }
        });
    }
    async findByDashboard(dashboardId) {
        const config = await this.prisma.embedConfig.findUnique({
            where: {
                dashboardId
            }
        });
        if (!config) {
            throw new _common.NotFoundException(`EmbedConfig for Dashboard ${dashboardId} not found`);
        }
        return config;
    }
    async update(dashboardId, dto) {
        return this.prisma.embedConfig.update({
            where: {
                dashboardId
            },
            data: {
                ...dto.allowedOrigins !== undefined && {
                    allowedOrigins: dto.allowedOrigins
                },
                ...dto.themeOverrides !== undefined && {
                    themeOverrides: dto.themeOverrides
                }
            }
        });
    }
    async remove(dashboardId) {
        return this.prisma.embedConfig.delete({
            where: {
                dashboardId
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
EmbedConfigsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], EmbedConfigsService);

//# sourceMappingURL=embed-configs.service.js.map