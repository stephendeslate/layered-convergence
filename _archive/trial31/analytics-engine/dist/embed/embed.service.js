"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EmbedService", {
    enumerable: true,
    get: function() {
        return EmbedService;
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
let EmbedService = class EmbedService {
    async create(dto) {
        return this.prisma.embedConfig.create({
            data: {
                dashboardId: dto.dashboardId,
                allowedOrigins: dto.allowedOrigins || [],
                themeOverrides: dto.themeOverrides || {}
            }
        });
    }
    async findByDashboard(dashboardId) {
        return this.prisma.embedConfig.findUnique({
            where: {
                dashboardId
            },
            include: {
                dashboard: true
            }
        });
    }
    async findOne(id) {
        return this.prisma.embedConfig.findUniqueOrThrow({
            where: {
                id
            },
            include: {
                dashboard: true
            }
        });
    }
    async update(id, dto) {
        return this.prisma.embedConfig.update({
            where: {
                id
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
    async remove(id) {
        return this.prisma.embedConfig.delete({
            where: {
                id
            }
        });
    }
    isOriginAllowed(allowedOrigins, origin) {
        if (allowedOrigins.length === 0) return true;
        return allowedOrigins.includes(origin);
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
EmbedService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], EmbedService);

//# sourceMappingURL=embed.service.js.map