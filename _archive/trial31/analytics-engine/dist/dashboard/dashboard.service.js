"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DashboardService", {
    enumerable: true,
    get: function() {
        return DashboardService;
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
let DashboardService = class DashboardService {
    async create(dto) {
        return this.prisma.dashboard.create({
            data: dto
        });
    }
    async findAll(tenantId) {
        return this.prisma.dashboard.findMany({
            where: tenantId ? {
                tenantId
            } : undefined,
            include: {
                widgets: true
            }
        });
    }
    async findOne(id) {
        return this.prisma.dashboard.findUniqueOrThrow({
            where: {
                id
            },
            include: {
                widgets: true,
                embedConfig: true
            }
        });
    }
    async update(id, dto) {
        return this.prisma.dashboard.update({
            where: {
                id
            },
            data: dto
        });
    }
    async publish(id) {
        return this.prisma.dashboard.update({
            where: {
                id
            },
            data: {
                isPublished: true
            }
        });
    }
    async unpublish(id) {
        return this.prisma.dashboard.update({
            where: {
                id
            },
            data: {
                isPublished: false
            }
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
DashboardService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService
    ])
], DashboardService);

//# sourceMappingURL=dashboard.service.js.map