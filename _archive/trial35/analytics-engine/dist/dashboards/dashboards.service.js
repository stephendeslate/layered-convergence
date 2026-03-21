"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DashboardsService", {
    enumerable: true,
    get: function() {
        return DashboardsService;
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
let DashboardsService = class DashboardsService {
    async create(dto) {
        return this.prisma.dashboard.create({
            data: {
                tenantId: dto.tenantId,
                name: dto.name,
                layout: dto.layout ?? null,
                isPublished: dto.isPublished ?? false
            }
        });
    }
    async findAll(tenantId) {
        return this.prisma.dashboard.findMany({
            where: {
                tenantId
            },
            include: {
                widgets: true
            }
        });
    }
    async findById(id) {
        const dashboard = await this.prisma.dashboard.findUnique({
            where: {
                id
            },
            include: {
                widgets: true,
                embedConfig: true
            }
        });
        if (!dashboard) {
            throw new _common.NotFoundException(`Dashboard ${id} not found`);
        }
        return dashboard;
    }
    async update(id, dto) {
        return this.prisma.dashboard.update({
            where: {
                id
            },
            data: dto
        });
    }
    async remove(id) {
        return this.prisma.dashboard.delete({
            where: {
                id
            }
        });
    }
    constructor(prisma){
        this.prisma = prisma;
    }
};
DashboardsService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DashboardsService);

//# sourceMappingURL=dashboards.service.js.map